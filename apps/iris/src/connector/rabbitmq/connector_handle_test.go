package rabbitmq

import (
	"bytes"
	"context"
	"slices"
	"sync"
	"testing"
	"time"

	amqp "github.com/rabbitmq/amqp091-go"
	"github.com/skkuding/codedang/apps/iris/src/common/constants"
	"github.com/skkuding/codedang/apps/iris/src/router/response"
	"github.com/skkuding/codedang/apps/iris/src/service/logger"
)

type handleRouterStub struct {
	route func(constants.MessageType, string, []byte, chan<- response.Response, context.Context)
}

func (s *handleRouterStub) Route(path constants.MessageType, id string, body []byte, out chan<- response.Response, ctx context.Context) {
	s.route(path, id, body, out, ctx)
}

type handleProducerStub struct {
	Producer
	publish func([]byte, context.Context, string) error
}

func (s *handleProducerStub) Publish(body []byte, ctx context.Context, messageType string) error {
	return s.publish(body, ctx, messageType)
}

type handleAckSpy struct {
	amqp.Acknowledger
	ack func(uint64, bool) error
}

func (s *handleAckSpy) Ack(tag uint64, multiple bool) error {
	return s.ack(tag, multiple)
}

type handleLoggerSpy struct {
	logger.Logger
	log func(logger.Level, string, context.Context)
}

func (s *handleLoggerSpy) LogWithContext(level logger.Level, message string, ctx context.Context) {
	s.log(level, message, ctx)
}

func TestHandleNormalMessage(t *testing.T) {
	tests := []struct {
		name    string
		results []response.Response
	}{
		{
			name: "single_response",
			results: []response.Response{
				{Message: []byte(`{"result":"success"}`), Type: constants.Judge},
			},
		},
		{
			name: "multiple_responses",
			results: []response.Response{
				{Message: []byte("result-1"), Type: constants.Judge},
				{Message: []byte("result-2"), Type: constants.Judge},
				{Message: []byte("result-3"), Type: constants.Submission},
			},
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Setenv(MessageTimeoutEnv, "")
			ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
			defer cancel()

			type event struct {
				kind        string
				messageType string
				id          string
				body        []byte
				ctx         context.Context
				tag         uint64
				multiple    bool
				level       logger.Level
			}
			var mu sync.Mutex
			var events []event
			record := func(e event) {
				mu.Lock()
				defer mu.Unlock()
				e.body = bytes.Clone(e.body)
				events = append(events, e)
			}

			router := &handleRouterStub{
				route: func(path constants.MessageType, id string, body []byte, out chan<- response.Response, ctx context.Context) {
					record(event{kind: "route", messageType: string(path), id: id, body: body, ctx: ctx})
					defer record(event{kind: "route.return"})
					for _, result := range tt.results {
						select {
						case out <- result:
						case <-ctx.Done():
							return
						}
					}
				},
			}
			producer := &handleProducerStub{
				publish: func(body []byte, ctx context.Context, messageType string) error {
					record(event{kind: "publish", body: body, ctx: ctx, messageType: messageType})
					return nil
				},
			}
			ack := &handleAckSpy{
				ack: func(tag uint64, multiple bool) error {
					record(event{kind: "ack", tag: tag, multiple: multiple})
					return nil
				},
			}
			log := &handleLoggerSpy{
				log: func(level logger.Level, message string, ctx context.Context) {
					record(event{kind: "log", level: level, body: []byte(message), ctx: ctx})
				},
			}
			message := amqp.Delivery{
				Type:         "judge",
				MessageId:    "123",
				Body:         []byte(`{"code":"sample"}`),
				DeliveryTag:  42,
				Acknowledger: ack,
			}

			conn := NewConnector(nil, producer, router, log)
			conn.handle(message, ctx)

			mu.Lock()
			got := slices.Clone(events)
			mu.Unlock()

			wantCalls := []string{"route"}
			for range tt.results {
				wantCalls = append(wantCalls, "publish")
			}
			wantCalls = append(wantCalls, "ack")
			var calls []string
			var routeCtx context.Context
			published := 0
			routeReturns := 0
			for _, e := range got {
				switch e.kind {
				case "route":
					calls = append(calls, e.kind)
					if e.messageType != message.Type || e.id != message.MessageId || !bytes.Equal(e.body, message.Body) {
						t.Errorf("Route args = (%q, %q, %q), want (%q, %q, %q)", e.messageType, e.id, e.body, message.Type, message.MessageId, message.Body)
					}
					routeCtx = e.ctx
					if routeCtx == nil {
						t.Error("Route received nil context")
					}
				case "route.return":
					routeReturns++
				case "publish":
					calls = append(calls, e.kind)
					if published >= len(tt.results) {
						t.Fatalf("unexpected Publish call: %+v", e)
					}
					want := tt.results[published]
					if !bytes.Equal(e.body, want.Message) || e.messageType != string(want.Type) {
						t.Errorf("Publish[%d] = (%q, %q), want (%q, %q)", published, e.body, e.messageType, want.Message, want.Type)
					}
					if routeCtx == nil || e.ctx != routeCtx {
						t.Error("Publish must receive the same processing context as Route")
					}
					published++
				case "ack":
					calls = append(calls, e.kind)
					if e.tag != message.DeliveryTag || e.multiple {
						t.Errorf("Ack = (%d, %t), want (%d, false)", e.tag, e.multiple, message.DeliveryTag)
					}
					if routeReturns != 1 {
						t.Errorf("Ack before Router completion: %d route returns", routeReturns)
					}
					if published != len(tt.results) {
						t.Errorf("Ack after %d Publish calls, want %d", published, len(tt.results))
					}
				case "log":
					if e.level != logger.DEBUG {
						t.Errorf("unexpected log level %v: %s", e.level, e.body)
					}
				}
			}
			if !slices.Equal(calls, wantCalls) {
				t.Errorf("calls = %v, want %v", calls, wantCalls)
			}
			if routeReturns != 1 {
				t.Errorf("Router completion count = %d, want 1", routeReturns)
			}
		})
	}
}
