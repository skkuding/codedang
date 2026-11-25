package rabbitmq

import (
	"errors"
	"testing"

	amqp "github.com/rabbitmq/amqp091-go"
)

func TestConsumerSubscribe(t *testing.T) {
	tests := []struct {
		name       string
		consumeErr error
		wantErr    string
	}{
		{name: "success"},
		{name: "consume_failure", consumeErr: errors.New("consume failed"), wantErr: "queue consume: consume failed"},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			channel := &amqp.Channel{}
			messages := make(chan amqp.Delivery)
			defer close(messages)
			c := &consumer{channel: channel, queueName: "requests", tag: "consumer-tag"}
			calls := 0
			consume := func(got *amqp.Channel, queue, tag string, autoAck, exclusive, noLocal, noWait bool, args amqp.Table) (<-chan amqp.Delivery, error) {
				calls++
				if got != channel || queue != "requests" || tag != "consumer-tag" {
					t.Fatalf("unexpected Consume target or queue/tag: channel=%p, queue=%q, tag=%q", got, queue, tag)
				}
				if autoAck || exclusive || noLocal || noWait || args != nil {
					t.Fatalf("unexpected Consume options: autoAck=%v, exclusive=%v, noLocal=%v, noWait=%v, args=%v", autoAck, exclusive, noLocal, noWait, args)
				}
				if tt.consumeErr != nil {
					return nil, tt.consumeErr
				}
				return messages, nil
			}

			got, err := c.subscribe(consume)
			if calls != 1 {
				t.Fatalf("Consume calls = %d, want 1", calls)
			}
			if tt.wantErr != "" {
				if got != nil || err == nil || err.Error() != tt.wantErr {
					t.Fatalf("channel = %v, error = %v; want nil and %q", got, err, tt.wantErr)
				}
				return
			}
			if err != nil || got != (<-chan amqp.Delivery)(messages) {
				t.Fatalf("channel = %v, error = %v; want %v and nil", got, err, messages)
			}
		})
	}
}
