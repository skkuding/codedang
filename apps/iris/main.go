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
		otelExporterUrl := utils.MustGetenvOrElseThrow("OTEL_EXPORTER_OTLP_ENDPOINT_URL", logProvider)
		// TODO: ServiceName, ServiceVersion을 환경변수를 통해 동적으로 로드
		shutdown, err := instrumentation.Init(ctx, "IRIS", "2.2.0", otelExporterUrl)
		if err != nil {
			logProvider.Log(logger.ERROR, fmt.Sprintf("Failed to initialize instrumentation: %v", err))
		}
		defer shutdown(ctx)

		instrumentation.GetMemoryMeter(otel.Meter("memory-metrics"))
		instrumentation.GetCPUMeter(otel.Meter("cpu-metrics"), 15*time.Second)
	}
	defaultTracer := otel.Tracer("default")

	bucket := utils.MustGetenvOrElseThrow("TESTCASE_BUCKET_NAME", logProvider)
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

	generateHandler := handler.NewGenerateHandler[judger.JudgerConfig, judger.ExecArgs](
		logProvider,
		defaultTracer,
	)

	validateHandler := handler.NewValidateHandler[judger.JudgerConfig, judger.ExecArgs](
		logProvider,
		defaultTracer,
	)

	routeProvider := router.NewRouter(
		judgeHandler,
		generateHandler,
		validateHandler,
		logProvider,
		defaultTracer,
	)

	logProvider.Log(logger.INFO, "Server Started")

	// amqps://skku:1234@broker-id.mq.us-west-2.amazonaws.com:5671
	var uri string
	if utils.Getenv("RABBITMQ_SSL", "") != "" {
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
			ConnectionName: utils.MustGetenvOrElseThrow("JUDGE_SUBMISSION_CONSUMER_CONNECTION_NAME", logProvider),
			QueueName:      utils.MustGetenvOrElseThrow("JUDGE_SUBMISSION_QUEUE_NAME", logProvider),
			Ctag:           utils.MustGetenvOrElseThrow("JUDGE_SUBMISSION_TAG", logProvider),
		},
		rabbitmq.ProducerConfig{
			AmqpURI:        uri,
			ConnectionName: utils.MustGetenvOrElseThrow("JUDGE_SUBMISSION_PRODUCER_CONNECTION_NAME", logProvider),
			ExchangeName:   utils.MustGetenvOrElseThrow("JUDGE_EXCHANGE_NAME", logProvider),
			RoutingKey:     utils.MustGetenvOrElseThrow("JUDGE_RESULT_ROUTING_KEY", logProvider),
		},
	).Connect(context.Background())

	select {}
}
