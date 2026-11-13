package rabbitmq

import (
	"context"
	"errors"
	"strings"
	"testing"
	"time"

	amqp "github.com/rabbitmq/amqp091-go"
	commonlogger "github.com/skkuding/codedang/packages/go/common/logger"
	"github.com/skkuding/codedang/packages/go/common/mq"
)

type connectorTestLogger struct{ messages []string }

func (l *connectorTestLogger) Log(_ commonlogger.Level, message string) {
	l.messages = append(l.messages, message)
}
func (l *connectorTestLogger) LogWithContext(_ commonlogger.Level, message string, _ context.Context) {
	l.messages = append(l.messages, message)
}
func (*connectorTestLogger) Panic(message string) { panic(message) }

type connectorTestRouter func(string, string, []byte, chan<- mq.Response, context.Context)

func (r connectorTestRouter) Route(path, id string, body []byte, out chan<- mq.Response, ctx context.Context) {
	r(path, id, body, out, ctx)
}

type connectorTestProducer struct {
	message []byte
	typ     string
	err     error
}

func (p *connectorTestProducer) OpenChannel() error { return nil }
func (p *connectorTestProducer) Publish(message []byte, _ context.Context, typ string) error {
	p.message, p.typ = message, typ
	return p.err
}
func (*connectorTestProducer) CleanUp() error { return nil }

type connectorTestAcknowledger struct {
	acked bool
	err   error
}

func (a *connectorTestAcknowledger) Ack(uint64, bool) error      { a.acked = true; return a.err }
func (*connectorTestAcknowledger) Nack(uint64, bool, bool) error { return nil }
func (*connectorTestAcknowledger) Reject(uint64, bool) error     { return nil }

func TestConnectorHandlePublishesAndAcknowledges(t *testing.T) {
	producer := &connectorTestProducer{}
	ack := &connectorTestAcknowledger{}
	router := connectorTestRouter(func(path, id string, body []byte, out chan<- mq.Response, _ context.Context) {
		if path != "check" || id != "42" || string(body) != "request" {
			t.Errorf("Route() got (%q, %q, %q)", path, id, body)
		}
		out <- mq.Response{Message: []byte("result"), Type: "check-result"}
	})
	c := NewConnector(nil, producer, router, &connectorTestLogger{}, ConnectorConfig{MessageTimeout: time.Second})
	c.handle(amqp.Delivery{Acknowledger: ack, Type: "check", MessageId: "42", Body: []byte("request")}, context.Background())

	if string(producer.message) != "result" || producer.typ != "check-result" || !ack.acked {
		t.Fatalf("got publish=(%q, %q), ack=%t", producer.message, producer.typ, ack.acked)
	}
}

func TestConnectorHandleTimeoutAndPublishAckErrors(t *testing.T) {
	t.Run("timeout", func(t *testing.T) {
		producer := &connectorTestProducer{}
		ack := &connectorTestAcknowledger{}
		router := connectorTestRouter(func(_, _ string, _ []byte, _ chan<- mq.Response, ctx context.Context) { <-ctx.Done() })
		c := NewConnector(nil, producer, router, &connectorTestLogger{}, ConnectorConfig{MessageTimeout: time.Millisecond})
		c.handle(amqp.Delivery{Acknowledger: ack}, context.Background())
		if !ack.acked || producer.message != nil {
			t.Fatalf("timeout result: ack=%t publish=%q", ack.acked, producer.message)
		}
	})

	t.Run("publish and ack errors", func(t *testing.T) {
		producer := &connectorTestProducer{err: errors.New("publish failed")}
		ack := &connectorTestAcknowledger{err: errors.New("ack failed")}
		logger := &connectorTestLogger{}
		router := connectorTestRouter(func(_, _ string, _ []byte, out chan<- mq.Response, _ context.Context) {
			out <- mq.Response{Message: []byte("result"), Type: "result"}
		})
		c := NewConnector(nil, producer, router, logger, ConnectorConfig{MessageTimeout: time.Second})
		c.handle(amqp.Delivery{Acknowledger: ack}, context.Background())
		joined := strings.Join(logger.messages, "\n")
		if !ack.acked || !strings.Contains(joined, "failed to publish result") || !strings.Contains(joined, "failed to ack message") {
			t.Fatalf("missing error handling: ack=%t logs=%v", ack.acked, logger.messages)
		}
	})
}
