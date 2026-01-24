package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gorilla/websocket"
	corev1 "k8s.io/api/core/v1"
	"k8s.io/apimachinery/pkg/api/resource"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/rest"
)

const (
	RunnerImageTag  = "RUNNER_IMAGE_TAG"
	RunnerNamespace = "RUNNER_NAMESPACE"
)

// RunnerPod: 생성된 Runner Pod의 정보를 저장
type RunnerPod struct {
	Name      string
	IP        string
	CreatedAt time.Time
}

// PodManager: Kubernetes Pod를 관리하는 서비스
type PodManager struct {
	clientset *kubernetes.Clientset
	logger    *log.Logger
}

// NewPodManager: PodManager 인스턴스 생성
func NewPodManager(clientset *kubernetes.Clientset) *PodManager {
	return &PodManager{
		clientset: clientset,
		logger:    log.New(os.Stdout, "[Pod Manager] ", log.LstdFlags),
	}
}

// createRunnerPod: 코드 실행을 위한 새로운 Pod 생성 (제한 리소스: 0.5 CPU, 512MB Memory)
func (pm *PodManager) createRunnerPod() (*RunnerPod, error) {
	imageTag := os.Getenv(RunnerImageTag)
	if imageTag == "" {
		return nil, fmt.Errorf("environment variable %s is not set", RunnerImageTag)
	}

	namespace := os.Getenv(RunnerNamespace)
	if namespace == "" {
		namespace = "runner" // default fallback
	}

	pod := &corev1.Pod{
		ObjectMeta: metav1.ObjectMeta{
			GenerateName: "runner-",
			Labels: map[string]string{
				"app": "iris-runner",
			},
		},
		Spec: corev1.PodSpec{
			Containers: []corev1.Container{
				{
					Name:            "runner",
					Image:           fmt.Sprintf("ghcr.io/skkuding/codedang-runner-backend:%s", imageTag),
					ImagePullPolicy: corev1.PullIfNotPresent,
					Ports: []corev1.ContainerPort{
						{ContainerPort: 8000},
					},
					SecurityContext: &corev1.SecurityContext{
						Privileged: func(b bool) *bool { return &b }(true),
					},
					Resources: corev1.ResourceRequirements{
						Limits: corev1.ResourceList{
							corev1.ResourceMemory: resource.MustParse("512Mi"),
						},
						Requests: corev1.ResourceList{
							corev1.ResourceCPU:    resource.MustParse("0.5"),
							corev1.ResourceMemory: resource.MustParse("512Mi"),
						},
					},
				},
			},
			RestartPolicy: corev1.RestartPolicyNever,
		},
	}

	created, err := pm.clientset.CoreV1().Pods(namespace).Create(
		context.Background(),
		pod,
		metav1.CreateOptions{},
	)
	if err != nil {
		return nil, fmt.Errorf("failed to create pod: %v", err)
	}

	pm.logger.Printf("Created new runner pod: %s", created.Name)

	return &RunnerPod{
		Name:      created.Name,
		IP:        "", // 빈 문자열로 초기화, waitForPodReady에서 업데이트
		CreatedAt: time.Now(),
	}, nil
}

func (pm *PodManager) deleteRunnerPod(podName string) error {
	namespace := os.Getenv(RunnerNamespace)
	if namespace == "" {
		namespace = "runner" // default fallback
	}

	err := pm.clientset.CoreV1().Pods(namespace).Delete(
		context.Background(),
		podName,
		metav1.DeleteOptions{},
	)
	if err != nil {
		return fmt.Errorf("failed to delete pod %s: %v", podName, err)
	}

	pm.logger.Printf("Deleted runner pod: %s", podName)
	return nil
}

