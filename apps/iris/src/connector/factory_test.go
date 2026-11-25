package connector

import (
	"context"
	"errors"
	"runtime"
	"slices"
	"strings"
	"testing"

	"github.com/skkuding/codedang/apps/iris/src/connector/rabbitmq"
	"github.com/skkuding/codedang/apps/iris/src/router"
	"github.com/skkuding/codedang/apps/iris/src/service/logger"
)

// Embedded interfaces deliberately have no implementation: Factory must not
// call their methods. The objects are only used as distinct dependencies.
type factoryConsumerFake struct{ rabbitmq.Consumer }
type factoryProducerFake struct{ rabbitmq.Producer }
type factoryRouterFake struct{ router.Router }

type factoryPanic struct{ message string }

type factoryLoggerSpy struct {
	t      *testing.T
	events *[]string
}

func (l *factoryLoggerSpy) Log(level logger.Level, msg string) {
	l.t.Fatalf("unexpected Log(%v, %q)", level, msg)
}
func (l *factoryLoggerSpy) LogWithContext(level logger.Level, msg string, _ context.Context) {
	l.t.Fatalf("unexpected LogWithContext(%v, %q)", level, msg)
}
func (l *factoryLoggerSpy) Panic(msg string) {
	*l.events = append(*l.events, "panic")
	panic(factoryPanic{msg})
}

func TestFactoryRabbitMQ(t *testing.T) {
	consumerConfig := rabbitmq.ConsumerConfig{
		AmqpURI: "amqp://consumer.invalid/vhost", ConnectionName: "consumer",
		QueueName: "requests", Ctag: "consumer-tag",
	}
	producerConfig := rabbitmq.ProducerConfig{
		AmqpURI: "amqp://producer.invalid/vhost", ConnectionName: "producer",
		ExchangeName: "results", RoutingKey: "result-key",
	}
	createErr := errors.New("constructor failed")

	tests := []struct {
		name        string
		module      Module
		args        []any
		consumerErr error
		producerErr error
		wantEvents  []string
		panicPrefix string
	}{
		{
			name: "success", module: RABBIT_MQ, args: []any{consumerConfig, producerConfig},
			wantEvents: []string{"consumer", "producer", "connector"},
		},
		{
			name: "invalid_module", module: Module("invalid"), args: []any{consumerConfig, producerConfig},
			wantEvents: []string{"panic"}, panicPrefix: "Invalid connector type:",
		},
		{
			name: "invalid_consumer_config", module: RABBIT_MQ, args: []any{producerConfig, producerConfig},
			wantEvents: []string{"panic"}, panicPrefix: "Invalid consumer config:",
		},
		{
			name: "consumer_creation_failure", module: RABBIT_MQ, args: []any{consumerConfig, producerConfig},
			consumerErr: createErr, wantEvents: []string{"consumer", "panic"},
			panicPrefix: "Failed to create consumer:",
		},
		{
			name: "invalid_producer_config", module: RABBIT_MQ, args: []any{consumerConfig, consumerConfig},
			wantEvents: []string{"consumer", "panic"}, panicPrefix: "Invalid producer config:",
		},
		{
			name: "producer_creation_failure", module: RABBIT_MQ, args: []any{consumerConfig, producerConfig},
			producerErr: createErr, wantEvents: []string{"consumer", "producer", "panic"},
			panicPrefix: "Failed to create producer:",
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			var events []string
			consumer := &factoryConsumerFake{}
			producer := &factoryProducerFake{}
			route := &factoryRouterFake{}
			log := &factoryLoggerSpy{t: t, events: &events}
			providers := Providers{Router: route, Logger: log}
			var assembled Connector

			constructors := factoryConstructors{
				newConsumer: func(cfg rabbitmq.ConsumerConfig, gotLogger logger.Logger) (rabbitmq.Consumer, error) {
					events = append(events, "consumer")
					if cfg != consumerConfig || gotLogger != log {
						t.Fatalf("NewConsumer called with wrong config or logger: %+v", cfg)
					}
					if tt.consumerErr != nil {
						return nil, tt.consumerErr
					}
					return consumer, nil
				},
				newProducer: func(cfg rabbitmq.ProducerConfig, gotLogger logger.Logger) (rabbitmq.Producer, error) {
					events = append(events, "producer")
					if cfg != producerConfig || gotLogger != log {
						t.Fatalf("NewProducer called with wrong config or logger: %+v", cfg)
					}
					if tt.producerErr != nil {
						return nil, tt.producerErr
					}
					return producer, nil
				},
				newConnector: func(c rabbitmq.Consumer, p rabbitmq.Producer, r router.Router, l logger.Logger) Connector {
					events = append(events, "connector")
					if c != consumer || p != producer || r != route || l != log {
						t.Fatal("NewConnector called with wrong dependencies")
					}
					// Spy delegates to the real network-free constructor.
					assembled = rabbitmq.NewConnector(c, p, r, l)
					return assembled
				},
			}

			var got Connector
			var recovered any
			func() {
				defer func() { recovered = recover() }()
				got = factory(tt.module, providers, constructors, tt.args...)
			}()
			if !slices.Equal(events, tt.wantEvents) {
				t.Fatalf("calls = %v, want %v", events, tt.wantEvents)
			}
			if tt.panicPrefix != "" {
				p, ok := recovered.(factoryPanic)
				if !ok || !strings.HasPrefix(p.message, tt.panicPrefix) {
					t.Fatalf("panic = %#v, want Logger.Panic with prefix %q", recovered, tt.panicPrefix)
				}
				if got != nil || assembled != nil {
					t.Fatal("failed Factory must not return or assemble a connector")
				}
				return
			}
			if recovered != nil {
				t.Fatalf("unexpected panic: %v", recovered)
			}
			if assembled == nil || got != assembled {
				t.Fatal("Factory must return the connector built from the supplied dependencies")
			}
		})
	}
}

