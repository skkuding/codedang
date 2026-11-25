package rabbitmq

import (
	"fmt"

	amqp "github.com/rabbitmq/amqp091-go"
	"github.com/skkuding/codedang/apps/iris/src/service/logger"
)

type Consumer interface {
	OpenChannel() error
	Subscribe() (<-chan amqp.Delivery, error)
	CleanUp() error
	// Ack(channelName string, tag uint64) error
}

type consumer struct {
	connection *amqp.Connection
	channel    *amqp.Channel
	queueName  string
	tag        string
	Done       chan error
	logger     logger.Logger
}

type ConsumerConfig struct {
	AmqpURI        string
	ConnectionName string
	QueueName      string
	Ctag           string
}

func NewConsumer(config ConsumerConfig, logger logger.Logger) (*consumer, error) {
	return newConsumer(config, logger, newAMQPConfig, amqp.DialConfig)
}

// Inject configuration and dial functions to test consumer initialization
// without connecting to a RabbitMQ broker.
func newConsumer(
	config ConsumerConfig,
	logger logger.Logger,
	buildConfig func(string) (amqp.Config, error),
	dial func(string, amqp.Config) (*amqp.Connection, error),
) (*consumer, error) {

	// Create New RabbitMQ Connection (go <-> RabbitMQ)
	amqpConfig, err := buildConfig(config.ConnectionName)
	if err != nil {
		return nil, fmt.Errorf("consumer: TLS config failed: %w", err)
	}
	connection, err := dial(config.AmqpURI, amqpConfig)
	if err != nil {
		return nil, fmt.Errorf("consumer: dial failed: %w", err)
	}

	return &consumer{
		connection: connection,
		channel:    nil,
		queueName:  config.QueueName,
		tag:        config.Ctag,
		Done:       make(chan error),
		logger:     logger,
	}, nil
}

func (c *consumer) OpenChannel() error {
	return c.openChannel((*amqp.Connection).Channel, (*amqp.Channel).Qos)
}

// Inject AMQP operations to test channel initialization and QoS setup
// without a live broker.
func (c *consumer) openChannel(
	open func(*amqp.Connection) (*amqp.Channel, error),
	qos func(*amqp.Channel, int, int, bool) error,
) error {
	var err error

	if c.channel, err = open(c.connection); err != nil {
		return fmt.Errorf("channel: %s", err)
	}
	// Set prefetchCount for consume channel
	if err = qos(
		c.channel,
		1,     // prefetchCount
		0,     // prefetchSize
		false, // global
	); err != nil {
		return fmt.Errorf("qos set: %s", err)
	}
	return nil
}

func (c *consumer) Subscribe() (<-chan amqp.Delivery, error) {
	return c.subscribe((*amqp.Channel).Consume)
}

// Inject the consume operation to test subscription arguments and errors.
func (c *consumer) subscribe(
	consume func(*amqp.Channel, string, string, bool, bool, bool, bool, amqp.Table) (<-chan amqp.Delivery, error),
) (<-chan amqp.Delivery, error) {

	// Subscribe queue for consume messages
	// Return `<- chan Delivery`
	messages, err := consume(
		c.channel,
		c.queueName, // queue name
		c.tag,       // consumer
		false,       // autoAck
		false,       // exclusive
		false,       // noLocal
		false,       // noWait
		nil,         // arguments
	)
	if err != nil {
		return nil, fmt.Errorf("queue consume: %s", err)
	}
	return messages, nil
}

func (c *consumer) CleanUp() error {
	return c.cleanUp((*amqp.Channel).Cancel, (*amqp.Connection).Close)
}

// Inject AMQP operations to test resource cleanup and error handling.
func (c *consumer) cleanUp(
	cancel func(*amqp.Channel, string, bool) error,
	closeConnection func(*amqp.Connection) error,
) error {

	c.logger.Log(logger.DEBUG, "consumer clean up")
	// Close channel
	if err := cancel(c.channel, c.tag, true); err != nil {
		return fmt.Errorf("Consumer cancel failed: %w", err)
	}

	// Close Connection
	if err := closeConnection(c.connection); err != nil {
		return fmt.Errorf("AMQP connection close error: %s", err)
	}
	defer c.logger.Log(logger.INFO, "RabbitMQ connection clear done")

	// wait for handle() to exit
	return <-c.Done
}

// func (c *consumer) Ack(channelName string, tag uint64) error {
// 	channel, exist := c.channels[channelName]
// 	if !exist {
// 		return fmt.Errorf("consumer: Ack: channel does not exist")
// 	}
// 	err := channel.Ack(tag, false)
// 	return err
// }
