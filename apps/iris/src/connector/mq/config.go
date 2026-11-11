package mq

import (
	"fmt"
	"os"
	"strconv"
	"time"

	"github.com/skkuding/codedang/apps/iris/src/service/logger"
	"github.com/skkuding/codedang/apps/iris/src/utils"
	"github.com/skkuding/codedang/packages/go/common/mq/rabbitmq"
)

const (
	MessageTimeoutEnv       = "IRIS_MESSAGE_TIMEOUT_MS"
	DefaultMessageTimeoutMS = 10 * 60 * 1000
)

func MessageTimeoutFromEnv() (time.Duration, error) {
	raw := os.Getenv(MessageTimeoutEnv)
	if raw == "" {
		return time.Duration(DefaultMessageTimeoutMS) * time.Millisecond, nil
	}
	milliseconds, err := strconv.ParseInt(raw, 10, 64)
	if err != nil || milliseconds <= 0 || milliseconds > (1<<63-1)/int64(time.Millisecond) {
		return 0, fmt.Errorf("must be a positive integer")
	}
	return time.Duration(milliseconds) * time.Millisecond, nil
}

func configFromEnv(logProvider logger.Logger) (rabbitmq.ConsumerConfig, rabbitmq.ProducerConfig, rabbitmq.ConnectorConfig) {
	messageTimeout, err := MessageTimeoutFromEnv()
	if err != nil {
		logProvider.Log(logger.WARN, fmt.Sprintf("invalid %s: %v; using default", MessageTimeoutEnv, err))
		messageTimeout = time.Duration(DefaultMessageTimeoutMS) * time.Millisecond
	}

	tlsConfig := rabbitmq.TLSConfig{
		Enabled: utils.Getenv("RABBITMQ_SSL", "") == "true",
		CAPath:  "/etc/codedang/certs/ca.crt",
	}
	uri := "amqp://"
	if tlsConfig.Enabled {
		uri = "amqps://"
	}
	uri += utils.MustGetenvOrElseThrow("RABBITMQ_DEFAULT_USER", logProvider) + ":" +
		utils.MustGetenvOrElseThrow("RABBITMQ_DEFAULT_PASS", logProvider) + "@" +
		utils.MustGetenvOrElseThrow("RABBITMQ_HOST", logProvider) + ":" +
		utils.MustGetenvOrElseThrow("RABBITMQ_PORT", logProvider) + "/" +
		utils.MustGetenvOrElseThrow("RABBITMQ_DEFAULT_VHOST", logProvider)

	return rabbitmq.ConsumerConfig{
			TLS:            tlsConfig,
			AmqpURI:        uri,
			ConnectionName: utils.MustGetenvOrElseThrow("JUDGE_REQUEST_CONSUMER_CONNECTION_NAME", logProvider),
			QueueName:      utils.MustGetenvOrElseThrow("JUDGE_REQUEST_QUEUE_NAME", logProvider),
			Ctag:           utils.MustGetenvOrElseThrow("JUDGE_REQUEST_CONSUMER_TAG", logProvider),
		}, rabbitmq.ProducerConfig{
			TLS:            tlsConfig,
			AmqpURI:        uri,
			ConnectionName: utils.MustGetenvOrElseThrow("JUDGE_RESULT_PRODUCER_CONNECTION_NAME", logProvider),
			ExchangeName:   utils.MustGetenvOrElseThrow("JUDGE_RESULT_EXCHANGE_NAME", logProvider),
			RoutingKey:     utils.MustGetenvOrElseThrow("JUDGE_RESULT_ROUTING_KEY", logProvider),
		}, rabbitmq.ConnectorConfig{MessageTimeout: messageTimeout}
}
