package router

import (
	"context"
	"encoding/json"
	"strings"
	"testing"

	"github.com/skkuding/codedang/apps/iris/src/common/constants"
	"github.com/skkuding/codedang/apps/iris/src/handler/judge"
	"github.com/skkuding/codedang/apps/iris/src/router/response"
	"github.com/skkuding/codedang/apps/iris/src/service/logger"
	"go.opentelemetry.io/otel/trace"
)

type routerTestLogger struct{}

func (routerTestLogger) Log(logger.Level, string)                             {}
func (routerTestLogger) LogWithContext(logger.Level, string, context.Context) {}
func (routerTestLogger) Panic(message string)                                 { panic(message) }

func TestRouteRejectsMissingPathOrID(t *testing.T) {
	for _, test := range []struct {
		name string
		path string
		id   string
	}{
		{name: "missing path", id: "42"},
		{name: "missing id", path: "judge"},
	} {
		t.Run(test.name, func(t *testing.T) {
			out := make(chan response.Response, 1)
			NewRouter(nil, nil, nil, nil, nil, routerTestLogger{}, trace.NewNoopTracerProvider().Tracer("test")).Route(
				test.path, test.id, nil, out, context.Background(),
			)

			got := <-out
			var payload struct {
				Error string `json:"error"`
			}
			if err := json.Unmarshal(got.Message, &payload); err != nil {
				t.Fatalf("decode response: %v", err)
			}
			if payload.Error == "" {
				t.Fatalf("response = %s, want an error", got.Message)
			}
			if test.path == "" && got.Type != string(constants.Default) {
				t.Fatalf("response type = %q, want %q", got.Type, constants.Default)
			}
		})
	}
}

func TestRouteReturnsJudgeAndSubmissionErrorsWhenFactoryFails(t *testing.T) {
	log := routerTestLogger{}
	r := NewRouter(
		nil,
		judge.NewFactory(nil, nil, log, trace.NewNoopTracerProvider().Tracer("test")),
		nil, nil, nil, log, trace.NewNoopTracerProvider().Tracer("test"),
	)
	out := make(chan response.Response, 2)
	r.Route(string(constants.Judge), "42", []byte("{"), out, context.Background())

	first, second := <-out, <-out
	var judgeError struct {
		Error string `json:"error"`
	}
	if err := json.Unmarshal(first.Message, &judgeError); err != nil {
		t.Fatalf("decode judge response: %v", err)
	}
	if first.Type != string(constants.Judge) || judgeError.Error == "" {
		t.Fatalf("first response = (%q, %s), want judge error", first.Type, first.Message)
	}
	if second.Type != string(constants.Submission) || !strings.Contains(string(second.Message), "judgeResults") {
		t.Fatalf("second response = (%q, %s), want submission error", second.Type, second.Message)
	}
}

func TestRouteRejectsUnsupportedPathWithoutResponse(t *testing.T) {
	out := make(chan response.Response, 1)
	r := NewRouter(nil, nil, nil, nil, nil, routerTestLogger{}, trace.NewNoopTracerProvider().Tracer("test"))
	r.Route("unknown", "42", nil, out, context.Background())

	if len(out) != 0 {
		t.Fatalf("got %d responses, want none", len(out))
	}
}