func TestFactoryUnimplementedModules(t *testing.T) {
	tests := []struct {
		module Module
		want   string
	}{
		{HTTP, "HTTP connector need to be implemented"},
		{FILE, "File connector need to be implemented"},
		{CONSOLE, "Console connector need to be implemented"},
	}
	for _, tt := range tests {
		t.Run(string(tt.module), func(t *testing.T) {
			var events []string
			log := &factoryLoggerSpy{t: t, events: &events}
			constructors := factoryConstructors{
				newConsumer: func(rabbitmq.ConsumerConfig, logger.Logger) (rabbitmq.Consumer, error) {
					t.Fatal("unsupported module must not create a consumer")
					return nil, nil
				},
				newProducer: func(rabbitmq.ProducerConfig, logger.Logger) (rabbitmq.Producer, error) {
					t.Fatal("unsupported module must not create a producer")
					return nil, nil
				},
				newConnector: func(rabbitmq.Consumer, rabbitmq.Producer, router.Router, logger.Logger) Connector {
					t.Fatal("unsupported module must not create a connector")
					return nil
				},
			}

			var got Connector
			var recovered any
			func() {
				defer func() { recovered = recover() }()
				got = factory(tt.module, Providers{Logger: log}, constructors)
			}()
			p, ok := recovered.(factoryPanic)
			if !ok || p.message != tt.want {
				t.Fatalf("panic = %#v, want Logger.Panic(%q)", recovered, tt.want)
			}
			if got != nil || !slices.Equal(events, []string{"panic"}) {
				t.Fatalf("connector = %v, calls = %v; want nil and one logger panic", got, events)
			}
		})
	}
}

// Missing arguments currently cause an index panic. Check that invalid input
// cannot yield a connector, without requiring that runtime panic or partial
// consumer initialization remain the error-handling contract.
func TestFactoryMissingArguments(t *testing.T) {
	config := rabbitmq.ConsumerConfig{
		AmqpURI: "amqp://consumer.invalid/vhost", ConnectionName: "consumer",
		QueueName: "requests", Ctag: "consumer-tag",
	}
	tests := []struct {
		name string
		args []any
	}{
		{name: "no_arguments"},
		{name: "missing_producer_config", args: []any{config}},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			var events []string
			log := &factoryLoggerSpy{t: t, events: &events}
			constructors := factoryConstructors{
				newConsumer: func(cfg rabbitmq.ConsumerConfig, gotLogger logger.Logger) (rabbitmq.Consumer, error) {
					events = append(events, "consumer")
					if len(tt.args) == 0 || cfg != config || gotLogger != log {
						t.Fatal("unexpected consumer creation")
					}
					return &factoryConsumerFake{}, nil
				},
				newProducer: func(rabbitmq.ProducerConfig, logger.Logger) (rabbitmq.Producer, error) {
					t.Fatal("missing config must not create a producer")
					return nil, nil
				},
				newConnector: func(rabbitmq.Consumer, rabbitmq.Producer, router.Router, logger.Logger) Connector {
					t.Fatal("missing config must not create a connector")
					return nil
				},
			}

			var got Connector
			var recovered any
			func() {
				defer func() { recovered = recover() }()
				got = factory(RABBIT_MQ, Providers{Logger: log}, constructors, tt.args...)
			}()
			if got != nil {
				t.Fatal("missing config must not return a connector")
			}
			switch p := recovered.(type) {
			case runtime.Error:
				t.Logf("observed runtime error (not a required error-handling policy): %v; calls: %v", p, events)
			case factoryPanic:
				t.Logf("observed logger panic: %s; calls: %v", p.message, events)
			case nil:
				t.Logf("rejected without panic; calls: %v", events)
			default:
				t.Fatalf("unexpected panic: %#v", recovered)
			}
		})
	}
}
