package rabbitmq

import (
	"errors"
	"reflect"
	"slices"
	"testing"
	"time"

	amqp "github.com/rabbitmq/amqp091-go"
	"github.com/skkuding/codedang/apps/iris/src/service/logger"
)

// NewConsumer only stores the logger; its methods must not be called.
type consumerLoggerFake struct{ logger.Logger }

func TestNewConsumer(t *testing.T) {
	config := ConsumerConfig{
		AmqpURI:        "amqp://consumer.invalid/vhost",
		ConnectionName: "consumer-connection",
		QueueName:      "requests",
		Ctag:           "consumer-tag",
	}
	wantAMQPConfig := amqp.Config{
		Properties: amqp.Table{"connection_name": "consumer-connection"},
		Heartbeat:  17 * time.Second,
	}
	configErr := errors.New("config creation failed")
	dialErr := errors.New("connection failed")

	tests := []struct {
		name      string
		configErr error
		dialErr   error
		wantCalls []string
		wantErr   error
	}{
		{name: "success", wantCalls: []string{"config", "dial"}},
		{name: "config_creation_failure", configErr: configErr, wantCalls: []string{"config"}, wantErr: configErr},
		{name: "connection_failure", dialErr: dialErr, wantCalls: []string{"config", "dial"}, wantErr: dialErr},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			var calls []string
			// Inert object used only for identity checks; no AMQP methods are called.
			connection := &amqp.Connection{}
			log := &consumerLoggerFake{}

			buildConfig := func(name string) (amqp.Config, error) {
				calls = append(calls, "config")
				if name != config.ConnectionName {
					t.Fatalf("connection name = %q, want %q", name, config.ConnectionName)
				}
				if tt.configErr != nil {
					return amqp.Config{}, tt.configErr
				}
				return wantAMQPConfig, nil
			}
			dial := func(uri string, cfg amqp.Config) (*amqp.Connection, error) {
				calls = append(calls, "dial")
				if uri != config.AmqpURI {
					t.Fatalf("URI = %q, want %q", uri, config.AmqpURI)
				}
				if !reflect.DeepEqual(cfg, wantAMQPConfig) {
					t.Fatalf("AMQP config = %+v, want %+v", cfg, wantAMQPConfig)
				}
				if tt.dialErr != nil {
					return nil, tt.dialErr
				}
				return connection, nil
			}

			got, err := newConsumer(config, log, buildConfig, dial)

			if !slices.Equal(calls, tt.wantCalls) {
				t.Fatalf("calls = %v, want %v", calls, tt.wantCalls)
			}
			if tt.wantErr != nil {
				if got != nil || !errors.Is(err, tt.wantErr) {
					t.Fatalf("consumer = %v, error = %v; want nil and wrapped %v", got, err, tt.wantErr)
				}
				return
			}
			if err != nil || got == nil {
				t.Fatalf("NewConsumer failed: consumer = %v, error = %v", got, err)
			}
			if got.connection != connection || got.channel != nil {
				t.Fatal("connection must be stored and AMQP channel must remain uninitialized")
			}
			if got.queueName != config.QueueName || got.tag != config.Ctag || got.logger != log {
				t.Fatal("consumer must preserve queue name, tag and logger")
			}
			if got.Done == nil || cap(got.Done) != 0 {
				t.Fatal("Done must be an initialized unbuffered channel")
			}
		})
	}
}
