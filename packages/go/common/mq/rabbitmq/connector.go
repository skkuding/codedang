package rabbitmq

import (
	"context"
	"fmt"
	"time"

	commonlogger "github.com/skkuding/codedang/packages/go/common/logger"
	"github.com/skkuding/codedang/packages/go/common/mq"

	amqp "github.com/rabbitmq/amqp091-go"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/trace"
)

type Router interface {
	Route(path string, id string, data []byte, out chan<- mq.Response, ctx context.Context)
}

type ConnectorConfig struct {
	MessageTimeout time.Duration
}

type Connector struct {
	consumer Consumer
	producer Producer
	router   Router
	timeout  time.Duration
	Done     chan error
	logger   commonlogger.Logger
}

func NewConnector(
	consumer Consumer,
	producer Producer,
	router Router,
	logger commonlogger.Logger,
	config ConnectorConfig,
) *Connector {
	return &Connector{
		consumer: consumer, producer: producer, router: router,
		timeout: config.MessageTimeout, Done: make(chan error), logger: logger,
	}
}

func (c *Connector) Connect(ctx context.Context) {
	defer func() {
		c.consumer.CleanUp()
		c.producer.CleanUp()
	}()

	err := c.consumer.OpenChannel()
	if err != nil {
		c.logger.Panic(fmt.Sprintf("failed to open channel: %s", err))
	}

	err = c.producer.OpenChannel()
	if err != nil {
		c.logger.Panic(fmt.Sprintf("failed to open channel: %s", err))
	}

	messageCh, err := c.consumer.Subscribe()
	if err != nil {
		c.logger.Panic(fmt.Sprintf("failed to subscribe: %s", err))
	}

	for message := range messageCh {
		go c.handle(message, ctx)
	}

	c.logger.Log(commonlogger.DEBUG, "connector done")
}

func (c *Connector) Disconnect() {}

func (c *Connector) handle(message amqp.Delivery, ctx context.Context) {
	carrier := convertTableToHeaderCarrier(message.Headers)

	extractedCtx := otel.GetTextMapPropagator().Extract(ctx, carrier)
	span := trace.SpanFromContext(extractedCtx)
	tracer := otel.Tracer("Connector")
	spanCtx, childSpan := tracer.Start(
		extractedCtx,
		"connector:handle",
		trace.WithLinks(trace.Link{SpanContext: span.SpanContext()}), // Client-API로부터 전달받은 SpanContext를 연결
		trace.WithSpanKind(trace.SpanKindConsumer),
	)
	defer childSpan.End()
	timeout := c.timeout
	spanCtx, cancel := context.WithTimeout(spanCtx, timeout)
	defer cancel()

	resultChan := make(chan mq.Response, 1)
	go func() {
		defer close(resultChan)
		c.router.Route(message.Type, message.MessageId, message.Body, resultChan, spanCtx)
	}()

drain:
	for {
		var result mq.Response
		var open bool
		select {
		case result, open = <-resultChan:
			if !open {
				break drain
			}
		case <-spanCtx.Done():
			c.logger.LogWithContext(commonlogger.ERROR, fmt.Sprintf("message handling timed out after %s", timeout), spanCtx)
			break drain
		}

		if err := c.producer.Publish(result.Message, spanCtx, result.Type); err != nil {
			c.logger.LogWithContext(commonlogger.ERROR, fmt.Sprintf("failed to publish result: %s: %s", string(result.Message), err), spanCtx)
			// nack
		} else {
			c.logger.LogWithContext(commonlogger.DEBUG, fmt.Sprintf("result published: %s", string(result.Message)), spanCtx)
		}
	}

	if err := message.Ack(false); err != nil {
		c.logger.LogWithContext(commonlogger.ERROR, fmt.Sprintf("failed to ack message: %s: %s", string(message.Body), err), spanCtx)
		// retry
	} else {
		c.logger.LogWithContext(commonlogger.DEBUG, "message ack", spanCtx)
	}
}
