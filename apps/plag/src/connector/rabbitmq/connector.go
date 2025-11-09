package rabbitmq

import (
	"context"
	"fmt"
	"time"

	amqp "github.com/rabbitmq/amqp091-go"
	instrumentation "github.com/skkuding/codedang/apps/plag/src"
	"github.com/skkuding/codedang/apps/plag/src/router"
	"github.com/skkuding/codedang/apps/plag/src/service/logger"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/trace"
)

type connector struct {
	consumer Consumer
	producer Producer
	router   router.Router
	Done     chan error
	logger   logger.Logger
}

func NewConnector(
	consumer Consumer,
	producer Producer,
	router router.Router,
	logger logger.Logger,
) *connector {
	return &connector{consumer, producer, router, make(chan error), logger}
}

func (c *connector) Connect(ctx context.Context) {
	connectorCtx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer func() {
		cancel()
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
		go c.handle(message, connectorCtx)
	}

	c.logger.Log(logger.DEBUG, "connector done")
}

func (c *connector) Disconnect() {}

func (c *connector) handle(message amqp.Delivery, ctx context.Context) {
	carrier := convertTableToHeaderCarrier(message.Headers)

	extractedCtx := otel.GetTextMapPropagator().Extract(ctx, carrier)
	span := trace.SpanFromContext(extractedCtx)
	tracer := otel.Tracer("Connector")
	spanCtx, childSpan := tracer.Start(
		extractedCtx,
		instrumentation.GetSemanticSpanName("connector", "handle"),
		trace.WithLinks(trace.Link{SpanContext: span.SpanContext()}), // Client-API로부터 전달받은 SpanContext를 연결
		trace.WithSpanKind(trace.SpanKindConsumer),
	)
	defer childSpan.End()

	resultChan := make(chan []byte)
	if message.Type == "" {
		resultChan <- router.NewResponse("", nil, fmt.Errorf("type(message property) must not be empty")).Marshal()
		close(resultChan)
	} else if message.MessageId == "" {
		resultChan <- router.NewResponse("", nil, fmt.Errorf("message_id(message property) must not be empty")).Marshal()
		close(resultChan)
	} else {
		go c.router.Route(message.Type, message.MessageId, message.Body, resultChan, spanCtx)
	}

	for result := range resultChan {
		if err := c.producer.Publish(result, spanCtx, message.Type); err != nil {
			c.logger.LogWithContext(logger.ERROR, fmt.Sprintf("failed to publish result: %s: %s", string(result), err), spanCtx)
			// nack
		} else {
			c.logger.LogWithContext(logger.DEBUG, fmt.Sprintf("result published: %s", string(result)), spanCtx)
		}
	}

	if err := message.Ack(false); err != nil {
		c.logger.LogWithContext(logger.ERROR, fmt.Sprintf("failed to ack message: %s: %s", string(message.Body), err), spanCtx)
		// retry
	} else {
		c.logger.LogWithContext(logger.DEBUG, "message ack", spanCtx)
	}
}
