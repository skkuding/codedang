package e2e

import (
	"net/http"
	"os"
	"strings"
	"testing"
	"time"

	"github.com/gorilla/websocket"
)

func TestRunEndpointWebSocketE2E(t *testing.T) {
	baseURL := strings.TrimSpace(os.Getenv("RUNNER_E2E_BASE_URL"))
	if baseURL == "" {
		t.Skip("set RUNNER_E2E_BASE_URL to run /run websocket e2e test")
	}

	healthURL := strings.TrimSuffix(baseURL, "/") + "/healthz"
	resp, err := (&http.Client{Timeout: 5 * time.Second}).Get(healthURL)
	if err != nil {
		t.Fatalf("healthz request failed: %v", err)
	}
	_ = resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("unexpected healthz status: %d", resp.StatusCode)
	}

	wsURL := strings.TrimSuffix(baseURL, "/")
	wsURL = strings.Replace(wsURL, "http://", "ws://", 1)
	wsURL = strings.Replace(wsURL, "https://", "wss://", 1)
	wsURL += "/run"

	conn, _, err := websocket.DefaultDialer.Dial(wsURL, nil)
	if err != nil {
		t.Fatalf("websocket dial failed: %v", err)
	}
	defer conn.Close()

	conn.SetWriteDeadline(time.Now().Add(5 * time.Second))
	if err := conn.WriteJSON(map[string]interface{}{
		"type":     "code",
		"language": "__invalid__",
		"source":   "print('hello')",
	}); err != nil {
		t.Fatalf("write websocket message failed: %v", err)
	}

	conn.SetReadDeadline(time.Now().Add(10 * time.Second))
	var msg map[string]interface{}
	if err := conn.ReadJSON(&msg); err != nil {
		// Current runner behavior for unsupported language is to close the socket.
		errText := strings.ToLower(err.Error())
		if strings.Contains(errText, "unexpected eof") || strings.Contains(errText, "close 1006") {
			return
		}
		t.Fatalf("read websocket message failed: %v", err)
	}

	msgType, _ := msg["type"].(string)
	if msgType != "error" {
		t.Fatalf("expected first response type=error, got %q (msg=%v)", msgType, msg)
	}

	errText, _ := msg["error"].(string)
	if !strings.Contains(strings.ToLower(errText), "unsupported language") {
		t.Fatalf("expected unsupported language error, got %q", errText)
	}
}
