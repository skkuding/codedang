package main

/*
* iris_check 서버는 표절 검사를 위한 서버입니다.
* 기존 채점용 iris 서버를 기반으로 제작되었습니다.
* 현재는 기존 iris 서버에서 judge 기능만을 제거한 채 RabbitMQ 메시지를 받기만 하는 것을 목표로 하고 있습니다.
* <Judge 기능 완전히 제거 -> 아무 기능이 없는 Iris 서버 -> Check 기능 이식> 의 과정을 순차적으로 밟아 나갈 것입니다.
*/

import (
	"context"
	"fmt"
	"net/http"
	"time"

	instrumentation "github.com/skkuding/codedang/apps/iris_check/src"
	"github.com/skkuding/codedang/apps/iris_check/src/connector"
	"github.com/skkuding/codedang/apps/iris_check/src/connector/rabbitmq"
	"github.com/skkuding/codedang/apps/iris_check/src/handler"
	"github.com/skkuding/codedang/apps/iris_check/src/router"
	"github.com/skkuding/codedang/apps/iris_check/src/service/file"
	"github.com/skkuding/codedang/apps/iris_check/src/service/logger"
	"github.com/skkuding/codedang/apps/iris_check/src/utils"
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

	/*bucket := utils.Getenv("TESTCASE_BUCKET_NAME", "")
	s3reader, err := loader.NewS3DataSource(bucket)
	if err != nil {
		logProvider.Log(logger.ERROR, fmt.Sprintf("Failed to create S3 data source: %v", err))
		return
	}*/
	/*database, err := loader.NewPostgresDataSource(ctx)
	if err != nil {
		logProvider.Log(logger.ERROR, fmt.Sprintf("Failed to create Postgres data source: %v", err))
		return
	}
	testcaseManager := testcase.NewTestcaseManager(s3reader, database)

	sandbox := judger.NewJudgerSandboxImpl(fileManager, logProvider)*/

  fileManager := file.NewFileManager("/app/sandbox/results")

	checkHandler := handler.NewCheckHandler(
    fileManager,
		logProvider,
		defaultTracer,
	)

	routeProvider := router.NewRouter(checkHandler, logProvider, defaultTracer)

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
			ConnectionName: utils.Getenv("RABBITMQ_CONSUMER_CONNECTION_NAME", "iris-consumer"),
			QueueName:      utils.Getenv("RABBITMQ_CONSUMER_QUEUE_NAME", "client.q.check.submission"), // 큐 네임 설정
			Ctag:           "consumer-check",//utils.Getenv("RABBITMQ_CONSUMER_TAG", "consumer-tag"),
		},
		rabbitmq.ProducerConfig{
			AmqpURI:        uri,
			ConnectionName: utils.Getenv("RABBITMQ_PRODUCER_CONNECTION_NAME", "iris-producer"),
			ExchangeName:   utils.Getenv("RABBITMQ_PRODUCER_EXCHANGE_NAME", "iris.e.direct.judge"),
			RoutingKey:     "check.submission",//utils.Getenv("RABBITMQ_PRODUCER_ROUTING_KEY", "judge.result"),
		},
	).Connect(context.Background())

	select {}
}
