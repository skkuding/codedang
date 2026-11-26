package rabbitmq

import (
	"bytes"
	"context"
	"errors"
	"sync"
	"testing"
	"time"

	amqp "github.com/rabbitmq/amqp091-go"
	"github.com/skkuding/codedang/apps/iris/src/common/constants"
	"github.com/skkuding/codedang/apps/iris/src/router/response"
	"github.com/skkuding/codedang/apps/iris/src/service/logger"
)

func TestHandleAckFailure(t *testing.T) {
	t.Setenv(MessageTimeoutEnv, "")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	type event struct {
		kind        string
		body        []byte
		messageType string
		id          string
		ctx         context.Context
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
			record(event{kind: "route", messageType: string(path), id: id, body: body, ctx: ctx})
			select {
			case out <- response.Response{Message: []byte("result-1"), Type: constants.Judge}:
			case <-ctx.Done():
			}
		},
	}
	producer := &handleProducerStub{
		publish: func(body []byte, ctx context.Context, messageType string) error {
			record(event{kind: "publish", body: body, ctx: ctx, messageType: messageType})
			return nil
		},
	}
	settlement := &handleSettlementObserver{
		observe: func(kind string, tag uint64, multiple, requeue bool) {
			record(event{kind: kind, tag: tag, multiple: multiple, requeue: requeue})
		},
	}
	var firstAck sync.Once
	ack := &handleAckSpy{
		Acknowledger: settlement,
		ack: func(tag uint64, multiple bool) error {
			settlement.observe("ack", tag, multiple, false)
			var err error
			firstAck.Do(func() { err = errors.New("ack failed") })
			return err
		},
	}
	log := &handleLoggerSpy{
		log: func(level logger.Level, message string, ctx context.Context) {
			record(event{kind: "log", body: []byte(message), ctx: ctx, level: level})
		},
	}
	message := amqp.Delivery{
		Type: "judge", MessageId: "123", Body: []byte("sample"),
		DeliveryTag: 42, Acknowledger: ack,
	}
	conn := NewConnector(nil, producer, router, log)
	conn.handle(message, ctx)

	mu.Lock()
	got := append([]event(nil), events...)
	mu.Unlock()

	const wantLog = "failed to ack message: sample: ack failed"
	var routeCtx, publishCtx context.Context
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
		case "publish":
			publishCalls++
			publishCtx = e.ctx
			if string(e.body) != "result-1" || e.messageType != "judge" || routeCtx == nil || e.ctx != routeCtx {
				t.Errorf("unexpected Publish args/context: %+v", e)
			}
		case "ack":
			ackCalls++
			if ackCalls == 1 {
				if e.tag != 42 || e.multiple || publishCalls != 1 {
					t.Errorf("first Ack = (%d, %t), after %d publishes; want (42, false) after one successful Publish", e.tag, e.multiple, publishCalls)
				}
			}
			t.Logf("observed settlement: ACK tag=%d multiple=%t", e.tag, e.multiple)
		case "nack":
			nackCalls++
			t.Logf("observed settlement (not an assertion): NACK tag=%d multiple=%t requeue=%t", e.tag, e.multiple, e.requeue)
		case "reject":
			rejectCalls++
			t.Logf("observed settlement (not an assertion): Reject tag=%d requeue=%t", e.tag, e.requeue)
		case "log":
			if string(e.body) == wantLog {
				matchingLogs++
				if e.level != logger.ERROR || ackCalls < 1 || publishCtx == nil || e.ctx != publishCtx {
					t.Errorf("ACK failure log must follow first ACK, use ERROR and preserve processing context: %+v", e)
				}
			}
		}
	}
	if routeCalls != 1 || publishCalls != 1 || ackCalls < 1 || matchingLogs < 1 {
		t.Errorf("Route/Publish/ACK/failure log counts = %d/%d/%d/%d, want 1/1/at least 1/at least 1", routeCalls, publishCalls, ackCalls, matchingLogs)
	}
	t.Logf("observed retry/settlement counts (not assertions): ACK=%d NACK=%d Reject=%d", ackCalls, nackCalls, rejectCalls)
}
