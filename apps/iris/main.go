package main

import (
	"context"
	"fmt"
	"net/http"
	"time"

	"github.com/joho/godotenv"
	instrumentation "github.com/skkuding/codedang/apps/iris/src"
	"github.com/skkuding/codedang/apps/iris/src/connector"
	"github.com/skkuding/codedang/apps/iris/src/connector/rabbitmq"
	"github.com/skkuding/codedang/apps/iris/src/handler"
	"github.com/skkuding/codedang/apps/iris/src/loader"
	"github.com/skkuding/codedang/apps/iris/src/router"
	"github.com/skkuding/codedang/apps/iris/src/service/file"
	"github.com/skkuding/codedang/apps/iris/src/service/logger"
	"github.com/skkuding/codedang/apps/iris/src/service/sandbox/judger"
	"github.com/skkuding/codedang/apps/iris/src/service/testcase"
	"github.com/skkuding/codedang/apps/iris/src/utils"
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
	godotenv.Load()

	env := Env(utils.Getenv("APP_ENV", "stage"))
	logProvider := logger.NewLogger(logger.Console, env == Production)

	ctx := context.Background()
	if env == "stage" {
		logProvider.Log(logger.INFO, "Running in stage mode")
		http.HandleFunc("/health", healthCheckHandler)
		go func() {
			if err := http.ListenAndServe("0.0.0.0:3404", nil); err != nil {
				logProvider.Log(logger.ERROR, fmt.Sprintf("Failed to start health checker: %v", err))
			}
		}()
	}

	disableInstrumentation := utils.Getenv("DISABLE_INSTRUMENTATION", "false") == "true"
	if !disableInstrumentation {
		otelExporterUrl := utils.Getenv("OTEL_EXPORTER_OTLP_ENDPOINT_URL", "")
		if otelExporterUrl != "" {
			// TODO: ServiceName, ServiceVersion을 환경변수를 통해 동적으로 로드
			shutdown, err := instrumentation.Init(ctx, "IRIS", "2.2.0", otelExporterUrl)
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

	bucket := utils.Getenv("TESTCASE_BUCKET_NAME", "")
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
	testcaseManager := testcase.NewTestcaseManager(s3reader, database)

	fileManager := file.NewFileManager("/app/sandbox/results")

	sandbox := judger.NewJudgerSandboxImpl(fileManager, logProvider)

	judgeHandler := handler.NewJudgeHandler(
		sandbox,
		testcaseManager,
		fileManager,
		logProvider,
		defaultTracer,
	)

	routeProvider := router.NewRouter(judgeHandler, logProvider, defaultTracer)

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

	go connector.Factory(
		connector.RABBIT_MQ,
		connector.Providers{Router: routeProvider, Logger: logProvider},
		rabbitmq.ConsumerConfig{
			AmqpURI:        uri,
			ConnectionName: utils.Getenv("JUDGE_SUBMISSION_CONSUMER_CONNECTION_NAME", "iris-consumer"),
			QueueName:      utils.Getenv("JUDGE_SUBMISSION_QUEUE_NAME", "client.q.judge.submission"),
			Ctag:           utils.Getenv("JUDGE_SUBMISSION_TAG", "consumer-tag"),
		},
		rabbitmq.ProducerConfig{
			AmqpURI:        uri,
			ConnectionName: utils.Getenv("JUDGE_SUBMISSION_PRODUCER_CONNECTION_NAME", "iris-producer"),
			ExchangeName:   utils.Getenv("JUDGE_EXCHANGE_NAME", "iris.e.direct.judge"),
			RoutingKey:     utils.Getenv("JUDGE_RESULT_ROUTING_KEY", "judge.result"),
		},
	).Connect(context.Background())

	select {}
}
