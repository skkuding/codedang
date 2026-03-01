package main

import (
	"context"
	"errors"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/gorilla/websocket"
	corev1 "k8s.io/api/core/v1"
	k8serrors "k8s.io/apimachinery/pkg/api/errors"
	"k8s.io/apimachinery/pkg/api/resource"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/types"
	"k8s.io/apimachinery/pkg/util/intstr"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/rest"
)

const (
	RunnerImageTag         = "RUNNER_IMAGE_TAG"
	RunnerNamespace        = "runner"
	SharedLeaseTTLSeconds  = 200
)

type RunnerPod struct {
	Name       string
	IP         string
	NodePoolID string
	LeaseToken string
	CreatedAt  time.Time
	LastUsedAt time.Time
}

type RunnerNodePool struct {
	NodePoolID string
	MaxPods    int
}

type PodManager struct {
	clientset       *kubernetes.Clientset
	logger          *log.Logger
	namespace       string
	imageTag        string
	targetPoolSize  int
	leaseTimeout    time.Duration
	readyTimeout    time.Duration
	nodeSelectorKey string
	nodePools       []RunnerNodePool
	nextNodePoolIdx int

	mu       sync.Mutex
	busyPods map[string]*RunnerPod

	managerPodName string
	managerPodUID  string
	stateStore     RunnerStateStore
	sharedLeaseTTL time.Duration
}

func NewPodManager(clientset *kubernetes.Clientset) (*PodManager, error) {
	logger := log.New(os.Stdout, "[Pod Manager] ", log.LstdFlags)
	imageTag := os.Getenv(RunnerImageTag)
	if imageTag == "" {
		return nil, fmt.Errorf("environment variable %s is not set", RunnerImageTag)
	}

	poolSize := envInt("RUNNER_POOL_SIZE", 10)
	if poolSize < 1 {
		poolSize = 1
	}

	leaseTimeoutSec := envInt("RUNNER_LEASE_TIMEOUT_SEC", 3)
	if leaseTimeoutSec < 1 {
		leaseTimeoutSec = 1
	}

	readyTimeoutSec := envInt("RUNNER_READY_TIMEOUT_SEC", 90)
	if readyTimeoutSec < 10 {
		readyTimeoutSec = 10
	}
	nodeSelectorKey, nodePools, err := loadRunnerNodePools(poolSize)
	if err != nil {
		return nil, err
	}
	if len(nodePools) > 0 {
		totalCap := 0
		for _, pool := range nodePools {
			totalCap += pool.MaxPods
		}
		if poolSize > totalCap {
			logger.Printf(
				"RUNNER_POOL_SIZE=%d exceeds RUNNER_NODE_POD_COUNTS total=%d, clamping pool size",
				poolSize,
				totalCap,
			)
			poolSize = totalCap
		}
	}

	pm := &PodManager{
		clientset:       clientset,
		logger:          logger,
		namespace:       RunnerNamespace,
		imageTag:        imageTag,
		targetPoolSize:  poolSize,
		leaseTimeout:    time.Duration(leaseTimeoutSec) * time.Second,
		readyTimeout:    time.Duration(readyTimeoutSec) * time.Second,
		nodeSelectorKey: nodeSelectorKey,
		nodePools:       nodePools,
		busyPods:        make(map[string]*RunnerPod),
		managerPodName:  strings.TrimSpace(os.Getenv("HOSTNAME")),
		sharedLeaseTTL:  time.Duration(SharedLeaseTTLSeconds) * time.Second,
	}

	pm.stateStore = NewRunnerStateStoreFromEnv(logger)
	if !pm.useGlobalRedisScheduler() {
		return nil, errors.New("redis state store must be enabled in redis-only mode")
	}
	if len(pm.nodePools) == 0 {
		return nil, errors.New("RUNNER_NODE_SELECTOR_KEY and RUNNER_NODE_POD_COUNTS are required in redis-only mode")
	}
	pm.initManagerIdentity()
	return pm, nil
}

func envInt(key string, fallback int) int {
	value := os.Getenv(key)
	if value == "" {
		return fallback
	}

	parsed, err := strconv.Atoi(value)
	if err != nil {
		return fallback
	}

	return parsed
}

