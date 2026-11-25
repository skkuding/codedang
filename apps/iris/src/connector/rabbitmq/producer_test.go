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

// NewProducer only stores the logger; its methods must not be called.
type producerLoggerFake struct{ logger.Logger }

func TestNewProducer(t *testing.T) {
	config := ProducerConfig{
		AmqpURI:        "amqp://producer.invalid/vhost",
		ConnectionName: "producer-connection",
		ExchangeName:   "results",
		RoutingKey:     "judge.result",
	}
	wantAMQPConfig := amqp.Config{
		Properties: amqp.Table{"connection_name": "producer-connection"},
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
			log := &producerLoggerFake{}

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

			got, err := newProducer(config, log, buildConfig, dial)

			if !slices.Equal(calls, tt.wantCalls) {
				t.Fatalf("calls = %v, want %v", calls, tt.wantCalls)
			}
			if tt.wantErr != nil {
				if got != nil || !errors.Is(err, tt.wantErr) {
					t.Fatalf("producer = %v, error = %v; want nil and wrapped %v", got, err, tt.wantErr)
				}
				return
			}
			if err != nil || got == nil {
				t.Fatalf("NewProducer failed: producer = %v, error = %v", got, err)
			}
			if got.connection != connection || got.channel != nil {
				t.Fatal("connection must be stored and AMQP channel must remain uninitialized")
			}
			if got.exchangeName != config.ExchangeName || got.routingKey != config.RoutingKey || got.logger != log {
				t.Fatal("producer must preserve exchange name, routing key and logger")
			}
			if got.Done == nil || cap(got.Done) != 0 {
				t.Fatal("Done must be an initialized unbuffered channel")
			}
			if got.publishes == nil || cap(got.publishes) != 8 || len(got.publishes) != 0 {
				t.Fatal("publishes must be an initialized empty channel with capacity 8")
			}
		})
	}
}
