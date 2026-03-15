package main

import (
	"context"
	"fmt"
	"io"
	"net"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"sync"
	"sync/atomic"
	"time"

	"github.com/gorilla/websocket"
	"go.uber.org/zap"
)

// 하나의 Pod - 하나의 isolate(boxID 0)
const (
	isolateBinary = "/usr/local/bin/isolate"
	workspaceDir  = "/code"
	boxID         = "0"
)

type Message struct {
	Type     string `json:"type"`
	Language string `json:"language"`
	Source   string `json:"source"`
	Data     string `json:"data"`
}

type ConnectionContext struct {
	conn   *websocket.Conn
	logger Logger

	requestID  string
	clientAddr string
	startedAt  time.Time

	stateMu   sync.Mutex
	cmd       *exec.Cmd
	stdinPipe io.WriteCloser

	writeMu sync.Mutex
}

var (
	upgrader = websocket.Upgrader{
		CheckOrigin: func(r *http.Request) bool {
			return true
		},
	}
	backendLogger   Logger
	requestSequence uint64
)

func newConnectionContext(conn *websocket.Conn, r *http.Request, logger Logger) *ConnectionContext {
	seq := atomic.AddUint64(&requestSequence, 1)
	now := time.Now().UTC()
	return &ConnectionContext{
		conn:       conn,
		logger:     logger,
		requestID:  fmt.Sprintf("runner-%d-%d", now.UnixNano(), seq),
		clientAddr: clientAddress(r),
		startedAt:  now,
	}
}

func clientAddress(r *http.Request) string {
	if r == nil {
		return ""
	}
	host, _, err := net.SplitHostPort(r.RemoteAddr)
	if err == nil {
		return host
	}
	return r.RemoteAddr
}

func (ctx *ConnectionContext) logEvent(event string, fields ...zap.Field) {
	ctx.logEventLevel(LogLevelInfo, event, fields...)
}

func (ctx *ConnectionContext) logEventLevel(level LogLevel, event string, fields ...zap.Field) {
	if ctx == nil || ctx.logger == nil {
		return
	}
	base := []zap.Field{
		zap.String("event", event),
		zap.String("request_id", ctx.requestID),
		zap.String("client_addr", ctx.clientAddr),
		zap.Int64("duration_ms", time.Since(ctx.startedAt).Milliseconds()),
	}
	ctx.logger.LogFields(level, event, append(base, fields...)...)
}

func (ctx *ConnectionContext) write(v interface{}) {
	ctx.writeMu.Lock()
	defer ctx.writeMu.Unlock()
	sendJSON(ctx.conn, v)
}

// ctx 에 stdinPipe 연결해서, 입력 이벤트에서 사용
func (ctx *ConnectionContext) setProcess(cmd *exec.Cmd, stdin io.WriteCloser) {
	ctx.stateMu.Lock()
	defer ctx.stateMu.Unlock()
	ctx.cmd = cmd
	ctx.stdinPipe = stdin
}

func (ctx *ConnectionContext) clearProcess() {
	ctx.stateMu.Lock()
	defer ctx.stateMu.Unlock()
	ctx.cmd = nil
	ctx.stdinPipe = nil
}

func (ctx *ConnectionContext) stdin() io.WriteCloser {
	ctx.stateMu.Lock()
	defer ctx.stateMu.Unlock()
	return ctx.stdinPipe
}

func (ctx *ConnectionContext) stopProcess() {
	ctx.stateMu.Lock()
	cmd := ctx.cmd
	stdin := ctx.stdinPipe
	ctx.cmd = nil
	ctx.stdinPipe = nil
	ctx.stateMu.Unlock()

	if stdin != nil {
		_ = stdin.Close()
	}
	if cmd != nil && cmd.Process != nil {
		_ = cmd.Process.Kill()
	}
}