func loadRunnerNodePools(defaultPoolSize int) (string, []RunnerNodePool, error) {
	selectorKey := strings.TrimSpace(os.Getenv("RUNNER_NODE_SELECTOR_KEY"))
	if selectorKey == "" {
		return "", nil, nil
	}

	rawPodCounts := strings.TrimSpace(os.Getenv("RUNNER_NODE_POD_COUNTS"))
	if rawPodCounts != "" {
		pools := make([]RunnerNodePool, 0)
		for _, item := range strings.Split(rawPodCounts, ",") {
			item = strings.TrimSpace(item)
			if item == "" {
				continue
			}

			parts := strings.SplitN(item, "=", 2)
			if len(parts) != 2 {
				return "", nil, fmt.Errorf(
					"invalid RUNNER_NODE_POD_COUNTS entry %q (expected nodePoolID=maxPods)",
					item,
				)
			}

			value := strings.TrimSpace(parts[0])
			if value == "" {
				return "", nil, fmt.Errorf("invalid RUNNER_NODE_POD_COUNTS entry %q: empty nodePoolID", item)
			}

			maxPods, err := strconv.Atoi(strings.TrimSpace(parts[1]))
			if err != nil || maxPods < 1 {
				return "", nil, fmt.Errorf("invalid RUNNER_NODE_POD_COUNTS entry %q: maxPods must be >= 1", item)
			}

			pools = append(pools, RunnerNodePool{
				NodePoolID: value,
				MaxPods:    maxPods,
			})
		}

		if len(pools) == 0 {
			return "", nil, fmt.Errorf("RUNNER_NODE_POD_COUNTS is set but no valid node pools were parsed")
		}

		return selectorKey, pools, nil
	}

	singleValue := strings.TrimSpace(os.Getenv("RUNNER_NODE_SELECTOR_VALUE"))
	if singleValue == "" {
		return "", nil, fmt.Errorf(
			"RUNNER_NODE_SELECTOR_KEY is set but neither RUNNER_NODE_POD_COUNTS nor RUNNER_NODE_SELECTOR_VALUE is set",
		)
	}

	return selectorKey, []RunnerNodePool{{
		NodePoolID: singleValue,
		MaxPods:    defaultPoolSize,
	}}, nil
}

func (pm *PodManager) startWarmPool() {
	pm.reconcileManagedRunnerPods()
	pm.ensurePool()

	ticker := time.NewTicker(5 * time.Second)
	go func() {
		for range ticker.C {
			pm.ensurePool()
		}
	}()
	pm.startSharedStateMaintenanceLoops()
}

func (pm *PodManager) startSharedStateMaintenanceLoops() {
	reconcileTicker := time.NewTicker(15 * time.Second)
	go func() {
		for range reconcileTicker.C {
			pm.reconcileRunnerSharedState()
		}
	}()

	reaperTicker := time.NewTicker(10 * time.Second)
	go func() {
		for range reaperTicker.C {
			pm.reapOrphanLeases()
		}
	}()
}

func (pm *PodManager) initManagerIdentity() {
	if pm.managerPodName == "" {
		pm.logger.Printf("HOSTNAME is empty, owner references are disabled")
		return
	}

	pod, err := pm.clientset.CoreV1().Pods(pm.namespace).Get(
		context.Background(),
		pm.managerPodName,
		metav1.GetOptions{},
	)
	if err != nil {
		pm.logger.Printf("Failed to load manager pod identity (%s): %v", pm.managerPodName, err)
		return
	}

	pm.managerPodUID = string(pod.UID)
}

func (pm *PodManager) reconcileManagedRunnerPods() {
	activeManagerUIDs := make(map[string]struct{})

	managerPods, err := pm.clientset.CoreV1().Pods(pm.namespace).List(
		context.Background(),
		metav1.ListOptions{LabelSelector: "app=pod-manager"},
	)
	if err != nil {
		pm.logger.Printf("Failed to list pod-manager pods for reconcile: %v", err)
		return
	}

	for _, pod := range managerPods.Items {
		if pod.DeletionTimestamp != nil {
			continue
		}
		activeManagerUIDs[string(pod.UID)] = struct{}{}
	}

	runnerPods, err := pm.clientset.CoreV1().Pods(pm.namespace).List(
		context.Background(),
		metav1.ListOptions{LabelSelector: "managed-by=runner-pod-manager"},
	)
	if err != nil {
		pm.logger.Printf("Failed to list managed runner pods for reconcile: %v", err)
		return
	}

	for _, pod := range runnerPods.Items {
		if pod.DeletionTimestamp != nil {
			continue
		}

		ownerUID := runnerOwnerPodUID(&pod)
		_, ownerAlive := activeManagerUIDs[ownerUID]

		shouldDelete := false
		reason := ""

		switch {
		case ownerUID == "":
			shouldDelete = true
			reason = "legacy runner without ownerReference"
		case pm.managerPodUID != "" && ownerUID == pm.managerPodUID:
			shouldDelete = true
			reason = "runner owned by current pod-manager from previous process state"
		case !ownerAlive:
			shouldDelete = true
			reason = "runner owned by deleted pod-manager"
		}

		if !shouldDelete {
			continue
		}

		if err := pm.deleteRunnerPod(pod.Name); err != nil {
			pm.logger.Printf("Failed to delete reconciled runner pod %s: %v", pod.Name, err)
			continue
		}
		pm.logger.Printf("Reconciled runner pod %s (%s)", pod.Name, reason)
	}
}

