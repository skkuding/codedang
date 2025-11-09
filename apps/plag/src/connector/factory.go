package connector

import (
	"fmt"

	"github.com/skkuding/codedang/apps/plag/src/connector/rabbitmq"
	"github.com/skkuding/codedang/apps/plag/src/router"
	"github.com/skkuding/codedang/apps/plag/src/service/logger"
)

type Providers struct {
	Router router.Router
	Logger logger.Logger
}

type Module string

const (
	RABBIT_MQ Module = "RabbitMQ"
	HTTP      Module = "Http"
	FILE      Module = "File"
	CONSOLE   Module = "Console"
)

func Factory(c Module, p Providers, args ...any) Connector {
	switch c {
	case RABBIT_MQ:
		consumerConfig, ok := args[0].(rabbitmq.ConsumerConfig)
		if !ok {
			p.Logger.Panic(fmt.Sprintf("Invalid consumer config: %v", consumerConfig))
		}
		consumer, err := rabbitmq.NewConsumer(consumerConfig, p.Logger)
		if err != nil {
			p.Logger.Panic(fmt.Sprintf("Failed to create consumer: %v", err))
		}

		producerConfig, ok := args[1].(rabbitmq.ProducerConfig)
		if !ok {
			p.Logger.Panic(fmt.Sprintf("Invalid producer config: %v", producerConfig))
		}
		producer, err := rabbitmq.NewProducer(producerConfig, p.Logger)
		if err != nil {
			p.Logger.Panic(fmt.Sprintf("Failed to create producer: %v", err))
		}

		return rabbitmq.NewConnector(consumer, producer, p.Router, p.Logger)
	case HTTP:
		p.Logger.Panic("HTTP connector need to be implemented")
	case FILE:
		p.Logger.Panic("File connector need to be implemented")
	case CONSOLE:
		p.Logger.Panic("Console connector need to be implemented")
	default:
		p.Logger.Panic(fmt.Sprintf("Invalid connector type: %s", c))
	}
	return nil
}