func main() {
	ctx := context.Background()
	var shutdown func(context.Context) error
	if getenv("DISABLE_INSTRUMENTATION", "false") != "true" {
		endpoint := strings.TrimSpace(getenv("OTEL_EXPORTER_OTLP_ENDPOINT_URL", ""))
		if endpoint == "" {
			panic("OTEL_EXPORTER_OTLP_ENDPOINT_URL must be set when instrumentation is enabled")
		}
		var err error
		shutdown, err = initInstrumentation(ctx, backendServiceName, "0.1.0", endpoint)
		if err != nil {
			panic(fmt.Sprintf("Failed to initialize instrumentation: %v", err))
		}
		defer func() {
			if shutdownErr := shutdown(ctx); shutdownErr != nil {
				fmt.Printf("instrumentation shutdown error: %v\n", shutdownErr)
			}
		}()
	}

	backendLogger = newLogger(backendServiceName, strings.EqualFold(getenv("APP_ENV", "stage"), "production"))
	defer backendLogger.Sync()

	http.HandleFunc("/ws", wsHandler)
	http.HandleFunc("/healthz", healthHandler)

	addr := ":8000"
	backendLogger.Printf("Runner backend running on %s", addr)
	if err := http.ListenAndServe(addr, nil); err != nil {
		panic(err)
	}
}

func healthHandler(w http.ResponseWriter, _ *http.Request) {
	w.WriteHeader(http.StatusOK)
	_, _ = w.Write([]byte("ok"))
}

func wsHandler(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		if backendLogger != nil {
			backendLogger.LogFields(LogLevelError, "runner.ws_upgrade_failed",
				zap.String("event", "runner.ws_upgrade_failed"),
				zap.String("client_addr", clientAddress(r)),
				zap.String("error", err.Error()),
			)
		}
		return
	}

	ctx := newConnectionContext(conn, r, backendLogger)
	ctx.logEvent("runner.request_started")
	defer func() {
		ctx.stopProcess()
		if cleanupErr := cleanupIsolate(); cleanupErr != nil {
			ctx.logEvent("runner.isolate_cleanup_failed", zap.String("error", cleanupErr.Error()))
		}
		ctx.logEvent("runner.request_finished")
		_ = conn.Close()
	}()

	if err := initIsolate(); err != nil {
		ctx.logEvent("runner.isolate_init_failed", zap.String("error", err.Error()))
		ctx.write(map[string]interface{}{
			"type":  "error",
			"error": fmt.Sprintf("failed to init isolate: %v", err),
		})
		return
	}

	for {
		var msg Message
		if err := conn.ReadJSON(&msg); err != nil {
			ctx.logEvent("runner.read_json_error", zap.String("error", err.Error()))
			break
		}

		switch msg.Type {
		case "code":
			if err := handleCode(ctx, &msg); err != nil {
				ctx.logEvent("runner.handle_code_failed",
					zap.String("language", msg.Language),
					zap.String("error", err.Error()),
				)
				return
			}

		case "input":
			stdin := ctx.stdin()
			if stdin == nil {
				continue
			}

			inputData := msg.Data
			if inputData == "\r" || inputData == "\n" {
				inputData = "\r\n"
			}
			if _, writeErr := stdin.Write([]byte(inputData)); writeErr != nil {
				ctx.logEvent("runner.stdin_write_failed", zap.String("error", writeErr.Error()))
				ctx.write(map[string]interface{}{
					"type":  "error",
					"error": fmt.Sprintf("stdin write error: %v", writeErr),
				})
				return
			}

			if inputData != "\r\n" {
				ctx.write(map[string]interface{}{
					"type": "echo",
					"data": inputData,
				})
			}

		case "exit":
			ctx.logEvent("runner.exit_requested")
			ctx.write(map[string]interface{}{
				"type": "exit",
				"data": "Process exit",
			})
			return

		default:
			ctx.logEvent("runner.unknown_message_type", zap.String("message_type", msg.Type))
			ctx.write(map[string]interface{}{
				"type":  "error",
				"error": "Unknown message type",
			})
		}
	}
}

func handleCode(ctx *ConnectionContext, msg *Message) error {
	option, ok := CompileOptions[msg.Language]
	if !ok {
		return fmt.Errorf("unsupported language: %s", msg.Language)
	}

	ctx.stopProcess()
	if err := resetWorkspace(); err != nil {
		ctx.write(map[string]interface{}{
			"type":  "error",
			"error": fmt.Sprintf("failed to reset workspace: %v", err),
		})
		return err
	}

	if err := os.WriteFile(option.Filename, []byte(msg.Source), 0o644); err != nil {
		ctx.write(map[string]interface{}{
			"type":  "error",
			"error": fmt.Sprintf("failed to write file: %v", err),
		})
		return err
	}

	if len(option.CompileCmd) > 0 {
		output, compileErr := runCommand(option.CompileCmd)
		if compileErr != nil {
			ctx.logEvent("runner.compile_failed",
				zap.String("language", msg.Language),
				zap.String("error", compileErr.Error()),
			)
			ctx.write(map[string]interface{}{
				"type":   "compile_error",
				"stderr": output,
			})
			return compileErr
		}

		ctx.write(map[string]interface{}{
			"type":   "compile_success",
			"stdout": output,
		})
	}

	if len(option.ExecuteCmd) > 0 {
		if err := runInteractive(ctx, option.ExecuteCmd); err != nil {
			ctx.logEvent("runner.execute_failed", zap.String("error", err.Error()))
			return err
		}
	}

	return nil
}

