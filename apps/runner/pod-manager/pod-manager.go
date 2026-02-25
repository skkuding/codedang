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
	"k8s.io/apimachinery/pkg/api/resource"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/util/intstr"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/rest"
)

const (
	RunnerImageTag  = "RUNNER_IMAGE_TAG"
	RunnerNamespace = "runner"
)

type RunnerPod struct {
	Name       string
	IP         string
	NodePoolID string
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

	idlePods chan *RunnerPod

	mu                 sync.Mutex
	busyPods           map[string]*RunnerPod
	provisioning       int
	idleCounts         map[string]int
	busyCounts         map[string]int
	provisioningCounts map[string]int
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
		clientset:          clientset,
		logger:             logger,
		namespace:          RunnerNamespace,
		imageTag:           imageTag,
		targetPoolSize:     poolSize,
		leaseTimeout:       time.Duration(leaseTimeoutSec) * time.Second,
		readyTimeout:       time.Duration(readyTimeoutSec) * time.Second,
		nodeSelectorKey:    nodeSelectorKey,
		nodePools:          nodePools,
		idlePods:           make(chan *RunnerPod, poolSize),
		busyPods:           make(map[string]*RunnerPod),
		idleCounts:         make(map[string]int),
		busyCounts:         make(map[string]int),
		provisioningCounts: make(map[string]int),
	}

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
	pm.ensurePool()

	ticker := time.NewTicker(5 * time.Second)
	go func() {
		for range ticker.C {
			pm.ensurePool()
		}
	}()
}

func (pm *PodManager) ensurePool() {
	pm.mu.Lock()
	currentTotal := len(pm.idlePods) + len(pm.busyPods) + pm.provisioning
	missing := pm.targetPoolSize - currentTotal
	if missing <= 0 {
		excessIdlePods := []*RunnerPod(nil)
		if missing < 0 {
			excessIdlePods = pm.takeExcessIdlePodsLocked(-missing)
		}
		pm.mu.Unlock()

		for _, pod := range excessIdlePods {
			pm.logger.Printf("Shrinking excess idle pod: %s (nodePool=%s)", pod.Name, pod.NodePoolID)
			if err := pm.deleteRunnerPod(pod.Name); err != nil {
				pm.logger.Printf("Failed to delete excess idle pod %s: %v", pod.Name, err)
			}
		}
		return
	}
	nodeSelections := make([]string, 0, missing)
	for i := 0; i < missing; i++ {
		nodeValue, ok := pm.reserveProvisioningSlotLocked()
		if !ok {
			break
		}
		nodeSelections = append(nodeSelections, nodeValue)
	}
	pm.mu.Unlock()

	if len(nodeSelections) == 0 {
		if len(pm.nodePools) > 0 {
			pm.logger.Printf("No node pool has free capacity (target=%d current=%d)", pm.targetPoolSize, currentTotal)
		}
		return
	}

	for _, nodeValue := range nodeSelections {
		go pm.provisionOnePod(nodeValue)
	}
}

func (pm *PodManager) takeExcessIdlePodsLocked(excess int) []*RunnerPod {
	if excess <= 0 {
		return nil
	}

	removable := excess
	if removable > len(pm.idlePods) {
		removable = len(pm.idlePods)
	}

	pods := make([]*RunnerPod, 0, removable)
	for i := 0; i < removable; i++ {
		select {
		case pod := <-pm.idlePods:
			if pod.NodePoolID != "" {
				pm.idleCounts[pod.NodePoolID]--
				if pm.idleCounts[pod.NodePoolID] <= 0 {
					delete(pm.idleCounts, pod.NodePoolID)
				}
			}
			pods = append(pods, pod)
		default:
			return pods
		}
	}

	return pods
}

func (pm *PodManager) reserveProvisioningSlotLocked() (string, bool) {
	if len(pm.nodePools) == 0 {
		pm.provisioning++
		return "", true
	}

	for i := 0; i < len(pm.nodePools); i++ {
		idx := (pm.nextNodePoolIdx + i) % len(pm.nodePools)
		pool := pm.nodePools[idx]
		current := pm.idleCounts[pool.NodePoolID] +
			pm.busyCounts[pool.NodePoolID] +
			pm.provisioningCounts[pool.NodePoolID]
		if current >= pool.MaxPods {
			continue
		}

		pm.nextNodePoolIdx = (idx + 1) % len(pm.nodePools)
		pm.provisioning++
		pm.provisioningCounts[pool.NodePoolID]++
		return pool.NodePoolID, true
	}

	return "", false
}

