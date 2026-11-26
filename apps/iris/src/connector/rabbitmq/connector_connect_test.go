package rabbitmq

import (
	"context"
	"errors"
	"reflect"
	"slices"
	"testing"

	amqp "github.com/rabbitmq/amqp091-go"
	"github.com/skkuding/codedang/apps/iris/src/service/logger"
)

type connectConsumerFake struct {
	Consumer
	open      func() error
	subscribe func() (<-chan amqp.Delivery, error)
	clean     func() error
}

func (f *connectConsumerFake) OpenChannel() error                       { return f.open() }
func (f *connectConsumerFake) Subscribe() (<-chan amqp.Delivery, error) { return f.subscribe() }
func (f *connectConsumerFake) CleanUp() error                           { return f.clean() }

type connectProducerFake struct {
	Producer
	open  func() error
	clean func() error
}

func (f *connectProducerFake) OpenChannel() error { return f.open() }
func (f *connectProducerFake) CleanUp() error     { return f.clean() }

type connectLoggerFake struct {
	logger.Logger
	log      func(logger.Level, string)
	panicLog func(string)
}

func (f *connectLoggerFake) Log(level logger.Level, msg string) { f.log(level, msg) }
func (f *connectLoggerFake) Panic(msg string)                   { f.panicLog(msg) }

func TestConnect(t *testing.T) {
	a := amqp.Delivery{MessageId: "A", DeliveryTag: 1, Type: "judge", Body: []byte("first"), Headers: amqp.Table{"key": "a"}}
	b := amqp.Delivery{MessageId: "B", DeliveryTag: 2, Type: "run", Body: []byte("second")}
	c := amqp.Delivery{MessageId: "C", DeliveryTag: 3, Type: "judge", Body: []byte("third")}
	tests := []struct {
		name         string
		messages     []amqp.Delivery
		consumerErr  error
		producerErr  error
		subscribeErr error
		wantPanic    string
		wantCalls    []string
	}{
		{name: "empty_channel", wantCalls: []string{"consumer.open", "producer.open", "consumer.subscribe", "log", "consumer.cleanup", "producer.cleanup"}},
		{name: "single_message", messages: []amqp.Delivery{a}, wantCalls: []string{"consumer.open", "producer.open", "consumer.subscribe", "dispatch:A", "log", "consumer.cleanup", "producer.cleanup"}},
		{name: "multiple_messages", messages: []amqp.Delivery{a, b, c}, wantCalls: []string{"consumer.open", "producer.open", "consumer.subscribe", "dispatch:A", "dispatch:B", "dispatch:C", "log", "consumer.cleanup", "producer.cleanup"}},
		{name: "consumer_open_failure", consumerErr: errors.New("consumer open error"), wantPanic: "failed to open channel: consumer open error", wantCalls: []string{"consumer.open", "panic", "consumer.cleanup", "producer.cleanup"}},
		{name: "producer_open_failure", producerErr: errors.New("producer open error"), wantPanic: "failed to open channel: producer open error", wantCalls: []string{"consumer.open", "producer.open", "panic", "consumer.cleanup", "producer.cleanup"}},
		{name: "subscribe_failure", subscribeErr: errors.New("subscribe error"), wantPanic: "failed to subscribe: subscribe error", wantCalls: []string{"consumer.open", "producer.open", "consumer.subscribe", "panic", "consumer.cleanup", "producer.cleanup"}},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			ctx, cancel := context.WithCancel(context.Background())
			defer cancel()
			messageCh := make(chan amqp.Delivery, len(tt.messages))
			for _, message := range tt.messages {
				messageCh <- message
			}
			close(messageCh)

			var calls []string
			var received []amqp.Delivery
			var loggedLevel logger.Level
			var loggedMessage, panicMessage string
			sentinel := new(struct{ name string })
			consumer := &connectConsumerFake{
				open: func() error { calls = append(calls, "consumer.open"); return tt.consumerErr },
				subscribe: func() (<-chan amqp.Delivery, error) {
					calls = append(calls, "consumer.subscribe")
					if tt.subscribeErr != nil {
						return nil, tt.subscribeErr
					}
					return messageCh, nil
				},
				clean: func() error { calls = append(calls, "consumer.cleanup"); return nil },
			}
			producer := &connectProducerFake{
				open:  func() error { calls = append(calls, "producer.open"); return tt.producerErr },
				clean: func() error { calls = append(calls, "producer.cleanup"); return nil },
			}
			log := &connectLoggerFake{
				log: func(level logger.Level, msg string) {
					calls = append(calls, "log")
					loggedLevel, loggedMessage = level, msg
				},
				panicLog: func(msg string) { calls = append(calls, "panic"); panicMessage = msg; panic(sentinel) },
			}
			conn := NewConnector(consumer, producer, &connectorRouterFake{}, log)
			var recovered any
			func() {
				defer func() { recovered = recover() }()
				conn.connect(ctx, func(message amqp.Delivery, gotCtx context.Context) {
					calls = append(calls, "dispatch:"+message.MessageId)
					received = append(received, message)
					if gotCtx != ctx {
						t.Error("dispatch must receive the supplied context")
					}
				})
			}()
			if !slices.Equal(calls, tt.wantCalls) {
				t.Fatalf("calls = %v, want %v", calls, tt.wantCalls)
			}
			if !reflect.DeepEqual(received, tt.messages) {
				t.Errorf("dispatched deliveries = %#v, want %#v", received, tt.messages)
			}
			if tt.wantPanic != "" {
				if recovered != sentinel || panicMessage != tt.wantPanic {
					t.Fatalf("panic = %v, message = %q, want logger panic %q", recovered, panicMessage, tt.wantPanic)
				}
			} else {
				if recovered != nil {
					t.Fatalf("unexpected panic: %v", recovered)
				}
				if loggedLevel != logger.DEBUG || loggedMessage != "connector done" {
					t.Errorf("normal log = (%v,%q), want DEBUG, connector done", loggedLevel, loggedMessage)
				}
			}
		})
	}
}