// waitForPodReady: Pod 준비될 때까지 대기 후(최대 90초), 생성된 Pod의 IP 주소 반환
func (pm *PodManager) waitForPodReady(podName string) (string, error) {
	namespace := os.Getenv(RunnerNamespace)
	if namespace == "" {
		namespace = "runner" // default fallback
	}

	timeout := time.After(90 * time.Second)
	tick := time.Tick(1 * time.Second)
	var podIP string

	for {
		select {
		case <-timeout:
			// 타임아웃 시 Pod 상태 자세히 조사
			pod, err := pm.clientset.CoreV1().Pods(namespace).Get(
				context.Background(),
				podName,
				metav1.GetOptions{},
			)
			if err != nil {
				return "", fmt.Errorf("timeout and failed to get pod status: %v", err)
			}

			// 현재 Pod 상태, 컨테이너 상태 로깅
			pm.logger.Printf("Pod %s timed out with phase: %s", podName, pod.Status.Phase)

			for _, containerStatus := range pod.Status.ContainerStatuses {
				pm.logger.Printf("Container %s - Ready: %v", containerStatus.Name, containerStatus.Ready)

				if containerStatus.State.Waiting != nil {
					pm.logger.Printf("Container %s is waiting: reason=%s, message=%s",
						containerStatus.Name,
						containerStatus.State.Waiting.Reason,
						containerStatus.State.Waiting.Message)
				}
				if containerStatus.State.Terminated != nil {
					pm.logger.Printf("Container %s terminated: reason=%s, exitCode=%d, message=%s",
						containerStatus.Name,
						containerStatus.State.Terminated.Reason,
						containerStatus.State.Terminated.ExitCode,
						containerStatus.State.Terminated.Message)
				}
				if containerStatus.LastTerminationState.Terminated != nil {
					pm.logger.Printf("Container %s last termination: reason=%s, exitCode=%d",
						containerStatus.Name,
						containerStatus.LastTerminationState.Terminated.Reason,
						containerStatus.LastTerminationState.Terminated.ExitCode)
				}
			}

			return "", fmt.Errorf("timeout waiting for pod %s to be ready", podName)

		case <-tick:
			pod, err := pm.clientset.CoreV1().Pods(namespace).Get(
				context.Background(),
				podName,
				metav1.GetOptions{},
			)
			if err != nil {
				return "", fmt.Errorf("failed to get pod status: %v", err)
			}

			// 매 틱마다 현재 상태 로깅
			pm.logger.Printf("Checking pod %s: phase=%s", podName, pod.Status.Phase)

			// Pod IP 저장
			podIP = pod.Status.PodIP

			// Pod가 중지된 경우 (실패/완료)
			if pod.Status.Phase == corev1.PodFailed || pod.Status.Phase == corev1.PodSucceeded {
				pm.logger.Printf("Pod %s is in terminal state: %s", podName, pod.Status.Phase)

				// 컨테이너 상태 확인
				for _, containerStatus := range pod.Status.ContainerStatuses {
					if containerStatus.State.Terminated != nil {
						pm.logger.Printf("Container %s terminated: reason=%s, exitCode=%d",
							containerStatus.Name,
							containerStatus.State.Terminated.Reason,
							containerStatus.State.Terminated.ExitCode)
					}
				}

				// 로그 가져오기 시도
				logs, err := pm.clientset.CoreV1().Pods(namespace).GetLogs(
					podName,
					&corev1.PodLogOptions{},
				).Do(context.Background()).Raw()

				if err == nil && len(logs) > 0 {
					pm.logger.Printf("Pod %s logs: %s", podName, string(logs))
				} else {
					pm.logger.Printf("Could not get logs for pod %s: %v", podName, err)
				}

				return "", fmt.Errorf("pod %s is in terminal state: %s", podName, pod.Status.Phase)
			}

			if pod.Status.Phase == corev1.PodRunning {
				// Pod Running 상태 확인
				allContainersReady := true
				for _, containerStatus := range pod.Status.ContainerStatuses {
					if !containerStatus.Ready {
						allContainersReady = false
						pm.logger.Printf("Container %s is not ready", containerStatus.Name)
					}
				}

				if allContainersReady {
					// Pod IP 확인
					if podIP == "" {
						pm.logger.Printf("Pod %s is ready but has no IP address", podName)
						continue
					}

					// Pod가 준비되었지만 서비스가 시작되기까지 약간의 지연 추가
					pm.logger.Printf("Pod %s is ready (all containers ready) with IP: %s", podName, podIP)
					pm.logger.Printf("Waiting 2 seconds for services to initialize...")
					time.Sleep(2 * time.Second)

					return podIP, nil
				} else {
					pm.logger.Printf("Pod %s is running but not all containers are ready", podName)
				}
			} else {
				// Pending, Unknown 등 다양한 상태 처리
				pm.logger.Printf("Pod %s is not running yet (phase: %s)", podName, pod.Status.Phase)
			}
		}
	}
}

