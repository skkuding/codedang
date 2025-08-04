package rabbitmq

import (
	amqp "github.com/rabbitmq/amqp091-go"
)

type Client interface {
	ChannelOpen(name string) error
	ExchangeDeclare(name string, typeStr string) error
	QueueDeclare(name string) (amqp.Queue, error)
	QueueBind(queueName string, bindingKey string, exchangeName string) error
}
