package main

import (
	"context"
	"os"
	"time"

	"github.com/skkuding/codedang/apps/iris/src/connector"
	"github.com/skkuding/codedang/apps/iris/src/connector/rabbitmq"
	"github.com/skkuding/codedang/apps/iris/src/handler"
	"github.com/skkuding/codedang/apps/iris/src/loader/cache"
	"github.com/skkuding/codedang/apps/iris/src/loader/s3"
	"github.com/skkuding/codedang/apps/iris/src/observability"
	"github.com/skkuding/codedang/apps/iris/src/router"
	"github.com/skkuding/codedang/apps/iris/src/service/file"
	"github.com/skkuding/codedang/apps/iris/src/service/logger"
	"github.com/skkuding/codedang/apps/iris/src/service/sandbox"
	"github.com/skkuding/codedang/apps/iris/src/service/testcase"
	"github.com/skkuding/codedang/apps/iris/src/utils"
	"go.opentelemetry.io/otel"
)

type Env string

const (
	Production  Env = "production"
	Development Env = "development"
)

func main() {
	// profile()
	env := Env(utils.Getenv("APP_ENV", "development"))
	logProvider := logger.NewLogger(logger.Console, env == Production)

	ctx := context.Background()
	cache := cache.NewCache(ctx)
	if env == "production" {
		if utils.Getenv("OTEL_EXPORTER_OTLP_ENDPOINT_URL", "") != "" {
			shutdown := observability.InitTracer(ctx)
			defer shutdown()
			observability.SetGlobalMeterProvider()
			// Aynchronous Instruments로써, go routine 불필요
			observability.GetMemoryMeter(otel.Meter("memory-metrics"))
			observability.GetCPUMeter(otel.Meter("cpu-metrics"), 15*time.Second)
		} else {
			logProvider.Log(logger.INFO, "Cannot find OTEL_EXPORTER_OTLP_ENDPOINT_URL")
		}
	} else {
		logProvider.Log(logger.INFO, "Running in development mode")
	}

	bucketName := os.Getenv("TESTCASE_BUCKET_NAME")
	if bucketName == "" {
		logProvider.Log(logger.ERROR, "Cannot find TESTCASE_BUCKET_NAME")
		return
	}
	source := s3.NewS3DataSource(bucketName)
	testcaseManager := testcase.NewTestcaseManager(source, cache)

	fileManager := file.NewFileManager("/app/sandbox/results")
	langConfig := sandbox.NewLangConfig(fileManager, "/app/sandbox/policy/java_policy")

	sb := sandbox.NewSandbox("/app/sandbox/libjudger.so", logProvider)
	compiler := sandbox.NewCompiler(sb, langConfig, fileManager, logProvider)
	runner := sandbox.NewRunner(sb, langConfig, fileManager, logProvider)

	judgeHandler := handler.NewJudgeHandler(
		compiler,
		runner,
		testcaseManager,
		langConfig,
		fileManager,
		logProvider,
	)

	routeProvider := router.NewRouter(judgeHandler, logProvider)

	logProvider.Log(logger.INFO, "Server Started")

	// amqps://skku:1234@broker-id.mq.us-west-2.amazonaws.com:5671
	var uri string
	if utils.Getenv("RABBITMQ_SSL", "") != "" {
		uri = "amqps://"
	} else {
		uri = "amqp://"
	}
	uri +=
		utils.Getenv("RABBITMQ_DEFAULT_USER", "skku") + ":" +
			utils.Getenv("RABBITMQ_DEFAULT_PASS", "1234") + "@" +
			utils.Getenv("RABBITMQ_HOST", "localhost") + ":" +
			utils.Getenv("RABBITMQ_PORT", "5672") + "/" +
			utils.Getenv("RABBITMQ_DEFAULT_VHOST", "")

	connector.Factory(
		connector.RABBIT_MQ,
		connector.Providers{Router: routeProvider, Logger: logProvider},
		rabbitmq.ConsumerConfig{
			AmqpURI:        uri,
			ConnectionName: utils.Getenv("RABBITMQ_CONSUMER_CONNECTION_NAME", "iris-consumer"),
			QueueName:      utils.Getenv("RABBITMQ_CONSUMER_QUEUE_NAME", "client.q.judge.submission"),
			Ctag:           utils.Getenv("RABBITMQ_CONSUMER_TAG", "consumer-tag"),
		},
		rabbitmq.ProducerConfig{
			AmqpURI:        uri,
			ConnectionName: utils.Getenv("RABBITMQ_PRODUCER_CONNECTION_NAME", "iris-producer"),
			ExchangeName:   utils.Getenv("RABBITMQ_PRODUCER_EXCHANGE_NAME", "iris.e.direct.judge"),
			RoutingKey:     utils.Getenv("RABBITMQ_PRODUCER_ROUTING_KEY", "judge.result"),
		},
	).Connect(context.Background())

	select {}
}
