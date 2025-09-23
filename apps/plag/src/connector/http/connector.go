package http

import (
	"github.com/skkuding/codedang/iris/src/service/logger"
)

type connector struct {
	done   chan error
	logger logger.Logger
}

func NewConnector(
	logger logger.Logger,
) *connector {
	return &connector{make(chan error), logger}
}
