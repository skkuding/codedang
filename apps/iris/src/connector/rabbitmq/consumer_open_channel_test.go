package rabbitmq

import (
	"errors"
	"slices"
	"testing"

	amqp "github.com/rabbitmq/amqp091-go"
)

func TestConsumerOpenChannel(t *testing.T) {
	tests := []struct {
		name      string
		openErr   error
		qosErr    error
		wantErr   string
		wantCalls []string
	}{
		{name: "success", wantCalls: []string{"open", "qos"}},
		{name: "channel_failure", openErr: errors.New("connection failed"), wantErr: "channel: connection failed", wantCalls: []string{"open"}},
		{name: "qos_failure", qosErr: errors.New("qos failed"), wantErr: "qos set: qos failed", wantCalls: []string{"open", "qos"}},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// These inert objects are used only for identity checks.
			connection := &amqp.Connection{}
			channel := &amqp.Channel{}
			c := &consumer{connection: connection}
			var calls []string
			open := func(got *amqp.Connection) (*amqp.Channel, error) {
				calls = append(calls, "open")
				if got != connection {
					t.Fatal("open must receive the consumer's connection")
				}
				if tt.openErr != nil {
					return nil, tt.openErr
				}
				return channel, nil
			}
			qos := func(got *amqp.Channel, count, size int, global bool) error {
				calls = append(calls, "qos")
				if got != channel || count != 1 || size != 0 || global {
					t.Fatalf("unexpected QoS target or arguments: channel=%p, count=%d, size=%d, global=%v", got, count, size, global)
				}
				return tt.qosErr
			}
			err := c.openChannel(open, qos)
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
			if c.channel != channel {
				t.Fatal("consumer must store the returned channel")
			}
		})
	}
}
