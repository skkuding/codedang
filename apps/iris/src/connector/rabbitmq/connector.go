package rabbitmq

import (
	"context"
	"fmt"
	"time"

	amqp "github.com/rabbitmq/amqp091-go"
	"github.com/skkuding/codedang/apps/iris/src/router"
	"github.com/skkuding/codedang/apps/iris/src/service/logger"
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
		panic(err)
	}

	err = c.producer.OpenChannel()
	if err != nil {
		panic(err)
	}

	messageCh, err := c.consumer.Subscribe()
	if err != nil {
		panic(err)
	}

	// [mq.ingress]     consume -> handle -> 														  produce
	// [mq.controller]							| controller -> 	controller(result) -> |
	// [handler]													  | handler -> |
	// i.consume(messageCh, i.Done)
	for message := range messageCh {
		go c.handle(message, connectorCtx)
	}

	c.logger.Log(logger.DEBUG, "connector done")
	// running until Consumer is done
	// <-i.Done

	// if err := i.consumer.CleanUp(); err != nil {
	// 	i.logger.Error(fmt.Sprintf("failed to clean up the consumer: %s", err))
	// }
}

func (c *connector) Disconnect() {}

func (c *connector) handle(message amqp.Delivery, ctx context.Context) {

	resultChan := make(chan []byte)
	if message.Type == "" {
		resultChan <- router.NewResponse("", nil, fmt.Errorf("type(message property) must not be empty")).Marshal()
		close(resultChan)
	} else if message.MessageId == "" {
		resultChan <- router.NewResponse("", nil, fmt.Errorf("message_id(message property) must not be empty")).Marshal()
		close(resultChan)
	} else {
		go c.router.Route(message.Type, message.MessageId, message.Body, resultChan)
	}

	for result := range resultChan {
		if err := c.producer.Publish(result, ctx); err != nil {
			c.logger.Log(logger.ERROR, fmt.Sprintf("failed to publish result: %s: %s", string(result), err))
			// nack
		} else {
			c.logger.Log(logger.DEBUG, fmt.Sprintf("result published: %s", string(result)))
		}
	}

	if err := message.Ack(false); err != nil {
		c.logger.Log(logger.ERROR, fmt.Sprintf("failed to ack message: %s: %s", string(message.Body), err))
		// retry
	} else {
		c.logger.Log(logger.DEBUG, "message ack")
	}

}