// handleWebSocket: 클라이언트의 WebSocket 연결 처리 및 Pod과의 통신 중계
func (pm *PodManager) handleWebSocket(w http.ResponseWriter, r *http.Request) {
	pod, err := pm.createRunnerPod()
	if err != nil {
		pm.logger.Printf("Failed to create runner pod: %v", err)
		http.Error(w, "Failed to create runner pod", http.StatusInternalServerError)
		return
	}

	// 모든 종료 상황에서 Pod 안전하게 삭제
	defer func() {
		pm.logger.Printf("Deleting pod %s", pod.Name)
		pm.deleteRunnerPod(pod.Name)
	}()

	podIP, err := pm.waitForPodReady(pod.Name)
	if err != nil {
		pm.logger.Printf("Pod failed to become ready: %v", err)
		http.Error(w, "Pod failed to become ready", http.StatusInternalServerError)
		return
	}

	// Pod IP 업데이트
	pod.IP = podIP

	// WebSocket 연결 설정
	upgrader := websocket.Upgrader{
		CheckOrigin: func(r *http.Request) bool {
			return true
		},
		HandshakeTimeout: 10 * time.Second,
		ReadBufferSize:   1024,
		WriteBufferSize:  1024,
	}

	// 클라이언트와 WebSocket 연결 수립
	clientConn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		pm.logger.Printf("WebSocket upgrade failed: %v", err)
		return
	}
	defer clientConn.Close()

	// Pod IP 유효성 확인
	if pod.IP == "" {
		pm.logger.Printf("Pod IP is empty, cannot connect to pod")
		return
	}

	wsURL := fmt.Sprintf("ws://%s:8000/ws", pod.IP)
	pm.logger.Printf("Attempting to connect to pod WebSocket at: %s", wsURL)

	dialer := &websocket.Dialer{
		HandshakeTimeout: 10 * time.Second,
		ReadBufferSize:   1024,
		WriteBufferSize:  1024,
	}

	// 생성된 Pod과 웹소켓 연결 최대 5번 재시도
	var podConn *websocket.Conn
	var dialErr error

	for i := 0; i < 5; i++ {
		podConn, _, dialErr = dialer.Dial(wsURL, nil)
		if dialErr == nil {
			break
		}
		pm.logger.Printf("Failed to connect to pod (attempt %d/5): %v", i+1, dialErr)
		time.Sleep(2 * time.Second)
	}

	if dialErr != nil {
		pm.logger.Printf("All connection attempts to pod failed: %v", dialErr)
		return
	}
	defer podConn.Close()

	pm.logger.Printf("WebSocket connection established with pod %s", pod.Name)

	// 연결 상태 모니터링을 위한 채널
	closeChan := make(chan struct{})
	errorChan := make(chan error, 2)

	// 클라이언트 -> Pod: 클라이언트 메시지를 Pod로 전달
	go func() {
		defer func() {
			pm.logger.Printf("Client -> Pod is ready to close")
			close(closeChan)
		}()

		for {
			_, message, err := clientConn.ReadMessage()
			if err != nil {
				pm.logger.Printf("Client read error: %v", err)
				errorChan <- fmt.Errorf("client read: %v", err)
				return
			}

			// 메시지 내용 로깅 (디버깅용)
			pm.logger.Printf("Received message from client: %s", string(message))

			// 메시지를 그대로 Pod에 전달 (JSON 형식 유지)
			if err := podConn.WriteMessage(websocket.TextMessage, message); err != nil {
				pm.logger.Printf("Pod write error: %v", err)
				errorChan <- fmt.Errorf("pod write: %v", err)
				return
			}

			pm.logger.Printf("Forwarded message to pod")
		}
	}()

	// Pod -> 클라이언트: Pod 메시지를 클라이언트로 전달
	go func() {
		for {
			_, message, err := podConn.ReadMessage()
			if err != nil {
				select {
				case <-closeChan:
					pm.logger.Printf("Pod -> Client is ready to close")
					return
				default:
					pm.logger.Printf("Pod read error: %v", err)
					errorChan <- fmt.Errorf("pod read: %v", err)
					return
				}
			}

			// 메시지 내용 로깅 (디버깅용)
			pm.logger.Printf("Received message from pod: %s", string(message))

			// 메시지를 그대로 클라이언트에 전달
			if err := clientConn.WriteMessage(websocket.TextMessage, message); err != nil {
				pm.logger.Printf("Client write error: %v", err)
				errorChan <- fmt.Errorf("client write: %v", err)
				return
			}

			pm.logger.Printf("Forwarded message to client")
		}
	}()

	// 오류 또는 종료 대기
	select {
	case err := <-errorChan:
		pm.logger.Printf("Connection error: %v", err)
	case <-closeChan:
		pm.logger.Printf("Connection closed normally")
	}

	pm.logger.Printf("WebSocket handler completed for pod %s", pod.Name)
}

func main() {
	// Kubernetes 클라이언트 생성
	config, err := rest.InClusterConfig()
	if err != nil {
		log.Fatalf("Failed to create in-cluster config: %v", err)
	}
	clientset, err := kubernetes.NewForConfig(config)
	if err != nil {
		log.Fatalf("Failed to create clientset: %v", err)
	}

	podManager := NewPodManager(clientset)
	http.HandleFunc("/run", podManager.handleWebSocket)

	addr := ":8080"
	podManager.logger.Printf("Pod Manager running on %s", addr)
	if err := http.ListenAndServe(addr, nil); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
