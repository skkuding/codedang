package rabbitmq

import (
	"context"
	"errors"
	"testing"

	amqp "github.com/rabbitmq/amqp091-go"
	commonlogger "github.com/skkuding/codedang/packages/go/common/logger"
)

type startupTestLogger struct{}

func (startupTestLogger) Log(commonlogger.Level, string)                             {}
func (startupTestLogger) LogWithContext(commonlogger.Level, string, context.Context) {}
func (startupTestLogger) Panic(message string)                                       { panic(message) }

type startupTestConsumer struct {
	openErr      error
	subscribeErr error
	deliveries   <-chan amqp.Delivery
	opened       bool
	subscribed   bool
	cleaned      bool
}

func (c *startupTestConsumer) OpenChannel() error {
	c.opened = true
	return c.openErr
}
func (c *startupTestConsumer) Subscribe() (<-chan amqp.Delivery, error) {
	c.subscribed = true
	return c.deliveries, c.subscribeErr
}
func (c *startupTestConsumer) CleanUp() error { c.cleaned = true; return nil }

type startupTestProducer struct {
	openErr error
	opened  bool
	cleaned bool
}

func (p *startupTestProducer) OpenChannel() error                          { p.opened = true; return p.openErr }
func (*startupTestProducer) Publish([]byte, context.Context, string) error { return nil }
func (p *startupTestProducer) CleanUp() error                              { p.cleaned = true; return nil }

func TestConnectorConnectOpensSubscribesAndCleansUp(t *testing.T) {
	deliveries := make(chan amqp.Delivery)
	close(deliveries)
	consumer := &startupTestConsumer{deliveries: deliveries}
	producer := &startupTestProducer{}
	c := NewConnector(consumer, producer, nil, startupTestLogger{}, ConnectorConfig{})
	c.Connect(context.Background())
	if !consumer.opened || !consumer.subscribed || !producer.opened || !consumer.cleaned || !producer.cleaned {
		t.Fatalf("startup/cleanup incomplete: consumer=%+v producer=%+v", consumer, producer)
	}
}

func TestConnectorConnectCleansUpAfterStartupErrors(t *testing.T) {
	for _, test := range []struct {
		name         string
		consumerErr  error
		producerErr  error
		subscribeErr error
	}{
		{name: "consumer channel", consumerErr: errors.New("consumer open")},
		{name: "producer channel", producerErr: errors.New("producer open")},
		{name: "subscribe", subscribeErr: errors.New("subscribe")},
	} {
		t.Run(test.name, func(t *testing.T) {
			consumer := &startupTestConsumer{openErr: test.consumerErr, subscribeErr: test.subscribeErr}
			producer := &startupTestProducer{openErr: test.producerErr}
			c := NewConnector(consumer, producer, nil, startupTestLogger{}, ConnectorConfig{})
			assertPanics(t, func() { c.Connect(context.Background()) })
			if !consumer.cleaned || !producer.cleaned {
				t.Fatalf("startup failure leaked resources: consumer=%+v producer=%+v", consumer, producer)
			}
		})
	}
}

func assertPanics(t *testing.T, fn func()) {
	t.Helper()
	defer func() {
		if recover() == nil {
			t.Fatal("expected panic")
		}
	}()
	fn()
}