func runnerOwnerPodUID(pod *corev1.Pod) string {
	for _, ref := range pod.OwnerReferences {
		if ref.APIVersion == "v1" && ref.Kind == "Pod" {
			return string(ref.UID)
		}
	}
	return ""
}

func (pm *PodManager) ensurePool() {
	if !pm.useGlobalRedisScheduler() {
		pm.logger.Printf("Redis state store is unavailable; skipping ensurePool in redis-only mode")
		return
	}
	pm.ensurePoolGlobal()
}

func (pm *PodManager) ensurePoolGlobal() {
	snapshot, err := pm.stateStore.GetClusterSnapshot(context.Background(), pm.nodePools)
	if err != nil {
		pm.logger.Printf("Failed to read shared snapshot for ensurePool: %v", err)
		return
	}

	currentTotal := int(snapshot.TotalIdle + snapshot.TotalLeased + snapshot.TotalProvisioning + snapshot.TotalReserved)
	missing := pm.targetPoolSize - currentTotal
	if missing <= 0 {
		return
	}

	nodeSelections := make([]string, 0, missing)
	for i := 0; i < missing; i++ {
		nodeValue, ok := pm.reserveProvisioningSlotGlobal(snapshot)
		if !ok {
			break
		}
		nodeSelections = append(nodeSelections, nodeValue)
	}

	if len(nodeSelections) == 0 {
		pm.logger.Printf("No global node pool has free capacity (target=%d current=%d)", pm.targetPoolSize, currentTotal)
		return
	}

	for _, nodeValue := range nodeSelections {
		go pm.provisionOnePod(nodeValue)
	}
}

func (pm *PodManager) reserveProvisioningSlotGlobal(snapshot *RunnerClusterSnapshot) (string, bool) {
	if snapshot == nil || len(pm.nodePools) == 0 {
		return "", false
	}

	// Pick the least-loaded node pool using shared global counts (including reservations),
	// then reserve atomically in Redis to prevent races across pod-manager replicas.
	type candidate struct {
		index   int
		nodeID  string
		current int64
		cap     int
	}
	candidates := make([]candidate, 0, len(pm.nodePools))
	for idx, pool := range pm.nodePools {
		counts := snapshot.NodePoolCounts[pool.NodePoolID]
		current := counts.Idle + counts.Leased + counts.Provisioning + counts.Reserved
		if current >= int64(pool.MaxPods) {
			continue
		}
		candidates = append(candidates, candidate{
			index:   idx,
			nodeID:  pool.NodePoolID,
			current: current,
			cap:     pool.MaxPods,
		})
	}
	if len(candidates) == 0 {
		return "", false
	}

	// Stable least-loaded selection with round-robin tie-break using nextNodePoolIdx.
	pm.mu.Lock()
	start := pm.nextNodePoolIdx
	pm.mu.Unlock()
	best := candidates[0]
	bestOffset := (best.index - start + len(pm.nodePools)) % len(pm.nodePools)
	for _, c := range candidates[1:] {
		offset := (c.index - start + len(pm.nodePools)) % len(pm.nodePools)
		if c.current < best.current || (c.current == best.current && offset < bestOffset) {
			best = c
			bestOffset = offset
		}
	}

	ok, err := pm.stateStore.TryReserveProvisioningSlot(
		context.Background(),
		pm.targetPoolSize,
		best.nodeID,
		best.cap,
	)
	if err != nil {
		pm.logger.Printf("Failed to reserve global provisioning slot on %s: %v", best.nodeID, err)
		return "", false
	}
	if !ok {
		// Another manager won the race; refresh local snapshot view cheaply and let caller retry.
		return "", false
	}

	pm.mu.Lock()
	pm.nextNodePoolIdx = (best.index + 1) % len(pm.nodePools)
	pm.mu.Unlock()
	counts := snapshot.NodePoolCounts[best.nodeID]
	counts.Reserved++
	snapshot.NodePoolCounts[best.nodeID] = counts
	snapshot.TotalReserved++
	return best.nodeID, true
}

