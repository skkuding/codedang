package connector

import (
	"fmt"

	"github.com/skkuding/codedang/apps/iris/src/connector/mq"
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

func Factory(c Module, p Providers) Connector {
	switch c {
	case RABBIT_MQ:
		return mq.NewConnector(p.Router, p.Logger)
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
