package mq

import (
	"context"
	"testing"
	"time"

	"github.com/skkuding/codedang/apps/plag/src/service/logger"
)

func TestMessageTimeoutFromEnv(t *testing.T) {
	for _, test := range []struct {
		name      string
		value     string
		want      time.Duration
		wantError bool
	}{
		{"default", "", DefaultMessageTimeout, false},
		{"configured", "1234", 1234 * time.Millisecond, false},
		{"zero", "0", 0, true},
		{"negative", "-1", 0, true},
		{"invalid", "abc", 0, true},
		{"overflow", "9223372036854775807", 0, true},
	} {
		t.Run(test.name, func(t *testing.T) {
			t.Setenv(MessageTimeoutEnv, test.value)
			got, err := MessageTimeoutFromEnv()
			if (err != nil) != test.wantError || got != test.want {
				t.Fatalf("got (%s, %v), want (%s, error=%v)", got, err, test.want, test.wantError)
			}
		})
	}
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
		"RABBITMQ_DEFAULT_USER":          "user",
		"RABBITMQ_DEFAULT_PASS":          "pass",
		"RABBITMQ_HOST":                  "broker",
		"RABBITMQ_PORT":                  "5672",
		"RABBITMQ_DEFAULT_VHOST":         "vhost",
		"CHECK_CONSUMER_CONNECTION_NAME": "consumer",
		"CHECK_QUEUE_NAME":               "requests",
		"CHECK_TAG":                      "tag",
		"CHECK_PRODUCER_CONNECTION_NAME": "producer",
		"CHECK_EXCHANGE_NAME":            "results",
		"CHECK_RESULT_ROUTING_KEY":       "result-key",
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
		{"default", "false", "", "amqp://user:pass@broker:5672/vhost", false, DefaultMessageTimeout, 0},
		{"TLS and configured timeout", "true", "1234", "amqps://user:pass@broker:5672/vhost", true, 1234 * time.Millisecond, 0},
		{"invalid timeout fallback", "false", "bad", "amqp://user:pass@broker:5672/vhost", false, DefaultMessageTimeout, 1},
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
