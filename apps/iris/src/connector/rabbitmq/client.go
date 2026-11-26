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

// Inject configuration dependencies to test TLS setup and error handling
// without relying on environment variables or system certificate files.
type amqpConfigDeps struct {
	getenv      func(string) string
	readFile    func(string) ([]byte, error)
	newCertPool func() *x509.CertPool
	appendCerts func(*x509.CertPool, []byte) bool
}

func newAMQPConfig(connectionName string) (amqp.Config, error) {
	return newAMQPConfigWithDeps(connectionName, amqpConfigDeps{
		getenv:      os.Getenv,
		readFile:    os.ReadFile,
		newCertPool: x509.NewCertPool,
		appendCerts: (*x509.CertPool).AppendCertsFromPEM,
	})
}

func newAMQPConfigWithDeps(connectionName string, deps amqpConfigDeps) (amqp.Config, error) {
	config := amqp.Config{
		Properties: amqp.NewConnectionProperties(),
	}
	config.Properties.SetClientConnectionName(connectionName)

	if deps.getenv("RABBITMQ_SSL") != "true" {
		return config, nil
	}

	caPEM, err := deps.readFile(rabbitMQCAPath)
	if err != nil {
		return amqp.Config{}, fmt.Errorf("read RabbitMQ CA certificate: %w", err)
	}

	rootCAs := deps.newCertPool()
	if !deps.appendCerts(rootCAs, caPEM) {
		return amqp.Config{}, fmt.Errorf("parse RabbitMQ CA certificate")
	}

	config.TLSClientConfig = &tls.Config{
		RootCAs:    rootCAs,
		MinVersion: tls.VersionTLS12,
	}

	return config, nil
}
