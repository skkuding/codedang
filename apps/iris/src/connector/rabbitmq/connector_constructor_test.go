package rabbitmq

import (
	"testing"

	"github.com/skkuding/codedang/apps/iris/src/router"
	"github.com/skkuding/codedang/apps/iris/src/service/logger"
)

// NewConnector must only store these dependencies, never call their methods.
type connectorConsumerFake struct{ Consumer }
type connectorProducerFake struct{ Producer }
type connectorRouterFake struct{ router.Router }
type connectorLoggerFake struct{ logger.Logger }

func TestNewConnector(t *testing.T) {
	consumer := &connectorConsumerFake{}
	producer := &connectorProducerFake{}
	router := &connectorRouterFake{}
	logger := &connectorLoggerFake{}

	got := NewConnector(consumer, producer, router, logger)

	if got == nil {
		t.Fatal("NewConnector must return a connector")
	}
	if got.consumer != consumer || got.producer != producer || got.router != router || got.logger != logger {
		t.Fatal("connector must preserve all supplied dependencies")
	}
	if got.Done == nil || cap(got.Done) != 0 {
		t.Fatal("Done must be an initialized unbuffered channel")
	}
}
