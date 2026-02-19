package main

import (
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"sync"

	"github.com/gorilla/websocket"
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
	conn *websocket.Conn

	stateMu   sync.Mutex
	cmd       *exec.Cmd
	stdinPipe io.WriteCloser

	writeMu sync.Mutex
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

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func main() {
	http.HandleFunc("/ws", wsHandler)
	http.HandleFunc("/healthz", healthHandler)

	addr := ":8000"
	log.Printf("WebSocket server running on %s\n", addr)
	if err := http.ListenAndServe(addr, nil); err != nil {
		log.Fatal(err)
	}
}

func healthHandler(w http.ResponseWriter, _ *http.Request) {
	w.WriteHeader(http.StatusOK)
	_, _ = w.Write([]byte("ok"))
}

func wsHandler(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("Upgrade error:", err)
		return
	}

	ctx := &ConnectionContext{conn: conn}
	defer func() {
		ctx.stopProcess()
		if cleanupErr := cleanupIsolate(); cleanupErr != nil {
			log.Println("isolate cleanup error:", cleanupErr)
		}
		_ = conn.Close()
	}()

	if err := initIsolate(); err != nil {
		ctx.write(map[string]interface{}{
			"type":  "error",
			"error": fmt.Sprintf("failed to init isolate: %v", err),
		})
		return
	}

	for {
		var msg Message
		if err := conn.ReadJSON(&msg); err != nil {
			log.Println("ReadJSON error:", err)
			break
		}

		switch msg.Type {
		case "code":
			if err := handleCode(ctx, &msg); err != nil {
				log.Println("handleCode error:", err)
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
				log.Println("stdinPipe.Write error:", writeErr)
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
			ctx.write(map[string]interface{}{
				"type": "exit",
				"data": "Process exit",
			})
			return

		default:
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
			log.Println("runInteractive error:", err)
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
	args = append(args, "--run", "--")
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
		log.Println("WriteJSON error:", err)
	}
}
