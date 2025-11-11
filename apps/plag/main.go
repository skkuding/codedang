package main

import (
	"context"
	"fmt"
	"net/http"
	"time"

	instrumentation "github.com/skkuding/codedang/apps/plag/src"
	"github.com/skkuding/codedang/apps/plag/src/connector"
	"github.com/skkuding/codedang/apps/plag/src/connector/rabbitmq"
	"github.com/skkuding/codedang/apps/plag/src/handler"
	"github.com/skkuding/codedang/apps/plag/src/loader"
	"github.com/skkuding/codedang/apps/plag/src/router"
	"github.com/skkuding/codedang/apps/plag/src/service/check"
	"github.com/skkuding/codedang/apps/plag/src/service/file"
	"github.com/skkuding/codedang/apps/plag/src/service/logger"
	"github.com/skkuding/codedang/apps/plag/src/utils"
	"go.opentelemetry.io/otel"
)

type Env string

const (
	Production Env = "production"
	Stage      Env = "stage"
)

func healthCheckHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}
	w.WriteHeader(http.StatusOK)
}

func main() {
	env := Env(utils.Getenv("APP_ENV", "stage"))
	logProvider := logger.NewLogger(logger.Console, env == Production)

	ctx := context.Background()
	if env == "stage" {
		logProvider.Log(logger.INFO, "Running in stage mode")
		http.HandleFunc("/health", healthCheckHandler)
		go func() {
			if err := http.ListenAndServe("0.0.0.0:3403", nil); err != nil { // 3405 포트 사용
				logProvider.Log(logger.ERROR, fmt.Sprintf("Failed to start health checker: %v", err))
			}
		}()
	}

	disableInstrumentation := utils.Getenv("DISABLE_INSTRUMENTATION", "false") == "true"
	if !disableInstrumentation {
		otelExporterUrl := utils.Getenv("OTEL_EXPORTER_OTLP_ENDPOINT_URL", "")
		if otelExporterUrl != "" {
			// TODO: ServiceName, ServiceVersion을 환경변수를 통해 동적으로 로드
			shutdown, err := instrumentation.Init(ctx, "PLAG", "1.0.0", otelExporterUrl)
			if err != nil {
				logProvider.Log(logger.ERROR, fmt.Sprintf("Failed to initialize instrumentation: %v", err))
			}
			defer shutdown(ctx)

			instrumentation.GetMemoryMeter(otel.Meter("memory-metrics"))
			instrumentation.GetCPUMeter(otel.Meter("cpu-metrics"), 15*time.Second)
		} else {
			logProvider.Log(logger.INFO, "Cannot find OTEL_EXPORTER_OTLP_ENDPOINT_URL")
		}
	}
	defaultTracer := otel.Tracer("default")

	bucket := utils.Getenv("CHECK_RESULT_BUCKET_NAME", "")
	s3reader, err := loader.NewS3DataSource(bucket)
	if err != nil {
		logProvider.Log(logger.ERROR, fmt.Sprintf("Failed to create S3 data source: %v", err))
		return
	}
	database, err := loader.NewPostgresDataSource(ctx)
	if err != nil {
		logProvider.Log(logger.ERROR, fmt.Sprintf("Failed to create Postgres data source: %v", err))
		return
	}
	checkManager := check.NewCheckManager(s3reader, database, "/app/sandbox/jplag.jar")

	fileManager := file.NewFileManager("/app/sandbox/checks")

	checkHandler := handler.NewCheckHandler(
		checkManager,
		fileManager,
		logProvider,
		defaultTracer,
	)

	routeProvider := router.NewRouter(checkHandler, logProvider, defaultTracer)

	logProvider.Log(logger.INFO, "Server Started")

	// amqps://skku:1234@broker-id.mq.us-west-2.amazonaws.com:5671
	var uri string
	if utils.MustGetenvOrElseThrow("RABBITMQ_SSL", logProvider) != "" {
		uri = "amqps://"
	} else {
		uri = "amqp://"
	}
	uri +=
		utils.MustGetenvOrElseThrow("RABBITMQ_DEFAULT_USER", logProvider) + ":" +
			utils.MustGetenvOrElseThrow("RABBITMQ_DEFAULT_PASS", logProvider) + "@" +
			utils.MustGetenvOrElseThrow("RABBITMQ_HOST", logProvider) + ":" +
			utils.MustGetenvOrElseThrow("RABBITMQ_PORT", logProvider) + "/" +
			utils.MustGetenvOrElseThrow("RABBITMQ_DEFAULT_VHOST", logProvider)

	go connector.Factory(
		connector.RABBIT_MQ,
		connector.Providers{Router: routeProvider, Logger: logProvider},
		rabbitmq.ConsumerConfig{
			AmqpURI:        uri,
			ConnectionName: utils.MustGetenvOrElseThrow("CHECK_CONSUMER_CONNECTION_NAME", logProvider),
			QueueName:      utils.MustGetenvOrElseThrow("CHECK_QUEUE_NAME", logProvider), // 큐 네임 설정
			Ctag:           utils.MustGetenvOrElseThrow("CHECK_TAG", logProvider),
		},
		rabbitmq.ProducerConfig{
			AmqpURI:        uri,
			ConnectionName: utils.MustGetenvOrElseThrow("CHECK_PRODUCER_CONNECTION_NAME", logProvider),
			ExchangeName:   utils.MustGetenvOrElseThrow("CHECK_EXCHANGE_NAME", logProvider),
			RoutingKey:     utils.MustGetenvOrElseThrow("CHECK_RESULT_ROUTING_KEY", logProvider),
		},
	).Connect(context.Background())

	select {}
}
