package rabbitmq

import (
	"context"
	"errors"
	"reflect"
	"slices"
	"testing"
	"time"

	amqp "github.com/rabbitmq/amqp091-go"
	"github.com/skkuding/codedang/apps/iris/src/service/logger"
)

func TestProducerPublish(t *testing.T) {
	tests := []struct {
		name       string
		publishErr error
		wantErr    string
		wantSeq    bool
	}{
		{name: "success", wantSeq: true},
		{name: "publish_failure", publishErr: errors.New("publish failed"), wantErr: "exchange publish: publish failed"},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			type contextKey struct{}
			parent, cancel := context.WithTimeout(context.WithValue(context.Background(), contextKey{}, "publish-test"), 5*time.Second)
			defer cancel()
			channel := &amqp.Channel{}
			spy := &confirmHandlerLoggerSpy{}
			p := &producer{
				channel:      channel,
				exchangeName: "test.exchange",
				routingKey:   "test.result",
				publishes:    make(chan uint64, 8),
				logger:       spy,
			}
			result := []byte(`{"result":"success"}`)
			// No trace/baggage input and no global OTel configuration changes.
			want := amqp.Publishing{
				Headers:         amqp.Table{},
				ContentType:     "application/json",
				ContentEncoding: "",
				Body:            []byte(`{"result":"success"}`),
				DeliveryMode:    2,
				Priority:        0,
				Type:            "judge",
			}
			info := []confirmHandlerEvent{
				{level: logger.INFO, message: "publishing 20B body"},
				{level: logger.INFO, message: `{"result":"success"}`},
			}
			var calls []string
			getNext := func(got *amqp.Channel) uint64 {
				calls = append(calls, "sequence")
				if got != channel {
					t.Error("sequence lookup must use producer channel")
				}
				if len(spy.events) != 0 || len(p.publishes) != 0 {
					t.Error("sequence lookup must precede logging and registration")
				}
				return 42
			}
			publish := func(got *amqp.Channel, ctx context.Context, exchange, routingKey string, mandatory, immediate bool, message amqp.Publishing) error {
				calls = append(calls, "publish")
				if got != channel || exchange != "test.exchange" || routingKey != "test.result" || mandatory || immediate {
					t.Errorf("unexpected AMQP arguments: %p %q %q %t %t", got, exchange, routingKey, mandatory, immediate)
				}
				if ctx == nil || ctx.Value(contextKey{}) != "publish-test" || ctx.Err() != nil {
					t.Error("Publish must preserve the processing context")
				} else {
					gotDeadline, gotOK := ctx.Deadline()
					wantDeadline, wantOK := parent.Deadline()
					if !gotOK || !wantOK || !gotDeadline.Equal(wantDeadline) {
						t.Error("Publish must preserve the processing deadline")
					}
				}
				if !reflect.DeepEqual(message, want) {
					t.Errorf("Publishing = %#v, want %#v", message, want)
				}
				if !slices.Equal(spy.events, info) || len(p.publishes) != 0 {
					t.Error("Publish must follow INFO logs and precede sequence registration")
				}
				return tt.publishErr
			}

			err := p.publish(result, parent, "judge", getNext, publish)
			if !slices.Equal(calls, []string{"sequence", "publish"}) {
				t.Errorf("calls = %v, want [sequence publish]", calls)
			}
			wantLogs := slices.Clone(info)
			if tt.wantErr != "" {
				if err == nil || err.Error() != tt.wantErr {
					t.Errorf("error = %v, want %q", err, tt.wantErr)
				}
			} else {
				if err != nil {
					t.Errorf("unexpected error: %v", err)
				}
				wantLogs = append(wantLogs, confirmHandlerEvent{level: logger.DEBUG, message: "published 20B OK"})
			}
			if !slices.Equal(spy.events, wantLogs) {
				t.Errorf("logs = %+v, want %+v", spy.events, wantLogs)
			}
			if tt.wantSeq {
				select {
				case seq := <-p.publishes:
					if seq != 42 {
						t.Errorf("registered sequence = %d, want 42", seq)
					}
				default:
					t.Error("successful publish must register sequence")
				}
			}
			if len(p.publishes) != 0 {
				t.Errorf("unexpected remaining registered sequences: %d", len(p.publishes))
			}
		})
	}
}
