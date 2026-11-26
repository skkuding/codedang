package rabbitmq

import (
	"errors"
	"slices"
	"testing"

	amqp "github.com/rabbitmq/amqp091-go"
)

func TestProducerOpenChannel(t *testing.T) {
	tests := []struct {
		name       string
		openErr    error
		confirmErr error
		wantErr    string
		wantCalls  []string
	}{
		{name: "success", wantCalls: []string{"open", "confirm", "notify", "start"}},
		{name: "channel_failure", openErr: errors.New("connection failed"), wantErr: "channel: connection failed", wantCalls: []string{"open"}},
		{name: "confirm_failure", confirmErr: errors.New("confirm failed"), wantErr: "channel could not be put into confirm mode: confirm failed", wantCalls: []string{"open", "confirm"}},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Inert AMQP objects are used only for identity checks.
			connection := &amqp.Connection{}
			channel := &amqp.Channel{}
			p := &producer{connection: connection}
			var calls []string
			// Distinct return channel verifies that the handler receives the
			// result of NotifyPublish, not merely the input channel.
			registered := make(chan amqp.Confirmation, 10)
			defer close(registered)
			open := func(got *amqp.Connection) (*amqp.Channel, error) {
				calls = append(calls, "open")
				if got != connection {
					t.Fatal("open must receive the producer's connection")
				}
				if tt.openErr != nil {
					return nil, tt.openErr
				}
				return channel, nil
			}
			confirm := func(got *amqp.Channel, noWait bool) error {
				calls = append(calls, "confirm")
				if got != channel || noWait {
					t.Fatalf("unexpected Confirm arguments: channel=%p, noWait=%v", got, noWait)
				}
				return tt.confirmErr
			}
			notifyPublish := func(got *amqp.Channel, listener chan amqp.Confirmation) chan amqp.Confirmation {
				calls = append(calls, "notify")
				if got != channel || listener == nil || cap(listener) != 10 || len(listener) != 0 {
					t.Fatalf("unexpected NotifyPublish target or listener: channel=%p, listener=%v, capacity=%d, length=%d", got, listener, cap(listener), len(listener))
				}
				if listener == registered {
					t.Fatal("test requires distinct input and returned listener")
				}
				return registered
			}
			startHandler := func(got chan amqp.Confirmation) {
				calls = append(calls, "start")
				if got != registered {
					t.Fatal("handler must receive the returned NotifyPublish channel")
				}
			}

			err := p.openChannel(open, confirm, notifyPublish, startHandler)
			if !slices.Equal(calls, tt.wantCalls) {
				t.Fatalf("calls = %v, want %v", calls, tt.wantCalls)
			}
			if tt.wantErr != "" {
				if err == nil || err.Error() != tt.wantErr {
					t.Fatalf("error = %v, want %q", err, tt.wantErr)
				}
				return
			}
			if err != nil {
				t.Fatalf("unexpected error: %v", err)
			}
			if p.channel != channel {
				t.Fatal("producer must store the returned channel")
			}
		})
	}
}
