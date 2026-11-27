package rabbitmq

import (
	"errors"
	"slices"
	"testing"

	amqp "github.com/rabbitmq/amqp091-go"
)

func TestProducerCleanUp(t *testing.T) {
	closeErr := errors.New("close failed")
	doneErr := errors.New("handler failed")
	tests := []struct {
		name          string
		channelErr    error
		connectionErr error
		signalDone    bool
		doneErr       error
		wantErr       string
		wantCalls     []string
	}{
		{name: "success", signalDone: true, wantCalls: []string{"channel", "connection"}},
		{name: "channel_close_failure", channelErr: closeErr, wantErr: "channel close failed: close failed", wantCalls: []string{"channel"}},
		{name: "connection_close_failure", connectionErr: closeErr, wantErr: "connection close error: close failed", wantCalls: []string{"channel", "connection"}},
		{name: "done_error", signalDone: true, doneErr: doneErr, wantErr: "handler failed", wantCalls: []string{"channel", "connection"}},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Inert AMQP objects are used solely for receiver identity.
			channel := &amqp.Channel{}
			connection := &amqp.Connection{}
			// Supply a value only to test its receipt and return.
			// No confirm handler or production shutdown synchronization is exercised.
			done := make(chan error, 1)
			if tt.signalDone {
				done <- tt.doneErr
			}
			defer close(done)
			p := &producer{channel: channel, connection: connection, Done: done}
			var calls []string

			closeChannel := func(got *amqp.Channel) error {
				calls = append(calls, "channel")
				if got != channel {
					t.Fatal("Close must receive the producer's channel")
				}
				if tt.signalDone && len(done) != 1 {
					t.Error("Done signal must not be consumed before channel close")
				}
				return tt.channelErr
			}
			closeConnection := func(got *amqp.Connection) error {
				calls = append(calls, "connection")
				if got != connection {
					t.Fatal("Close must receive the producer's connection")
				}
				if tt.signalDone && len(done) != 1 {
					t.Error("Done signal must not be consumed before connection close")
				}
				return tt.connectionErr
			}

			err := p.cleanUp(closeChannel, closeConnection)
			if !slices.Equal(calls, tt.wantCalls) {
				t.Errorf("calls = %v, want %v", calls, tt.wantCalls)
			}
			if tt.wantErr == "" {
				if err != nil {
					t.Errorf("unexpected error: %v", err)
				}
			} else if err == nil || err.Error() != tt.wantErr {
				t.Errorf("error = %v, want %q", err, tt.wantErr)
			}
			if tt.signalDone && (err != tt.doneErr || len(done) != 0) {
				t.Error("must consume and return the supplied Done value")
			}
		})
	}
}