func (pm *PodManager) releaseProvisioningSlot(nodeValue string) {
	pm.mu.Lock()
	defer pm.mu.Unlock()

	pm.provisioning--
	if nodeValue != "" {
		pm.provisioningCounts[nodeValue]--
		if pm.provisioningCounts[nodeValue] <= 0 {
			delete(pm.provisioningCounts, nodeValue)
		}
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

	select {
	case pm.idlePods <- pod:
		pm.mu.Lock()
		if pod.NodePoolID != "" {
			pm.idleCounts[pod.NodePoolID]++
		}
		pm.mu.Unlock()
		pm.logger.Printf("Warm pod ready: %s (%s)", pod.Name, pod.IP)
	default:
		pm.logger.Printf("Idle pool is full, deleting extra pod: %s", pod.Name)
		_ = pm.deleteRunnerPod(pod.Name)
	}
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

	created, err := pm.clientset.CoreV1().Pods(pm.namespace).Create(
		context.Background(),
		pod,
		metav1.CreateOptions{},
	)
	if err != nil {
		return nil, fmt.Errorf("failed to create pod: %w", err)
	}

	pm.logger.Printf("Created runner pod: %s", created.Name)
	return &RunnerPod{
		Name:       created.Name,
		NodePoolID: nodeValue,
		CreatedAt:  time.Now(),
	}, nil
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
	return nil
}

func (pm *PodManager) leasePod() (*RunnerPod, error) {
	timer := time.NewTimer(pm.leaseTimeout)
	defer timer.Stop()

	select {
	case pod := <-pm.idlePods:
		pm.mu.Lock()
		if pod.NodePoolID != "" {
			pm.idleCounts[pod.NodePoolID]--
			if pm.idleCounts[pod.NodePoolID] <= 0 {
				delete(pm.idleCounts, pod.NodePoolID)
			}
			pm.busyCounts[pod.NodePoolID]++
		}
		pm.busyPods[pod.Name] = pod
		pm.mu.Unlock()
		return pod, nil
	case <-timer.C:
		return nil, errors.New("warm pod pool exhausted")
	}
}

func (pm *PodManager) releasePod(pod *RunnerPod, forceReplace bool) {
	pm.mu.Lock()
	delete(pm.busyPods, pod.Name)
	if pod.NodePoolID != "" {
		pm.busyCounts[pod.NodePoolID]--
		if pm.busyCounts[pod.NodePoolID] <= 0 {
			delete(pm.busyCounts, pod.NodePoolID)
		}
	}
	pm.mu.Unlock()

	if !forceReplace && pm.isPodReusable(pod.Name) {
		pod.LastUsedAt = time.Now()
		select {
		case pm.idlePods <- pod:
			pm.mu.Lock()
			if pod.NodePoolID != "" {
				pm.idleCounts[pod.NodePoolID]++
			}
			pm.mu.Unlock()
			return
		default:
			pm.logger.Printf("Idle pool channel is full, replacing pod: %s", pod.Name)
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
	idle := len(pm.idlePods)
	busy := len(pm.busyPods)
	provisioning := pm.provisioning
	nodeStats := ""
	if len(pm.nodePools) > 0 {
		parts := make([]string, 0, len(pm.nodePools))
		for _, pool := range pm.nodePools {
			parts = append(parts, fmt.Sprintf(
				"%s:%d/%d/%d(cap=%d)",
				pool.NodePoolID,
				pm.idleCounts[pool.NodePoolID],
				pm.busyCounts[pool.NodePoolID],
				pm.provisioningCounts[pool.NodePoolID],
				pool.MaxPods,
			))
		}
		nodeStats = " nodes=" + strings.Join(parts, ",")
	}
	pm.mu.Unlock()

	w.WriteHeader(http.StatusOK)
	_, _ = fmt.Fprintf(w, "ok idle=%d busy=%d provisioning=%d%s", idle, busy, provisioning, nodeStats)
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
