package router

import (
	"context"
	"encoding/json"
	"testing"
	"time"

	"github.com/skkuding/codedang/apps/plag/src/handler"
	"github.com/skkuding/codedang/apps/plag/src/router/response"
	"github.com/skkuding/codedang/apps/plag/src/service/logger"
	"go.opentelemetry.io/otel"
)

type testLogger struct{}

func (testLogger) Log(logger.Level, string)                             {}
func (testLogger) LogWithContext(logger.Level, string, context.Context) {}
func (testLogger) Panic(message string)                                 { panic(message) }

func TestRouteCommonResponse(t *testing.T) {
	for _, test := range []struct {
		name      string
		path      string
		id        string
		body      string
		wantID    int
		wantError string
	}{
		{"missing type", "", "42", "{}", 0, "type(message property) must not be empty"},
		{"missing id", Check, "", "{}", 0, "message_id(message property) must not be empty"},
		{"unknown type", "unknown", "42", "{}", 42, "invalid request type: unknown"},
		{"invalid JSON", Check, "42", "{", 42, "unexpected end of JSON input"},
		{"invalid request", Check, "42", "{}", 42, "problemId must not be empty or zero"},
	} {
		t.Run(test.name, func(t *testing.T) {
			tracer := otel.Tracer("test")
			log := testLogger{}
			r := NewRouter(handler.NewCheckHandler(nil, nil, log, tracer), log, tracer)
			ctx, cancel := context.WithTimeout(context.Background(), time.Second)
			defer cancel()
			out := make(chan response.Response, 1)
			go func() {
				// The common connector owns channel closure.
				defer close(out)
				r.Route(test.path, test.id, []byte(test.body), out, ctx)
			}()
			var messages []response.Response
			for {
				select {
				case message, open := <-out:
					if !open {
						if len(messages) != 1 {
							t.Fatalf("got %d responses, want 1", len(messages))
						}
						message = messages[0]
						var result response.CheckResponse
						if err := json.Unmarshal(message.Message, &result); err != nil {
							t.Fatal(err)
						}
						if message.Type != test.path || result.CheckId != test.wantID || result.Error != test.wantError || result.CheckResultCode != handler.SERVER_ERROR || string(result.CheckResult) != "null" {
							t.Fatalf("unexpected response: type=%q body=%s", message.Type, message.Message)
						}
						return
					}
					messages = append(messages, message)
				case <-ctx.Done():
					t.Fatal("router did not return and close the connector-owned channel")
				}
			}
		})
	}
}

func TestRouteCancelledWhileSending(t *testing.T) {
	r := NewRouter(nil, testLogger{}, otel.Tracer("test"))
	ctx, cancel := context.WithCancel(context.Background())
	out := make(chan response.Response)
	done := make(chan struct{})
	go func() {
		defer close(done)
		r.Route("unknown", "42", nil, out, ctx)
	}()
	cancel()
	select {
	case <-done:
	case <-time.After(time.Second):
		t.Fatal("router remained blocked on output after cancellation")
	}
}