func (pm *PodManager) releaseProvisioningSlot(nodeValue string) {
	if nodeValue == "" {
		return
	}
	if err := pm.stateStore.ReleaseProvisioningSlotReservation(context.Background(), nodeValue); err != nil {
		pm.logger.Printf("Failed to release global provisioning reservation (%s): %v", nodeValue, err)
	}
}

func (pm *PodManager) provisionOnePod(nodeValue string) {
	defer func() {
		pm.releaseProvisioningSlot(nodeValue)
	}()

	pod, err := pm.createAndWaitRunnerPod(nodeValue)
	if err != nil {
		pm.logger.Printf("Failed to provision warm pod: %v", err)
		return
	}

	pm.syncRunnerSharedState(pod, RunnerStateIdle)
	pm.logger.Printf("Warm pod ready: %s (%s)", pod.Name, pod.IP)
}

func (pm *PodManager) createAndWaitRunnerPod(nodeValue string) (*RunnerPod, error) {
	pod, err := pm.createRunnerPod(nodeValue)
	if err != nil {
		return nil, err
	}

	podIP, err := pm.waitForPodReady(pod.Name)
	if err != nil {
		pm.logger.Printf("Pod %s failed warm-up: %v", pod.Name, err)
		_ = pm.deleteRunnerPod(pod.Name)
		return nil, err
	}

	pod.IP = podIP
	return pod, nil
}

func (pm *PodManager) createRunnerPod(nodeValue string) (*RunnerPod, error) {
	privileged := true

	pod := &corev1.Pod{
		ObjectMeta: metav1.ObjectMeta{
			GenerateName: "runner-",
			Labels: map[string]string{
				"app":        "runner",
				"managed-by": "runner-pod-manager",
			},
		},
		Spec: corev1.PodSpec{
			Containers: []corev1.Container{
				{
					Name:            "runner",
					Image:           fmt.Sprintf("%s:%s", "ghcr.io/skkuding/codedang-runner", pm.imageTag),
					ImagePullPolicy: corev1.PullIfNotPresent,
					Ports: []corev1.ContainerPort{
						{ContainerPort: 8000},
					},
					SecurityContext: &corev1.SecurityContext{Privileged: &privileged},
					Resources: corev1.ResourceRequirements{
						Limits: corev1.ResourceList{
							corev1.ResourceCPU:    resource.MustParse("500m"),
							corev1.ResourceMemory: resource.MustParse("512Mi"),
						},
						Requests: corev1.ResourceList{
							corev1.ResourceCPU:    resource.MustParse("250m"),
							corev1.ResourceMemory: resource.MustParse("512Mi"),
						},
					},
					ReadinessProbe: &corev1.Probe{
						ProbeHandler: corev1.ProbeHandler{
							HTTPGet: &corev1.HTTPGetAction{
								Path: "/healthz",
								Port: intstr.FromInt(8000),
							},
						},
						InitialDelaySeconds: 1,
						PeriodSeconds:       1,
						TimeoutSeconds:      1,
						FailureThreshold:    5,
					},
					LivenessProbe: &corev1.Probe{
						ProbeHandler: corev1.ProbeHandler{
							HTTPGet: &corev1.HTTPGetAction{
								Path: "/healthz",
								Port: intstr.FromInt(8000),
							},
						},
						InitialDelaySeconds: 10,
						PeriodSeconds:       10,
						TimeoutSeconds:      1,
						FailureThreshold:    3,
					},
				},
			},
			RestartPolicy: corev1.RestartPolicyNever,
		},
	}
	if pm.nodeSelectorKey != "" && nodeValue != "" {
		pod.Spec.NodeSelector = map[string]string{
			pm.nodeSelectorKey: nodeValue,
		}
		pod.ObjectMeta.Labels["runner-node-pool"] = nodeValue
	}

	if pm.managerPodUID != "" && pm.managerPodName != "" {
		controller := true
		blockOwnerDeletion := false
		pod.ObjectMeta.OwnerReferences = []metav1.OwnerReference{
			{
				APIVersion:         "v1",
				Kind:               "Pod",
				Name:               pm.managerPodName,
				UID:                types.UID(pm.managerPodUID),
				Controller:         &controller,
				BlockOwnerDeletion: &blockOwnerDeletion,
			},
		}
	}

	created, err := pm.clientset.CoreV1().Pods(pm.namespace).Create(
		context.Background(),
		pod,
		metav1.CreateOptions{},
	)
	if err != nil {
		return nil, fmt.Errorf("failed to create pod: %w", err)
	}

	pm.logger.Printf("Created runner pod: %s", created.Name)
	runnerPod := &RunnerPod{
		Name:       created.Name,
		NodePoolID: nodeValue,
		CreatedAt:  time.Now(),
	}
	pm.syncRunnerSharedState(runnerPod, RunnerStateProvisioning)
	return runnerPod, nil
}

