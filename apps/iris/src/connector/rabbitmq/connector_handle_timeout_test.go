package rabbitmq

import (
	"bytes"
	"context"
	"sync"
	"testing"
	"time"

	amqp "github.com/rabbitmq/amqp091-go"
	"github.com/skkuding/codedang/apps/iris/src/common/constants"
	"github.com/skkuding/codedang/apps/iris/src/router/response"
	"github.com/skkuding/codedang/apps/iris/src/service/logger"
)

func TestHandleTimeout(t *testing.T) {
	tests := []struct {
		name           string
		env            string
		timeout        time.Duration
		waitForTimeout bool
		wantLog        string
		wantLevel      logger.Level
		wantPublishes  int
	}{
		{
			name: "before_first_response", env: "50", timeout: 50 * time.Millisecond,
			waitForTimeout: true, wantLog: "message handling timed out after 50ms",
			wantLevel: logger.ERROR, wantPublishes: 0,
		},
		{
			name: "invalid_env_uses_default", env: "abc", timeout: 10 * time.Minute,
			wantLog:   "invalid IRIS_MESSAGE_TIMEOUT_MS: must be a positive integer; using default",
			wantLevel: logger.WARN, wantPublishes: 1,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Setenv(MessageTimeoutEnv, tt.env)
			// No parent deadline: the observed deadline must come from handle.
			ctx, cancel := context.WithCancel(context.Background())
			defer cancel()
			watchdog := time.AfterFunc(5*time.Second, cancel)
			defer watchdog.Stop()

			release := make(chan struct{})
			routeDone := make(chan struct{})
			var releaseOnce sync.Once
			releaseRouter := func() { releaseOnce.Do(func() { close(release) }) }
			defer releaseRouter()

			type event struct {
				kind        string
				body        []byte
				messageType string
				id          string
				ctx         context.Context
				ctxErr      error
				deadline    time.Time
				hasDeadline bool
				level       logger.Level
				tag         uint64
				multiple    bool
				requeue     bool
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
					defer close(routeDone)
					deadline, ok := ctx.Deadline()
					record(event{kind: "route", messageType: string(path), id: id, body: body, ctx: ctx, deadline: deadline, hasDeadline: ok})
					if tt.waitForTimeout {
						// Do not return on ctx.Done(): handle must observe timeout
						// while the result channel remains open and empty.
						<-release
						return
					}
					select {
					case out <- response.Response{Message: []byte("result-1"), Type: constants.Judge}:
					case <-ctx.Done():
					}
				},
			}
			producer := &handleProducerStub{
				publish: func(body []byte, ctx context.Context, messageType string) error {
					record(event{kind: "publish", body: body, ctx: ctx, messageType: messageType, ctxErr: ctx.Err()})
					return nil
				},
			}
			ack := &handleSettlementObserver{
				observe: func(kind string, tag uint64, multiple, requeue bool) {
					record(event{kind: kind, tag: tag, multiple: multiple, requeue: requeue})
				},
			}
			log := &handleLoggerSpy{
				log: func(level logger.Level, message string, ctx context.Context) {
					record(event{kind: "log", level: level, body: []byte(message), ctx: ctx, ctxErr: ctx.Err()})
				},
			}
			message := amqp.Delivery{
				Type: "judge", MessageId: "123", Body: []byte("sample"),
				DeliveryTag: 42, Acknowledger: ack,
			}
			conn := NewConnector(nil, producer, router, log)
			start := time.Now()
			conn.handle(message, ctx)
			returned := time.Now()
			// Only release the stub after handle has returned.
			releaseRouter()
			select {
			case <-routeDone:
			case <-time.After(2 * time.Second):
				t.Fatal("Router stub did not complete")
			}
			mu.Lock()
			got := append([]event(nil), events...)
			mu.Unlock()

			var routeCtx context.Context
			var timeoutLogCtx context.Context
			routeCalls, publishCalls, matchingLogs := 0, 0, 0
			ackCalls, nackCalls, rejectCalls := 0, 0, 0
			for _, e := range got {
				switch e.kind {
				case "route":
					routeCalls++
					routeCtx = e.ctx
					if e.messageType != message.Type || e.id != message.MessageId || !bytes.Equal(e.body, message.Body) {
						t.Errorf("unexpected Route args: (%q, %q, %q)", e.messageType, e.id, e.body)
					}
					if !e.hasDeadline || e.deadline.Before(start.Add(tt.timeout)) || e.deadline.After(returned.Add(tt.timeout)) {
						t.Errorf("deadline %v must be within handle execution interval plus %v", e.deadline, tt.timeout)
					}
					t.Logf("observed configured deadline: %v", e.deadline.Sub(start))
				case "publish":
					publishCalls++
					if string(e.body) != "result-1" || e.messageType != "judge" || routeCtx == nil || e.ctx != routeCtx || e.ctxErr != nil {
						t.Errorf("unexpected Publish args/context: %+v", e)
					}
				case "log":
					if string(e.body) == tt.wantLog {
						matchingLogs++
						if e.level != tt.wantLevel {
							t.Errorf("log level = %v, want %v", e.level, tt.wantLevel)
						}
						if tt.waitForTimeout {
							timeoutLogCtx = e.ctx
							if e.ctxErr != context.DeadlineExceeded {
								t.Errorf("timeout context error = %v, want DeadlineExceeded", e.ctxErr)
							}
						}
					} else if e.level == logger.ERROR || e.level == logger.WARN {
						t.Errorf("unexpected warning/error log: %s", e.body)
					}
				case "ack", "nack", "reject":
					switch e.kind {
					case "ack":
						ackCalls++
					case "nack":
						nackCalls++
					case "reject":
						rejectCalls++
					}
					t.Logf("observed settlement (not an assertion): %s tag=%d multiple=%t requeue=%t", e.kind, e.tag, e.multiple, e.requeue)
				}
			}
			t.Logf("observed settlement counts (not assertions): ACK=%d NACK=%d Reject=%d", ackCalls, nackCalls, rejectCalls)
			if routeCalls != 1 || publishCalls != tt.wantPublishes || matchingLogs != 1 {
				t.Errorf("Route/Publish/target log counts = %d/%d/%d, want 1/%d/1", routeCalls, publishCalls, matchingLogs, tt.wantPublishes)
			}
			if tt.waitForTimeout && (routeCtx == nil || timeoutLogCtx != routeCtx) {
				t.Error("timeout log must carry the Router processing context")
			}
			if ctx.Err() != nil {
				t.Error("test watchdog canceled the parent context")
			}
		})
	}
}