func resetWorkspace() error {
	entries, err := os.ReadDir(workspaceDir)
	if err != nil {
		return err
	}

	for _, entry := range entries {
		target := filepath.Join(workspaceDir, entry.Name())
		if err := os.RemoveAll(target); err != nil {
			return fmt.Errorf("failed to remove %s: %w", target, err)
		}
	}
	return nil
}

func runCommand(args []string) (string, error) {
	if len(args) == 0 {
		return "", fmt.Errorf("no command to run")
	}

	cmd := exec.Command(args[0], args[1:]...)
	output, err := cmd.CombinedOutput()
	return string(output), err
}

func initIsolate() error {
	args := append(isolateCommonArgs(), "--init")
	output, err := exec.Command(isolateBinary, args...).CombinedOutput()
	if err != nil {
		return fmt.Errorf("%v: %s", err, strings.TrimSpace(string(output)))
	}
	return nil
}

func cleanupIsolate() error {
	args := append(isolateCommonArgs(), "--cleanup")
	output, err := exec.Command(isolateBinary, args...).CombinedOutput()
	if err != nil {
		return fmt.Errorf("%v: %s", err, strings.TrimSpace(string(output)))
	}
	return nil
}

func isolateCommonArgs() []string {
	return []string{
		"--box-id=" + boxID,
		"--dir=/code",
		"--dir=/usr/bin",
	}
}

func runInteractive(ctx *ConnectionContext, commandArgs []string) error {
	if len(commandArgs) == 0 {
		return fmt.Errorf("no command to run")
	}

	args := isolateCommonArgs()
	args = append(args, "--silent", "--run", "--")
	args = append(args, commandArgs...)

	cmd := exec.Command(isolateBinary, args...)

	stdinPipe, err := cmd.StdinPipe()
	if err != nil {
		return err
	}

	stdoutPipe, err := cmd.StdoutPipe()
	if err != nil {
		_ = stdinPipe.Close()
		return err
	}

	stderrPipe, err := cmd.StderrPipe()
	if err != nil {
		_ = stdinPipe.Close()
		_ = stdoutPipe.Close()
		return err
	}

	if err := cmd.Start(); err != nil {
		_ = stdinPipe.Close()
		_ = stdoutPipe.Close()
		_ = stderrPipe.Close()
		return err
	}

	ctx.setProcess(cmd, stdinPipe)
	go streamOutput(ctx, stdoutPipe, "stdout")
	go streamOutput(ctx, stderrPipe, "stderr")

	go func() {
		waitErr := cmd.Wait()
		exitCode := cmd.ProcessState.ExitCode()
		ctx.clearProcess()
		if waitErr != nil {
			ctx.logEvent("runner.process_exited",
				zap.Int("return_code", exitCode),
				zap.String("error", waitErr.Error()),
			)
		}

		ctx.write(map[string]interface{}{
			"type":        "exit",
			"return_code": exitCode,
			"error":       fmt.Sprintf("%v", waitErr),
		})
		_ = ctx.conn.Close()
	}()

	return nil
}

func streamOutput(ctx *ConnectionContext, r io.ReadCloser, streamType string) {
	defer r.Close()
	buf := make([]byte, 1024)

	for {
		n, err := r.Read(buf)
		if n > 0 {
			line := string(buf[:n])
			ctx.write(map[string]interface{}{
				"type": streamType,
				"data": line,
			})
		}

		if err != nil {
			break
		}
	}
}

func sendJSON(conn *websocket.Conn, v interface{}) {
	if err := conn.WriteJSON(v); err != nil {
		if backendLogger != nil {
			backendLogger.LogFields(LogLevelError, "runner.write_json_failed",
				zap.String("event", "runner.write_json_failed"),
				zap.String("error", err.Error()),
			)
		}
	}
}

func getenv(key, fallback string) string {
	value := strings.TrimSpace(os.Getenv(key))
	if value != "" {
		return value
	}
	return fallback
}
