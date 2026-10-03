package rabbitmq

import (
	"crypto/tls"
	"crypto/x509"
	"fmt"
	"os"

	amqp "github.com/rabbitmq/amqp091-go"
)

const rabbitMQCAPath = "/etc/codedang/certs/ca.crt"

type Client interface {
	ChannelOpen(name string) error
	ExchangeDeclare(name string, typeStr string) error
	QueueDeclare(name string) (amqp.Queue, error)
	QueueBind(queueName string, bindingKey string, exchangeName string) error
}

func newAMQPConfig(connectionName string) (amqp.Config, error) {
	config := amqp.Config{
		Properties: amqp.NewConnectionProperties(),
	}
	config.Properties.SetClientConnectionName(connectionName)

	if os.Getenv("RABBITMQ_SSL") != "true" {
		return config, nil
	}

	caPEM, err := os.ReadFile(rabbitMQCAPath)
	if err != nil {
		return amqp.Config{}, fmt.Errorf("read RabbitMQ CA certificate: %w", err)
	}

	rootCAs := x509.NewCertPool()
	if !rootCAs.AppendCertsFromPEM(caPEM) {
		return amqp.Config{}, fmt.Errorf("parse RabbitMQ CA certificate")
	}

	config.TLSClientConfig = &tls.Config{
		RootCAs:    rootCAs,
		MinVersion: tls.VersionTLS12,
	}

	return config, nil
}
