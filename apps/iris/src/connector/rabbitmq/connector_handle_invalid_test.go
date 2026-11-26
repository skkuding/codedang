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
	"github.com/stretchr/testify/assert"
)

func TestHandleMissingMessageProperties(t *testing.T) {
	const wantJSON = `{"submissionId":0,"resultCode":9,"judgeResult":null,"error":"Internal server error"}`
	tests := []struct {
		name        string
		messageType string
		messageID   string
		wantType    string
	}{
		{name: "missing_type", messageType: "", messageID: "123", wantType: "judge"},
		{name: "missing_message_id", messageType: "run", messageID: "", wantType: "run"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Setenv(MessageTimeoutEnv, "")
			ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
			defer cancel()

			type event struct {
				kind        string
				body        []byte
				messageType string
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
				route: func(_ constants.MessageType, _ string, _ []byte, _ chan<- response.Response, _ context.Context) {
					record(event{kind: "route"})
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
				Type:         tt.messageType,
				MessageId:    tt.messageID,
				Body:         []byte(`{"code":"sample"}`),
				DeliveryTag:  42,
				Acknowledger: ack,
			}

			conn := NewConnector(nil, producer, router, log)
			conn.handle(message, ctx)

			mu.Lock()
			got := slices.Clone(events)
			mu.Unlock()

			var calls []string
			for _, e := range got {
				switch e.kind {
				case "route":
					calls = append(calls, e.kind)
				case "publish":
					calls = append(calls, e.kind)
					assert.JSONEq(t, wantJSON, string(e.body))
					assert.Equal(t, tt.wantType, e.messageType)
					assert.NotNil(t, e.ctx)
				case "ack":
					calls = append(calls, e.kind)
					assert.Equal(t, message.DeliveryTag, e.tag)
					assert.False(t, e.multiple)
				case "log":
					if e.level != logger.DEBUG {
						t.Errorf("unexpected log level %v: %s", e.level, e.body)
					}
				}
			}
			if !slices.Equal(calls, []string{"publish", "ack"}) {
				t.Errorf("calls = %v, want [publish ack] without Route", calls)
			}
		})
	}
}
