package main

import (
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"os/exec"
	"sync"

	"github.com/gorilla/websocket"
)

type Message struct {
	Type       string `json:"type"`        // "code", "input", "echo" 등
	Language   string `json:"language"`    // c, cpp, java, go, python, ...
	Source     string `json:"source"`      // 소스코드
	Data       string `json:"data"`        // "input" 메시지에서 사용 (stdin에 보낼 내용)
}

// ConnectionContext: 한 WebSocket 커넥션에서 실행 중인 프로세스 정보를 저장
type ConnectionContext struct {
	conn      *websocket.Conn
	cmd       *exec.Cmd
	stdinPipe io.WriteCloser

	// 표준출력/표준에러를 중복해서 웹소켓에 보내지 않도록 보호하는 뮤텍스 등
	mu sync.Mutex
}

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func main() {
	http.HandleFunc("/ws", wsHandler)

	addr := ":8000"
	log.Printf("WebSocket server running on %s\n", addr)
	if err := http.ListenAndServe(addr, nil); err != nil {
		log.Fatal(err)
	}
}

func wsHandler(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("Upgrade error:", err)
		return
	}
	defer conn.Close()

	ctx := &ConnectionContext{conn: conn}

	for {
		var msg Message
		err := conn.ReadJSON(&msg)
		if err != nil {
			log.Println("ReadJSON error:", err)
			break
		}

		switch msg.Type {
		case "code":
			err := handleCode(ctx, &msg)
			if err != nil {
				log.Println("handleCode error:", err)
				// 에러 발생 시 연결 종료
				conn.Close()
				return
			}

		case "input":
			if ctx.stdinPipe != nil {
				inputData := msg.Data
				if inputData == "\r" || inputData == "\n" {
					inputData = "\r\n"
				}
				_, writeErr := ctx.stdinPipe.Write([]byte(inputData))
				if writeErr != nil {
					log.Println("stdinPipe.Write error:", writeErr)
					sendJSON(conn, map[string]interface{}{
						"type":  "error",
						"error": fmt.Sprintf("stdin write error: %v", writeErr),
					})
					conn.Close()
					return
				}

				log.Println("input", inputData)

				if inputData != "\r\n" {
					sendJSON(conn, map[string]interface{}{
						"type": "echo",
						"data": inputData,
					})
				}
			}

		case "exit":
			sendJSON(conn, map[string]interface{}{
				"type": "exit",
				"data": "Process exit",
			})
			
			conn.Close()
			return

		default:
			sendJSON(conn, map[string]interface{}{
				"type":  "error",
				"error": "Unknown message type",
			})
		}
	}
}

// "code" 타입 메시지를 처리 (코드 파일 생성 → 컴파일 → 실행)
func handleCode(ctx *ConnectionContext, msg *Message) error {
	if _, ok := CompileOptions[msg.Language]; !ok {
		return fmt.Errorf("Unsupported language: %s", msg.Language)
	}

	filename := CompileOptions[msg.Language].Filename

	// 코드 파일 생성
	err := os.WriteFile(filename, []byte(msg.Source), 0644)
	if err != nil {
		sendJSON(ctx.conn, map[string]interface{}{
			"type":  "error",
			"error": fmt.Sprintf("Failed to write file: %v", err),
		})
		return err
	}

	// 컴파일
	compileCmd := CompileOptions[msg.Language].CompileCmd
	if len(compileCmd) > 0 {
		output, compileErr := runCommand(compileCmd)
		if compileErr != nil {
			sendJSON(ctx.conn, map[string]interface{}{
				"type":   "compile_error",
				"stderr": output,
			})
			// 컴파일 에러 발생 시 연결 종료
			ctx.conn.Close()
			return compileErr
		}

		sendJSON(ctx.conn, map[string]interface{}{
			"type":   "compile_success",
			"stdout": output,
		})
	}

	executeCmd := CompileOptions[msg.Language].ExecuteCmd
	if len(executeCmd) > 0 {
		if ctx.cmd != nil {
			_ = ctx.cmd.Process.Kill()
		}

		err := runInteractive(ctx, executeCmd)
		if err != nil {
			log.Println("runInteractive error:", err)
			// 실행 중 오류 발생 시 연결 종료
			ctx.conn.Close()
			return err
		}
	}

	return nil
}

// 명령어를 실행하고 결과(표준출력+표준에러)를 반환
func runCommand(args []string) (string, error) {
	if len(args) == 0 {
		return "", fmt.Errorf("no command to run")
	}

	cmd := exec.Command(args[0], args[1:]...)
	output, err := cmd.CombinedOutput()
	return string(output), err
}

// 프로세스를 실행하고, stdout/stderr를 실시간으로 웹소켓에 전송. stdinPipe는 ctx에 저장
func runInteractive(ctx *ConnectionContext, args []string) error {
	if len(args) == 0 {
		return fmt.Errorf("no command to run")
	}

	// Details of isolate cmd: https://www.ucw.cz/moe/isolate.1.html
	args = append([]string{"/usr/local/bin/isolate", "--dir=/code", "--dir=/usr/bin", "--run", "--"}, args...)
	cmd := exec.Command(args[0], args[1:]...)
	ctx.cmd = cmd

	stdinPipe, err := cmd.StdinPipe()
	if err != nil {
		return err
	}
	ctx.stdinPipe = stdinPipe

	stdoutPipe, err := cmd.StdoutPipe()
	if err != nil {
		return err
	}

	stderrPipe, err := cmd.StderrPipe()
	if err != nil {
		return err
	}

	if err := cmd.Start(); err != nil {
		return err
	}

	go streamOutput(ctx, stdoutPipe, "stdout")
	go streamOutput(ctx, stderrPipe, "stderr")

	// 프로세스 종료 대기
	go func() {
		waitErr := cmd.Wait()
		exitCode := 0
		if waitErr != nil {
			exitCode = cmd.ProcessState.ExitCode()
		} else {
			exitCode = cmd.ProcessState.ExitCode()
		}

		// 종료 메시지 전송
		sendJSON(ctx.conn, map[string]interface{}{
			"type":        "exit",
			"return_code": exitCode,
			"error":       fmt.Sprintf("%v", waitErr),
		})

		err := exec.Command("/usr/local/bin/isolate", "--dir=/code", "--cleanup").Run()
		if err != nil {
			log.Println("isolate cleanup error:", err)
		}

		// 종료 후 stdinPipe 닫기
		ctx.stdinPipe = nil
		ctx.cmd = nil
		ctx.conn.Close()
	}()

	return nil
}

// r(표준출력/표준에러)에서 데이터를 읽어, 실시간으로 웹소켓 전송
func streamOutput(ctx *ConnectionContext, r io.ReadCloser, streamType string) {
	defer r.Close()
	buf := make([]byte, 1024)

	for {
		n, err := r.Read(buf)
		if n > 0 {
			line := string(buf[:n])
			ctx.mu.Lock()
			log.Println("output", line)
			sendJSON(ctx.conn, map[string]interface{}{
				"type": streamType,
				"data": line,
			})
			ctx.mu.Unlock()
		}

		if err != nil {
			break
		}
	}
}

// 웹소켓으로 JSON 전송
func sendJSON(conn *websocket.Conn, v interface{}) {
	if err := conn.WriteJSON(v); err != nil {
		log.Println("WriteJSON error:", err)
	}
}