func (pm *PodManager) waitForPodReady(podName string) (string, error) {
	ctx, cancel := context.WithTimeout(context.Background(), pm.readyTimeout)
	defer cancel()

	ticker := time.NewTicker(1 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			pod, err := pm.clientset.CoreV1().Pods(pm.namespace).Get(context.Background(), podName, metav1.GetOptions{})
			if err != nil {
				return "", fmt.Errorf("timeout waiting for pod %s to be ready: %w", podName, ctx.Err())
			}
			return "", fmt.Errorf("timeout waiting for pod %s to be ready (phase=%s)", podName, pod.Status.Phase)

		case <-ticker.C:
			pod, err := pm.clientset.CoreV1().Pods(pm.namespace).Get(context.Background(), podName, metav1.GetOptions{})
			if err != nil {
				return "", fmt.Errorf("failed to get pod status: %w", err)
			}

			if pod.Status.Phase == corev1.PodFailed || pod.Status.Phase == corev1.PodSucceeded {
				return "", fmt.Errorf("pod %s is in terminal state: %s", podName, pod.Status.Phase)
			}

			if pod.Status.Phase != corev1.PodRunning {
				continue
			}

			if pod.Status.PodIP == "" {
				continue
			}

			allReady := true
			for _, status := range pod.Status.ContainerStatuses {
				if !status.Ready {
					allReady = false
					break
				}
			}

			if allReady {
				return pod.Status.PodIP, nil
			}
		}
	}
}

func (pm *PodManager) deleteRunnerPod(podName string) error {
	err := pm.clientset.CoreV1().Pods(pm.namespace).Delete(
		context.Background(),
		podName,
		metav1.DeleteOptions{},
	)
	if err != nil {
		return fmt.Errorf("failed to delete pod %s: %w", podName, err)
	}

	pm.logger.Printf("Deleted runner pod: %s", podName)
	pm.deleteRunnerSharedState(podName)
	return nil
}

func (pm *PodManager) leasePod() (*RunnerPod, error) {
	return pm.leasePodFromSharedPool()
}

func (pm *PodManager) useGlobalRedisScheduler() bool {
	return pm.stateStore != nil && pm.stateStore.Enabled()
}

func (pm *PodManager) leasePodFromSharedPool() (*RunnerPod, error) {
	deadline := time.Now().Add(pm.leaseTimeout)
	for {
		if time.Now().After(deadline) {
			return nil, errors.New("global warm pod pool exhausted")
		}

		lease, err := pm.stateStore.AcquireIdleRunnerLease(
			context.Background(),
			pm.managerPodName,
			pm.managerPodUID,
			pm.sharedLeaseTTL,
		)
		if err != nil {
			return nil, fmt.Errorf("shared lease acquire failed: %w", err)
		}
		if lease == nil {
			time.Sleep(50 * time.Millisecond)
			continue
		}

		pod, err := pm.loadLeasedRunnerPod(lease)
		if err != nil {
			pm.logger.Printf("Discarding leased runner %s after validation failure: %v", lease.Record.PodName, err)
			_ = pm.deleteRunnerPod(lease.Record.PodName)
			time.Sleep(25 * time.Millisecond)
			continue
		}

		pm.mu.Lock()
		pm.busyPods[pod.Name] = pod
		pm.mu.Unlock()
		return pod, nil
	}
}

func (pm *PodManager) loadLeasedRunnerPod(lease *RunnerLease) (*RunnerPod, error) {
	if lease == nil {
		return nil, errors.New("nil lease")
	}

	pod, err := pm.clientset.CoreV1().Pods(pm.namespace).Get(
		context.Background(),
		lease.Record.PodName,
		metav1.GetOptions{},
	)
	if err != nil {
		return nil, fmt.Errorf("get leased pod: %w", err)
	}
	if pod.DeletionTimestamp != nil {
		return nil, errors.New("leased pod is deleting")
	}
	if pod.Status.Phase != corev1.PodRunning || pod.Status.PodIP == "" {
		return nil, fmt.Errorf("leased pod not ready (phase=%s)", pod.Status.Phase)
	}
	for _, status := range pod.Status.ContainerStatuses {
		if !status.Ready {
			return nil, errors.New("leased pod container not ready")
		}
	}

	nodePoolID := pod.Labels["runner-node-pool"]
	return &RunnerPod{
		Name:       pod.Name,
		IP:         pod.Status.PodIP,
		NodePoolID: nodePoolID,
		LeaseToken: lease.LeaseToken,
		CreatedAt:  time.Now(),
	}, nil
}

