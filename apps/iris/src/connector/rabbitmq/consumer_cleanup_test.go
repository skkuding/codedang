package rabbitmq

import (
	"errors"
	"slices"
	"testing"

	amqp "github.com/rabbitmq/amqp091-go"
	"github.com/skkuding/codedang/apps/iris/src/service/logger"
)

type consumerCleanupLoggerSpy struct {
	logger.Logger
	log func(logger.Level, string)
}

func (s *consumerCleanupLoggerSpy) Log(level logger.Level, msg string) {
	s.log(level, msg)
}

func TestConsumerCleanUp(t *testing.T) {
	cancelErr := errors.New("cancel failed")
	closeErr := errors.New("close failed")
	doneErr := errors.New("handler failed")
	tests := []struct {
		name       string
		cancelErr  error
		closeErr   error
		signalDone bool
		doneErr    error
		closeDone  bool
		wantErr    string
		wantCause  error
		wantCalls  []string
	}{
		{name: "success", signalDone: true, wantCalls: []string{"debug", "cancel", "close", "info"}},
		{name: "cancel_failure", cancelErr: cancelErr, wantErr: "Consumer cancel failed: cancel failed", wantCause: cancelErr, wantCalls: []string{"debug", "cancel"}},
		{name: "close_failure", closeErr: closeErr, wantErr: "AMQP connection close error: close failed", wantCalls: []string{"debug", "cancel", "close"}},
		{name: "done_error", signalDone: true, doneErr: doneErr, wantErr: "handler failed", wantCalls: []string{"debug", "cancel", "close", "info"}},
		{name: "done_closed", closeDone: true, wantCalls: []string{"debug", "cancel", "close", "info"}},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Inert AMQP objects are only used for reference checks.
			channel := &amqp.Channel{}
			connection := &amqp.Connection{}
			// Supply a deterministic completion signal without a sender goroutine.
			// This does not test the production shutdown synchronization policy.
			done := make(chan error, 1)
			if tt.signalDone {
				done <- tt.doneErr
			}
			if tt.closeDone {
				close(done)
			} else {
				defer close(done)
			}

			var calls []string
			log := &consumerCleanupLoggerSpy{log: func(level logger.Level, msg string) {
				switch {
				case level == logger.DEBUG && msg == "consumer clean up":
					calls = append(calls, "debug")
				case level == logger.INFO && msg == "RabbitMQ connection clear done":
					calls = append(calls, "info")
					if tt.signalDone && len(done) != 0 {
						t.Error("INFO logged before Done signal was consumed")
					}
				default:
					t.Fatalf("unexpected log: level=%v, message=%q", level, msg)
				}
			}}
			c := &consumer{channel: channel, connection: connection, tag: "consumer-tag", Done: done, logger: log}
			cancel := func(got *amqp.Channel, tag string, noWait bool) error {
				calls = append(calls, "cancel")
				if got != channel || tag != "consumer-tag" || !noWait {
					t.Fatalf("unexpected Cancel arguments: channel=%p, tag=%q, noWait=%v", got, tag, noWait)
				}
				return tt.cancelErr
			}
			closeConnection := func(got *amqp.Connection) error {
				calls = append(calls, "close")
				if got != connection {
					t.Fatal("Close must receive the consumer's connection")
				}
				return tt.closeErr
			}

			err := c.cleanUp(cancel, closeConnection)
			if !slices.Equal(calls, tt.wantCalls) {
				t.Fatalf("calls = %v, want %v", calls, tt.wantCalls)
			}
			if tt.wantErr == "" {
				if err != nil {
					t.Fatalf("unexpected error: %v", err)
				}
			} else if err == nil || err.Error() != tt.wantErr {
				t.Fatalf("error = %v, want %q", err, tt.wantErr)
			}
			if tt.wantCause != nil && !errors.Is(err, tt.wantCause) {
				t.Fatalf("error must wrap %v; got %v", tt.wantCause, err)
			}
			if tt.signalDone && (err != tt.doneErr || len(done) != 0) {
				t.Fatal("must consume and return the original Done signal")
			}
		})
	}
}
