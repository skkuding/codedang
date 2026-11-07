package mq

import (
	"context"
	"fmt"

	"github.com/skkuding/codedang/apps/iris/src/service/logger"
	"github.com/skkuding/codedang/packages/go/common/mq/rabbitmq"
)

type connector struct {
	common *rabbitmq.Connector
}

func NewConnector(router rabbitmq.Router, logProvider logger.Logger, args ...any) *connector {
	consumerConfig, ok := args[0].(rabbitmq.ConsumerConfig)
	if !ok {
		logProvider.Panic(fmt.Sprintf("Invalid consumer config: %v", consumerConfig))
	}
	consumer, err := rabbitmq.NewConsumer(consumerConfig, logProvider)
	if err != nil {
		logProvider.Panic(fmt.Sprintf("Failed to create consumer: %v", err))
	}

	producerConfig, ok := args[1].(rabbitmq.ProducerConfig)
	if !ok {
		logProvider.Panic(fmt.Sprintf("Invalid producer config: %v", producerConfig))
	}
	producer, err := rabbitmq.NewProducer(producerConfig, logProvider)
	if err != nil {
		logProvider.Panic(fmt.Sprintf("Failed to create producer: %v", err))
	}

	connectorConfig, ok := args[2].(rabbitmq.ConnectorConfig)
	if !ok {
		logProvider.Panic(fmt.Sprintf("Invalid connector config: %v", connectorConfig))
	}
	return &connector{
		common: rabbitmq.NewConnector(consumer, producer, router, logProvider, connectorConfig),
	}
}

func (c *connector) Connect(ctx context.Context) {
	c.common.Connect(ctx)
}

func (c *connector) Disconnect() {
	c.common.Disconnect()
}
