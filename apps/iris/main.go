package main

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"time"

	"github.com/skkuding/codedang/apps/iris/src/connector"
	"github.com/skkuding/codedang/apps/iris/src/connector/rabbitmq"
	"github.com/skkuding/codedang/apps/iris/src/handler"
	"github.com/skkuding/codedang/apps/iris/src/loader/postgres"
	"github.com/skkuding/codedang/apps/iris/src/observability"
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

	http.HandleFunc("/health", healthCheckHandler)
	go func() {
		if err := http.ListenAndServe("0.0.0.0:9999", nil); err != nil {
			fmt.Println("Failed to start health checker:", err)
			os.Exit(1)
		}
	}()

	// profile()
	env := Env(utils.Getenv("APP_ENV", "stage"))
	logProvider := logger.NewLogger(logger.Console, env == Production)

	ctx := context.Background()
	if env == "production" {
		// load container Id from args
		containerId := os.Args[1]
		if len(containerId) == 0 {
			logProvider.Log(logger.ERROR, "Cannot find containerId Args")
		}

		if utils.Getenv("OTEL_EXPORTER_OTLP_ENDPOINT_URL", "") != "" {
			shutdown := observability.InitTracer(ctx)
			defer shutdown()
			observability.SetGlobalMeterProvider(containerId)
			// Aynchronous Instruments로써, go routine 불필요
			observability.GetMemoryMeter(otel.Meter("memory-metrics"))
			observability.GetCPUMeter(otel.Meter("cpu-metrics"), 15*time.Second)
		} else {
			logProvider.Log(logger.INFO, "Cannot find OTEL_EXPORTER_OTLP_ENDPOINT_URL")
		}
	} else {
		logProvider.Log(logger.INFO, "Running in stage mode")
	}

	database := postgres.NewPostgresDataSource(ctx)
	testcaseManager := testcase.NewTestcaseManager(database)

	fileManager := file.NewFileManager("/app/sandbox/results")

	sandbox := judger.NewJudgerSandboxImpl(fileManager, logProvider)

	judgeHandler := handler.NewJudgeHandler(
		sandbox,
		testcaseManager,
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

	go connector.Factory(
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