func (pm *PodManager) releasePod(pod *RunnerPod, forceReplace bool) {
	pm.mu.Lock()
	delete(pm.busyPods, pod.Name)
	pm.mu.Unlock()

	if !forceReplace && pm.isPodReusable(pod.Name) {
		ok, err := pm.stateStore.ReleaseRunnerLease(
			context.Background(),
			pod.Name,
			pod.LeaseToken,
			RunnerStateIdle,
		)
		if err == nil && ok {
			return
		}
		if err != nil {
			pm.logger.Printf("Failed to release shared lease for %s: %v", pod.Name, err)
		} else {
			pm.logger.Printf("Shared lease release rejected for %s; replacing pod", pod.Name)
		}
	}

	if err := pm.deleteRunnerPod(pod.Name); err != nil {
		pm.logger.Printf("Failed to delete pod %s: %v", pod.Name, err)
	}
	pm.ensurePool()
}

func (pm *PodManager) isPodReusable(podName string) bool {
	pod, err := pm.clientset.CoreV1().Pods(pm.namespace).Get(
		context.Background(),
		podName,
		metav1.GetOptions{},
	)
	if err != nil {
		pm.logger.Printf("Pod %s cannot be checked for reuse: %v", podName, err)
		return false
	}

	if pod.DeletionTimestamp != nil {
		return false
	}
	if pod.Status.Phase != corev1.PodRunning {
		return false
	}
	if pod.Status.PodIP == "" {
		return false
	}
	for _, status := range pod.Status.ContainerStatuses {
		if !status.Ready {
			return false
		}
	}

	return true
}

func (pm *PodManager) isPodReady(pod *corev1.Pod) bool {
	if pod == nil || pod.DeletionTimestamp != nil {
		return false
	}
	if pod.Status.Phase != corev1.PodRunning || pod.Status.PodIP == "" {
		return false
	}
	for _, status := range pod.Status.ContainerStatuses {
		if !status.Ready {
			return false
		}
	}
	return true
}

func (pm *PodManager) reconcileRunnerSharedState() {
	if !pm.useGlobalRedisScheduler() {
		return
	}

	ctx := context.Background()
	k8sRunnerPods, err := pm.clientset.CoreV1().Pods(pm.namespace).List(
		ctx,
		metav1.ListOptions{LabelSelector: "managed-by=runner-pod-manager"},
	)
	if err != nil {
		pm.logger.Printf("Shared reconcile: failed to list runner pods: %v", err)
		return
	}

	redisRecords, err := pm.stateStore.ListRunnersByStates(
		ctx,
		RunnerStateIdle,
		RunnerStateLeased,
		RunnerStateProvisioning,
	)
	if err != nil {
		pm.logger.Printf("Shared reconcile: failed to list redis runners: %v", err)
		return
	}

	redisByPod := make(map[string]RunnerStateRecord, len(redisRecords))
	for _, rec := range redisRecords {
		redisByPod[rec.PodName] = rec
	}

	k8sSeen := make(map[string]struct{}, len(k8sRunnerPods.Items))
	for _, pod := range k8sRunnerPods.Items {
		if pod.DeletionTimestamp != nil {
			pm.deleteRunnerSharedState(pod.Name)
			k8sSeen[pod.Name] = struct{}{}
			continue
		}

		k8sSeen[pod.Name] = struct{}{}
		existing, hasExisting := redisByPod[pod.Name]
		desiredState := RunnerStateProvisioning
		if hasExisting && existing.State == RunnerStateLeased {
			desiredState = RunnerStateLeased
		} else if pm.isPodReady(&pod) {
			desiredState = RunnerStateIdle
		}

			record := RunnerStateRecord{
				PodName:     pod.Name,
				NodePoolID:  pod.Labels["runner-node-pool"],
				PodIP:       pod.Status.PodIP,
				State:       desiredState,
				OwnerPod:    existing.OwnerPod,
			OwnerPodUID: existing.OwnerPodUID,
			LeaseToken:  existing.LeaseToken,
			UpdatedAt:   time.Now(),
		}
		if desiredState != RunnerStateLeased {
			record.LeaseToken = ""
		}
		if err := pm.stateStore.UpsertRunner(ctx, record); err != nil {
			pm.logger.Printf("Shared reconcile: failed to upsert %s: %v", pod.Name, err)
		}
	}

	for _, rec := range redisRecords {
		if _, ok := k8sSeen[rec.PodName]; ok {
			continue
		}
		if err := pm.stateStore.DeleteRunner(ctx, rec.PodName); err != nil {
			pm.logger.Printf("Shared reconcile: failed to delete stale redis record %s: %v", rec.PodName, err)
		}
	}
}

