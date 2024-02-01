package connector

import (
	"fmt"

	"github.com/skkuding/codedang/iris/src/connector/rabbitmq"
	"github.com/skkuding/codedang/iris/src/router"
	"github.com/skkuding/codedang/iris/src/service/logger"
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
			panic(fmt.Sprintf("Invalid consumer config: %v", consumerConfig))
		}
		consumer, err := rabbitmq.NewConsumer(consumerConfig, p.Logger)
		if err != nil {
			panic(err)
		}

		producerConfig, ok := args[1].(rabbitmq.ProducerConfig)
		if !ok {
			panic(fmt.Sprintf("Invalid producer config: %v", producerConfig))
		}
		producer, err := rabbitmq.NewProducer(producerConfig, p.Logger)
		if err != nil {
			panic(err)
		}

		return rabbitmq.NewConnector(consumer, producer, p.Router, p.Logger)
	case HTTP:
    
		panic("Need to be implemented")
	case FILE:
		panic("Need to be implemented")
	case CONSOLE:
		panic("Need to be implemented")
	default:
		panic("Unsupported Connector")
	}
}
