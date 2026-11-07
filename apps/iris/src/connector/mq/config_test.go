package mq

import (
	"context"
	"testing"
	"time"

	"github.com/skkuding/codedang/apps/iris/src/service/logger"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestMessageTimeoutFromEnv(t *testing.T) {
	t.Run("uses the default", func(t *testing.T) {
		t.Setenv(MessageTimeoutEnv, "")
		timeout, err := MessageTimeoutFromEnv()
		require.NoError(t, err)
		assert.Equal(t, time.Duration(DefaultMessageTimeoutMS)*time.Millisecond, timeout)
	})

	t.Run("uses a configured value", func(t *testing.T) {
		t.Setenv(MessageTimeoutEnv, "1234")
		timeout, err := MessageTimeoutFromEnv()
		require.NoError(t, err)
		assert.Equal(t, 1234*time.Millisecond, timeout)
	})

	t.Run("rejects a non-positive value", func(t *testing.T) {
		t.Setenv(MessageTimeoutEnv, "0")
		_, err := MessageTimeoutFromEnv()
		assert.EqualError(t, err, "must be a positive integer")
	})
}

type configTestLogger struct{ warnings int }

func (l *configTestLogger) Log(level logger.Level, _ string) {
	if level == logger.WARN {
		l.warnings++
	}
}
func (*configTestLogger) LogWithContext(logger.Level, string, context.Context) {}
func (*configTestLogger) Panic(message string)                                 { panic(message) }

func TestConfigFromEnv(t *testing.T) {
	for key, value := range map[string]string{
		"RABBITMQ_DEFAULT_USER":                  "user",
		"RABBITMQ_DEFAULT_PASS":                  "pass",
		"RABBITMQ_HOST":                          "broker",
		"RABBITMQ_PORT":                          "5672",
		"RABBITMQ_DEFAULT_VHOST":                 "vhost",
		"JUDGE_REQUEST_CONSUMER_CONNECTION_NAME": "consumer",
		"JUDGE_REQUEST_QUEUE_NAME":               "requests",
		"JUDGE_REQUEST_CONSUMER_TAG":             "tag",
		"JUDGE_RESULT_PRODUCER_CONNECTION_NAME":  "producer",
		"JUDGE_RESULT_EXCHANGE_NAME":             "results",
		"JUDGE_RESULT_ROUTING_KEY":               "result-key",
	} {
		t.Setenv(key, value)
	}
	for _, test := range []struct {
		name         string
		ssl          string
		timeout      string
		wantURI      string
		wantTLS      bool
		wantTimeout  time.Duration
		wantWarnings int
	}{
		{"default", "false", "", "amqp://user:pass@broker:5672/vhost", false, time.Duration(DefaultMessageTimeoutMS) * time.Millisecond, 0},
		{"TLS and configured timeout", "true", "1234", "amqps://user:pass@broker:5672/vhost", true, 1234 * time.Millisecond, 0},
		{"invalid timeout fallback", "false", "bad", "amqp://user:pass@broker:5672/vhost", false, time.Duration(DefaultMessageTimeoutMS) * time.Millisecond, 1},
	} {
		t.Run(test.name, func(t *testing.T) {
			t.Setenv("RABBITMQ_SSL", test.ssl)
			t.Setenv(MessageTimeoutEnv, test.timeout)
			log := &configTestLogger{}
			consumer, producer, connector := configFromEnv(log)
			if consumer.AmqpURI != test.wantURI || producer.AmqpURI != test.wantURI {
				t.Fatal("unexpected broker URI")
			}
			if consumer.TLS.Enabled != test.wantTLS || consumer.TLS.CAPath != "/etc/codedang/certs/ca.crt" || producer.TLS != consumer.TLS {
				t.Fatalf("unexpected TLS configuration: %+v, %+v", consumer.TLS, producer.TLS)
			}
			if consumer.ConnectionName != "consumer" || consumer.QueueName != "requests" || consumer.Ctag != "tag" || producer.ConnectionName != "producer" || producer.ExchangeName != "results" || producer.RoutingKey != "result-key" {
				t.Fatal("application-specific queue configuration was not preserved")
			}
			if connector.MessageTimeout != test.wantTimeout || log.warnings != test.wantWarnings {
				t.Fatalf("timeout=%s warnings=%d, want %s and %d", connector.MessageTimeout, log.warnings, test.wantTimeout, test.wantWarnings)
			}
		})
	}
}
