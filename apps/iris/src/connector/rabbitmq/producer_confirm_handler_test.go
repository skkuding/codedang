package rabbitmq

import (
	"context"
	"slices"
	"testing"
	"time"

	amqp "github.com/rabbitmq/amqp091-go"
	"github.com/skkuding/codedang/apps/iris/src/service/logger"
)

type confirmHandlerEvent struct {
	level   logger.Level
	message string
	isPanic bool
}

type confirmHandlerLoggerSpy struct {
	logger.Logger
	events     []confirmHandlerEvent
	panicToken *struct{ name string }
}

func (s *confirmHandlerLoggerSpy) Log(level logger.Level, msg string) {
	s.events = append(s.events, confirmHandlerEvent{level: level, message: msg})
}

func (s *confirmHandlerLoggerSpy) Panic(msg string) {
	s.events = append(s.events, confirmHandlerEvent{message: msg, isPanic: true})
	panic(s.panicToken)
}

func TestProducerConfirmHandler(t *testing.T) {
	stop := confirmHandlerEvent{level: logger.INFO, message: "confirmHandler is stopping"}
	tests := []struct {
		name         string
		publish      bool
		confirmation *amqp.Confirmation
		wantPanic    bool
		wantEvents   []confirmHandlerEvent
	}{
		{name: "done", wantEvents: []confirmHandlerEvent{stop}},
		{name: "publish_sequence", publish: true, wantEvents: []confirmHandlerEvent{stop}},
		{name: "ack", confirmation: &amqp.Confirmation{DeliveryTag: 1, Ack: true}, wantEvents: []confirmHandlerEvent{
			{level: logger.DEBUG, message: "tag : 1"},
			{level: logger.DEBUG, message: "confirmed delivery with delivery tag: 1"},
			stop,
		}},
		{name: "nack", confirmation: &amqp.Confirmation{DeliveryTag: 1, Ack: false}, wantEvents: []confirmHandlerEvent{
			{level: logger.DEBUG, message: "tag : 1"},
			{level: logger.ERROR, message: "failed delivery of delivery tag: 1"},
			stop,
		}},
		{name: "invalid_tag", confirmation: &amqp.Confirmation{DeliveryTag: 0, Ack: false}, wantPanic: true, wantEvents: []confirmHandlerEvent{
			{level: logger.DEBUG, message: "tag : 0"},
			{message: "delivery tag must be a positive integer value: received: 0", isPanic: true},
		}},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
			defer cancel()
			spy := &confirmHandlerLoggerSpy{panicToken: &struct{ name string }{name: "logger panic"}}
			p := &producer{logger: spy, Done: make(chan error), publishes: make(chan uint64)}
			confirms := make(chan amqp.Confirmation)
			// Keep input channels open. Closing confirms/publishes would
			// exercise existing defects outside the approved scenarios.
			defer close(p.Done)

			type outcome struct {
				events    []confirmHandlerEvent
				recovered any
			}
			finished := make(chan outcome, 1)
			go func() {
				defer func() {
					finished <- outcome{events: spy.events, recovered: recover()}
				}()
				p.confirmHandler(confirms)
			}()

			// Each send rendezvous is ordered. No sleeping or assumptions
			// about select ordering when multiple cases are ready.
			if tt.publish {
				select {
				case p.publishes <- 1:
				case result := <-finished:
					t.Fatalf("handler exited before consuming publish sequence: %+v", result)
				case <-ctx.Done():
					t.Fatal("publish sequence was not consumed")
				}
			}
			if tt.confirmation != nil {
				select {
				case confirms <- *tt.confirmation:
				case result := <-finished:
					t.Fatalf("handler exited before consuming confirmation: %+v", result)
				case <-ctx.Done():
					t.Fatal("confirmation was not consumed")
				}
			}
			if !tt.wantPanic {
				select {
				case p.Done <- nil:
				case result := <-finished:
					t.Fatalf("handler exited before receiving Done: %+v", result)
				case <-ctx.Done():
					t.Fatal("Done was not consumed")
				}
			}

			// Only read Spy results after the handler has exited.
			select {
			case result := <-finished:
				if tt.wantPanic {
					if result.recovered != spy.panicToken {
						t.Fatalf("expected Logger.Panic sentinel, got %v", result.recovered)
					}
				} else if result.recovered != nil {
					t.Fatalf("unexpected panic: %v", result.recovered)
				}
				if !slices.Equal(result.events, tt.wantEvents) {
					t.Fatalf("events = %+v, want %+v", result.events, tt.wantEvents)
				}
			case <-ctx.Done():
				t.Fatal("handler did not finish")
			}
		})
	}
}