func (pm *PodManager) reapOrphanLeases() {
	if !pm.useGlobalRedisScheduler() {
		return
	}

	ctx := context.Background()
	leasedRecords, err := pm.stateStore.ListRunnersByStates(ctx, RunnerStateLeased)
	if err != nil {
		pm.logger.Printf("Lease reaper: failed to list leased runners: %v", err)
		return
	}

	for _, rec := range leasedRecords {
		hasLease, err := pm.stateStore.HasRunnerLease(ctx, rec.PodName)
		if err != nil {
			pm.logger.Printf("Lease reaper: failed to check lease %s: %v", rec.PodName, err)
			continue
		}
		if hasLease {
			continue
		}

		pod, err := pm.clientset.CoreV1().Pods(pm.namespace).Get(ctx, rec.PodName, metav1.GetOptions{})
		if err != nil {
			if k8serrors.IsNotFound(err) {
				_ = pm.stateStore.DeleteRunner(ctx, rec.PodName)
				continue
			}
			pm.logger.Printf("Lease reaper: failed to load pod %s: %v", rec.PodName, err)
			continue
		}

		if pm.isPodReady(pod) {
				record := RunnerStateRecord{
					PodName:     pod.Name,
					NodePoolID:  pod.Labels["runner-node-pool"],
					PodIP:       pod.Status.PodIP,
					State:       RunnerStateIdle,
					OwnerPod:    "",
				OwnerPodUID: "",
				LeaseToken:  "",
				UpdatedAt:   time.Now(),
			}
			if err := pm.stateStore.UpsertRunner(ctx, record); err != nil {
				pm.logger.Printf("Lease reaper: failed to recover idle runner %s: %v", pod.Name, err)
			} else {
				pm.logger.Printf("Lease reaper: recovered orphan lease %s -> idle", pod.Name)
			}
			continue
		}

		pm.logger.Printf("Lease reaper: deleting orphan leased pod %s (not ready)", pod.Name)
		if err := pm.deleteRunnerPod(pod.Name); err != nil {
			pm.logger.Printf("Lease reaper: failed to delete orphan pod %s: %v", pod.Name, err)
		}
	}
}

func (pm *PodManager) dialPodWebSocket(pod *RunnerPod) (*websocket.Conn, error) {
	wsURL := fmt.Sprintf("ws://%s:8000/ws", pod.IP)
	dialer := &websocket.Dialer{
		HandshakeTimeout: 5 * time.Second,
		ReadBufferSize:   1024,
		WriteBufferSize:  1024,
	}

	var lastErr error
	for i := 0; i < 3; i++ {
		conn, _, err := dialer.Dial(wsURL, nil)
		if err == nil {
			return conn, nil
		}
		lastErr = err
		time.Sleep(500 * time.Millisecond)
	}

	return nil, fmt.Errorf("failed to connect pod websocket %s: %w", wsURL, lastErr)
}

func (pm *PodManager) handleWebSocket(w http.ResponseWriter, r *http.Request) {
	pod, err := pm.leasePod()
	if err != nil {
		pm.logger.Printf("Rejecting request: %v", err)
		w.Header().Set("Retry-After", strconv.Itoa(int(pm.leaseTimeout.Seconds())))
		http.Error(w, "Runner capacity exhausted, retry later", http.StatusServiceUnavailable)
		return
	}

	forceReplace := false
	defer func() {
		pm.releasePod(pod, forceReplace)
	}()

	podConn, err := pm.dialPodWebSocket(pod)
	if err != nil {
		pm.logger.Printf("Failed to connect to leased pod %s: %v", pod.Name, err)
		forceReplace = true
		http.Error(w, "Runner pod is unavailable", http.StatusServiceUnavailable)
		return
	}
	defer podConn.Close()

	upgrader := websocket.Upgrader{
		CheckOrigin: func(r *http.Request) bool {
			return true
		},
		HandshakeTimeout: 10 * time.Second,
		ReadBufferSize:   1024,
		WriteBufferSize:  1024,
	}

	clientConn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		pm.logger.Printf("WebSocket upgrade failed: %v", err)
		return
	}
	defer clientConn.Close()

	errorChan := make(chan error, 2)
	var closeOnce sync.Once
	closeBoth := func() {
		_ = clientConn.Close()
		_ = podConn.Close()
	}

	go func() {
		defer closeOnce.Do(closeBoth)
		for {
			messageType, message, err := clientConn.ReadMessage()
			if err != nil {
				if isExpectedClose(err) {
					errorChan <- nil
				} else {
					errorChan <- fmt.Errorf("client read: %w", err)
				}
				return
			}
			if err := podConn.WriteMessage(messageType, message); err != nil {
				errorChan <- fmt.Errorf("pod write: %w", err)
				return
			}
		}
	}()

	go func() {
		defer closeOnce.Do(closeBoth)
		for {
			messageType, message, err := podConn.ReadMessage()
			if err != nil {
				if isExpectedClose(err) {
					errorChan <- nil
				} else {
					errorChan <- fmt.Errorf("pod read: %w", err)
				}
				return
			}
			if err := clientConn.WriteMessage(messageType, message); err != nil {
				errorChan <- fmt.Errorf("client write: %w", err)
				return
			}
		}
	}()

	if proxyErr := <-errorChan; proxyErr != nil {
		pm.logger.Printf("Connection ended with error for pod %s: %v", pod.Name, proxyErr)
	}
}

