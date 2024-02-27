package main

import (
	"context"
	"log"
	"os"
	"runtime"
	"time"

	"github.com/skkuding/codedang/iris/src/connector"
	"github.com/skkuding/codedang/iris/src/connector/rabbitmq"
	"github.com/skkuding/codedang/iris/src/handler"
	"github.com/skkuding/codedang/iris/src/loader/cache"
	"github.com/skkuding/codedang/iris/src/loader/s3"
	"github.com/skkuding/codedang/iris/src/router"
	"github.com/skkuding/codedang/iris/src/service/file"
	"github.com/skkuding/codedang/iris/src/service/logger"
	"github.com/skkuding/codedang/iris/src/service/sandbox"
	"github.com/skkuding/codedang/iris/src/service/testcase"
	"github.com/skkuding/codedang/iris/src/utils"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/exporters/otlp/otlpmetric/otlpmetrichttp"
	otelMetric "go.opentelemetry.io/otel/metric"
	"go.opentelemetry.io/otel/sdk/metric"
	"go.opentelemetry.io/otel/sdk/resource"
	semconv "go.opentelemetry.io/otel/semconv/v1.24.0"
)

type Env string

const (
	Production  Env = "production"
	Development Env = "development"
)

func newResource() (*resource.Resource, error) {
	return resource.Merge(resource.Default(),
		resource.NewWithAttributes(semconv.SchemaURL,
			semconv.ServiceName("my-service"),
			semconv.ServiceVersion("0.1.0"),
		))
}

func newMeterProvider(res *resource.Resource) (*metric.MeterProvider, error) {
	otlpExporter, err := otlpmetrichttp.New(context.Background(), otlpmetrichttp.WithEndpointURL("http://localhost:4318/v1/metrics"))
	if err != nil {
		return nil, err
	}

	meterProvider := metric.NewMeterProvider(
		metric.WithResource(res),
		metric.WithReader(metric.NewPeriodicReader(otlpExporter,
			// Default is 1m. Set to 3s for demonstrative purposes.
			metric.WithInterval(3*time.Second))),
	)
	return meterProvider, nil
}
func main() {
	// Create resource.
	res, err := newResource()
	if err != nil {
		panic(err)
	}

	// Create a meter provider.
	// You can pass this instance directly to your instrumented code if it
	// accepts a MeterProvider instance.
	meterProvider, err := newMeterProvider(res)
	if err != nil {
		panic(err)
	}

	// Handle shutdown properly so nothing leaks.
	defer func() {
		if err := meterProvider.Shutdown(context.Background()); err != nil {
			log.Println(err)
		}
	}()

	// Register as global meter provider so that it can be used via otel.Meter
	// and accessed using otel.GetMeterProvider.
	// Most instrumentation libraries use the global meter provider as default.
	// If the global meter provider is not set then a no-op implementation
	// is used, which fails to generate data.
	otel.SetMeterProvider(meterProvider)
	memMeter := otel.Meter("memory-metrics")
	if _, err := memMeter.Int64ObservableGauge(
		"memory.heap",
		otelMetric.WithDescription(
			"Memory usage of the allocated heap objects.",
		),
		otelMetric.WithUnit("By"),
		otelMetric.WithInt64Callback(func(_ context.Context, o otelMetric.Int64Observer) error {
			var m runtime.MemStats
			runtime.ReadMemStats(&m)
			o.Observe(int64(m.HeapAlloc))
			return nil
		}),
	); err != nil {
		panic(err)
	}
	// profile()
	env := Env(utils.Getenv("APP_ENV", "development"))
	logProvider := logger.NewLogger(logger.Console, env == Production)

	ctx := context.Background()
	cache := cache.NewCache(ctx)

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
