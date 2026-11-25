package connector

import (
	"fmt"

	"github.com/skkuding/codedang/apps/iris/src/connector/rabbitmq"
	"github.com/skkuding/codedang/apps/iris/src/router"
	"github.com/skkuding/codedang/apps/iris/src/service/logger"
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

// Inject constructors to test factory assembly and error handling
// without establishing RabbitMQ connections.
type factoryConstructors struct {
	newConsumer  func(rabbitmq.ConsumerConfig, logger.Logger) (rabbitmq.Consumer, error)
	newProducer  func(rabbitmq.ProducerConfig, logger.Logger) (rabbitmq.Producer, error)
	newConnector func(rabbitmq.Consumer, rabbitmq.Producer, router.Router, logger.Logger) Connector
}

func Factory(c Module, p Providers, args ...any) Connector {
	return factory(c, p, factoryConstructors{
		newConsumer: func(config rabbitmq.ConsumerConfig, log logger.Logger) (rabbitmq.Consumer, error) {
			return rabbitmq.NewConsumer(config, log)
		},
		newProducer: func(config rabbitmq.ProducerConfig, log logger.Logger) (rabbitmq.Producer, error) {
			return rabbitmq.NewProducer(config, log)
		},
		newConnector: func(consumer rabbitmq.Consumer, producer rabbitmq.Producer, route router.Router, log logger.Logger) Connector {
			return rabbitmq.NewConnector(consumer, producer, route, log)
		},
	}, args...)
}

func factory(c Module, p Providers, constructors factoryConstructors, args ...any) Connector {
	switch c {
	case RABBIT_MQ:
		consumerConfig, ok := args[0].(rabbitmq.ConsumerConfig)
		if !ok {
			p.Logger.Panic(fmt.Sprintf("Invalid consumer config: %v", consumerConfig))
		}
		consumer, err := constructors.newConsumer(consumerConfig, p.Logger)
		if err != nil {
			p.Logger.Panic(fmt.Sprintf("Failed to create consumer: %v", err))
		}

		producerConfig, ok := args[1].(rabbitmq.ProducerConfig)
		if !ok {
			p.Logger.Panic(fmt.Sprintf("Invalid producer config: %v", producerConfig))
		}
		producer, err := constructors.newProducer(producerConfig, p.Logger)
		if err != nil {
			p.Logger.Panic(fmt.Sprintf("Failed to create producer: %v", err))
		}

		return constructors.newConnector(consumer, producer, p.Router, p.Logger)
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