func isExpectedClose(err error) bool {
	return websocket.IsCloseError(
		err,
		websocket.CloseNormalClosure,
		websocket.CloseGoingAway,
		websocket.CloseNoStatusReceived,
	)
}

func (pm *PodManager) handleHealth(w http.ResponseWriter, _ *http.Request) {
	pm.mu.Lock()
	busy := len(pm.busyPods)
	pm.mu.Unlock()

	globalStats := ""
	if pm.stateStore != nil && pm.stateStore.Enabled() {
		if snapshot, err := pm.stateStore.GetClusterSnapshot(context.Background(), pm.nodePools); err != nil {
			pm.logger.Printf("Failed to read shared runner state: %v", err)
		} else {
			globalNodeStats := ""
			if len(pm.nodePools) > 0 {
				parts := make([]string, 0, len(pm.nodePools))
				for _, pool := range pm.nodePools {
					counts := snapshot.NodePoolCounts[pool.NodePoolID]
					parts = append(parts, fmt.Sprintf(
						"%s:%d/%d/%d(+r=%d,cap=%d)",
						pool.NodePoolID,
						counts.Idle,
						counts.Leased,
						counts.Provisioning,
						counts.Reserved,
						pool.MaxPods,
					))
				}
				globalNodeStats = " global_nodes=" + strings.Join(parts, ",")
			}
			globalStats = fmt.Sprintf(
				" global_idle=%d global_leased=%d global_provisioning=%d global_reserved=%d%s",
				snapshot.TotalIdle,
				snapshot.TotalLeased,
				snapshot.TotalProvisioning,
				snapshot.TotalReserved,
				globalNodeStats,
			)
		}
	}

	w.WriteHeader(http.StatusOK)
	_, _ = fmt.Fprintf(w, "ok local_busy=%d%s", busy, globalStats)
}

func main() {
	config, err := rest.InClusterConfig()
	if err != nil {
		log.Fatalf("Failed to create in-cluster config: %v", err)
	}
	clientset, err := kubernetes.NewForConfig(config)
	if err != nil {
		log.Fatalf("Failed to create clientset: %v", err)
	}

	podManager, err := NewPodManager(clientset)
	if err != nil {
		log.Fatalf("Failed to initialize pod manager: %v", err)
	}

	podManager.startWarmPool()

	http.HandleFunc("/run", podManager.handleWebSocket)
	http.HandleFunc("/healthz", podManager.handleHealth)

	addr := ":8080"
	podManager.logger.Printf("Pod Manager running on %s (pool=%d)", addr, podManager.targetPoolSize)
	if err := http.ListenAndServe(addr, nil); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}

func (pm *PodManager) syncRunnerSharedState(pod *RunnerPod, state RunnerLifecycleState) {
	if pm.stateStore == nil || !pm.stateStore.Enabled() || pod == nil {
		return
	}

	record := RunnerStateRecord{
		PodName:     pod.Name,
		NodePoolID:  pod.NodePoolID,
		PodIP:       pod.IP,
		State:       state,
		OwnerPod:    pm.managerPodName,
		OwnerPodUID: pm.managerPodUID,
		LeaseToken:  pod.LeaseToken,
		UpdatedAt:   time.Now(),
	}
	if err := pm.stateStore.UpsertRunner(context.Background(), record); err != nil {
		pm.logger.Printf("Failed to sync runner state (%s=%s): %v", pod.Name, state, err)
	}
}

func (pm *PodManager) deleteRunnerSharedState(podName string) {
	if pm.stateStore == nil || !pm.stateStore.Enabled() || podName == "" {
		return
	}
	if err := pm.stateStore.DeleteRunner(context.Background(), podName); err != nil {
		pm.logger.Printf("Failed to delete shared runner state (%s): %v", podName, err)
	}
}
