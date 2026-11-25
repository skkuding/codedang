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

type handleSettlementObserver struct {
	observe func(string, uint64, bool, bool)
}

func (s *handleSettlementObserver) Ack(tag uint64, multiple bool) error {
	s.observe("ack", tag, multiple, false)
	return nil
}

func (s *handleSettlementObserver) Nack(tag uint64, multiple, requeue bool) error {
	s.observe("nack", tag, multiple, requeue)
	return nil
}

func (s *handleSettlementObserver) Reject(tag uint64, requeue bool) error {
	s.observe("reject", tag, false, requeue)
	return nil
}

func TestHandlePublishFailure(t *testing.T) {
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
			return errors.New("publish failed")
		},
	}
	ack := &handleSettlementObserver{
		observe: func(kind string, tag uint64, multiple, requeue bool) {
			record(event{kind: kind, tag: tag, multiple: multiple, requeue: requeue})
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
	got := append([]event(nil), events...)
	mu.Unlock()

	const wantLog = "failed to publish result: result-1: publish failed"
	var routeCtx, publishCtx context.Context
	routeCalls, publishCalls, errorLogs := 0, 0, 0
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
			if string(e.body) != "result-1" || e.messageType != "judge" {
				t.Errorf("Publish args = (%q, %q), want (result-1, judge)", e.body, e.messageType)
			}
			if routeCtx == nil || e.ctx != routeCtx {
				t.Error("Publish must receive the same processing context as Route")
			}
		case "log":
			if string(e.body) == wantLog {
				errorLogs++
				if e.level != logger.ERROR || publishCalls != 1 || e.ctx != publishCtx {
					t.Errorf("publish failure log must follow Publish, use ERROR and preserve its context: %+v", e)
				}
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
	if routeCalls != 1 || publishCalls != 1 || errorLogs != 1 {
		t.Errorf("Route/Publish/failure log counts = %d/%d/%d, want 1/1/1", routeCalls, publishCalls, errorLogs)
	}
}
