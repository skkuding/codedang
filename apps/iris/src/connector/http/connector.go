package http

import (
	"github.com/skkuding/codedang/iris/src/service/logger"
)

type connector struct {
	done   chan error
	logger logger.Logger
}

// NewConnector returns an HTTP connector. It is a placeholder; Factory does
// not create it yet.
func NewConnector(
	logger logger.Logger,
) *connector {
	return &connector{make(chan error), logger}
}
