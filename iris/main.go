package main

import (
	"context"
	"log"
	"os"

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
	"go.opentelemetry.io/otel/exporters/otlp/otlptrace"
	"go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracehttp"
	"go.opentelemetry.io/otel/sdk/resource"
	sdktrace "go.opentelemetry.io/otel/sdk/trace"
	semconv "go.opentelemetry.io/otel/semconv/v1.21.0"
	"go.opentelemetry.io/otel/trace"
)

var tracer trace.Tracer

func newExporter(ctx context.Context) (*otlptrace.Exporter, error) {
	return otlptracehttp.New(ctx, otlptracehttp.WithEndpoint("localhost:44318"), otlptracehttp.WithInsecure())
}

func newTraceProvider(exp sdktrace.SpanExporter) *sdktrace.TracerProvider {
	// Ensure default SDK resources and the required service name are set.
	r, err := resource.Merge(
		resource.Default(),
		resource.NewWithAttributes(
			"https://opentelemetry.io/schemas/1.24.0",
			semconv.ServiceName("ExampleService"),
		),
	)

	if err != nil {
		panic(err)
	}

	return sdktrace.NewTracerProvider(
		sdktrace.WithBatcher(exp),
		sdktrace.WithResource(r),
	)
}

type Env string

const (
	Production  Env = "production"
	Development Env = "development"
)

func tracing(ctx context.Context) {
	ctx, exampleSpan := tracer.Start(ctx, "tracing-example")
	defer exampleSpan.End()
}

func main() {
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

		// ** Tracing 시작 **
	ctx2 := context.Background()
	exp, err := newExporter(ctx2)
	if err != nil {
		log.Fatalf("failed to initialize exporter: %v", err)
	}
	tp := newTraceProvider(exp)
	// Handle shutdown properly so nothing leaks.
	defer func() { _ = tp.Shutdown(ctx2) }()
	otel.SetTracerProvider(tp)
	// Finally, set the tracer that can be used for this package.
	tracer = tp.Tracer("ExampleService")
	// ** Tracing 끝 **
	tracing(ctx2)

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
	).Connect(ctx2)

	select {}
}
