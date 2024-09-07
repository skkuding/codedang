package rabbitmq

import (
	"context"
	"fmt"

	amqp "github.com/rabbitmq/amqp091-go"
	"github.com/skkuding/codedang/apps/iris/src/service/logger"
)

type Producer interface {
	OpenChannel() error
	Publish([]byte, context.Context, string) error
	CleanUp() error
}

type producer struct {
	connection   *amqp.Connection
	channel      *amqp.Channel
	exchangeName string
	routingKey   string
	Done         chan error
	publishes    chan uint64
	logger       logger.Logger
}

type ProducerConfig struct {
	AmqpURI        string
	ConnectionName string
	ExchangeName   string
	RoutingKey     string
}

func NewProducer(config ProducerConfig, logger logger.Logger) (*producer, error) {

	// Create New RabbitMQ Connection (go <-> RabbitMQ)
	amqpConfig := amqp.Config{Properties: amqp.NewConnectionProperties()}
	amqpConfig.Properties.SetClientConnectionName(config.ConnectionName)
	connection, err := amqp.DialConfig(config.AmqpURI, amqpConfig)
	if err != nil {
		return nil, fmt.Errorf("consumer: dial failed: %w", err)
	}

	return &producer{
		connection:   connection,
		channel:      nil,
		exchangeName: config.ExchangeName,
		routingKey:   config.RoutingKey,
		Done:         make(chan error),
		publishes:    make(chan uint64, 8),
		logger:       logger,
	}, nil
}

func (p *producer) OpenChannel() error {
	var err error

	if p.channel, err = p.connection.Channel(); err != nil {
		return fmt.Errorf("channel: %s", err)
	}

	// put this channel into confirm mode
	// client can ensure all messages successfully received by server
	if err := p.channel.Confirm(false); err != nil {
		return fmt.Errorf("channel could not be put into confirm mode: %s", err)
	}
	// add listner for confirmation
	confirms := p.channel.NotifyPublish(make(chan amqp.Confirmation, 10))

	go p.confirmHandler(confirms)

	return nil
}

func (p *producer) confirmHandler(confirms chan amqp.Confirmation) {
	m := make(map[uint64]bool)
	for {
		select {
		case <-p.Done:
			p.logger.Log(logger.INFO, "confirmHandler is stopping")
			return
		case publishSeqNo := <-p.publishes:
			// log.Printf("waiting for confirmation of %d", publishSeqNo)
			m[publishSeqNo] = false
		case confirmed := <-confirms:
			p.logger.Log(logger.DEBUG, fmt.Sprintf("tag : %d", confirmed.DeliveryTag))
			if confirmed.DeliveryTag > 0 {
				if confirmed.Ack {
					p.logger.Log(logger.DEBUG, fmt.Sprintf("confirmed delivery with delivery tag: %d", confirmed.DeliveryTag))
				} else {
					p.logger.Log(logger.ERROR, fmt.Sprintf("failed delivery of delivery tag: %d", confirmed.DeliveryTag))
				}
				delete(m, confirmed.DeliveryTag)
			} else {
				p.logger.Log(logger.ERROR, fmt.Sprintf("delivery tag must be a positive integer value: received: %d", confirmed.DeliveryTag))
				panic("Invalid Delivery Tag: There might be an issue with the connection to the RabbitMQ broker")
			}
		}
	}
}

func (p *producer) Publish(result []byte, ctx context.Context, messageType string) error {

	seqNo := p.channel.GetNextPublishSeqNo()
	p.logger.Log(logger.INFO, fmt.Sprintf("publishing %dB body", len(result)))
	p.logger.Log(logger.INFO, string(result))

	// https://www.rabbitmq.com/publishers.html
	if err := p.channel.PublishWithContext(ctx,
		p.exchangeName, // publish to an exchange
		p.routingKey,   // routing to 0 or more queues
		false,          // mandatory
		false,          // immediate
		amqp.Publishing{
			Headers:         amqp.Table{},
			ContentType:     "application/json",
			ContentEncoding: "",
			Body:            result,
			DeliveryMode:    amqp.Persistent, // 1=non-persistent, 2=persistent
			Priority:        0,
			Type:            messageType, // 0-9
		},
	); err != nil {
		return fmt.Errorf("exchange publish: %s", err)
	}

	p.logger.Log(logger.DEBUG, fmt.Sprintf("published %dB OK", len(result)))
	p.publishes <- seqNo

	return nil
}

func (p *producer) CleanUp() error {
	if err := p.channel.Close(); err != nil {
		return fmt.Errorf("channel close failed: %s", err)
	}

	if err := p.connection.Close(); err != nil {
		return fmt.Errorf("connection close error: %s", err)
	}

	return <-p.Done
}
