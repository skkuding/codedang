package mq

import (
	"context"
	"fmt"

	"github.com/skkuding/codedang/apps/plag/src/router"
	"github.com/skkuding/codedang/apps/plag/src/service/logger"
	"github.com/skkuding/codedang/packages/go/common/mq/rabbitmq"
)

type connector struct {
	common *rabbitmq.Connector
}

var _ rabbitmq.Router = (router.Router)(nil)

func NewConnector(routeProvider router.Router, logProvider logger.Logger) *connector {
	consumerConfig, producerConfig, connectorConfig := configFromEnv(logProvider)
	consumer, err := rabbitmq.NewConsumer(consumerConfig, logProvider)
	if err != nil {
		logProvider.Panic(fmt.Sprintf("Failed to create consumer: %v", err))
	}

	producer, err := rabbitmq.NewProducer(producerConfig, logProvider)
	if err != nil {
		logProvider.Panic(fmt.Sprintf("Failed to create producer: %v", err))
	}

	return &connector{
		common: rabbitmq.NewConnector(consumer, producer, routeProvider, logProvider, connectorConfig),
	}
}

func (c *connector) Connect(ctx context.Context) {
	c.common.Connect(ctx)
}

func (c *connector) Disconnect() {
	c.common.Disconnect()
}
