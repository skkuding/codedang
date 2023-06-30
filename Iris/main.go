package main

import (
	"context"
	"net/http"
	"os"
	"strconv"
	"time"

	// _ "net/http/pprof"
	"github.com/cranemont/iris/src/connector"
	"github.com/cranemont/iris/src/connector/rabbitmq"
	datasource "github.com/cranemont/iris/src/data_source"
	"github.com/cranemont/iris/src/data_source/cache"
	fileDataSource "github.com/cranemont/iris/src/data_source/file"
	httpserver "github.com/cranemont/iris/src/data_source/http_server"
	"github.com/cranemont/iris/src/handler"
	"github.com/cranemont/iris/src/router"
	"github.com/cranemont/iris/src/service/file"
	"github.com/cranemont/iris/src/service/logger"
	"github.com/cranemont/iris/src/service/sandbox"
	"github.com/cranemont/iris/src/service/testcase"
	"github.com/cranemont/iris/src/utils"
)

func profile() {
	go func() {
		http.ListenAndServe("localhost:6060", nil)
		// use <go tool pprof -http :8080 http://localhost:6060/debug/pprof/profile\?seconds\=30> to profile
	}()
}

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

	var dataSource datasource.Read
	serverUrl := os.Getenv("TESTCASE_SERVER_URL")
	if serverUrl == "" {
		dataSource = fileDataSource.NewFileDataSource(os.DirFS("./testcase"))
		logProvider.Log(logger.INFO, "Cannot find TESTCASE_SERVER_URL. It will read testcase from the \"./testcase\" directory")
	} else {
		timeout, err := strconv.Atoi(utils.Getenv("TESTCASE_SERVER_TIMEOUT", "5"))
		if err != nil {
			timeout = 5
		}
		dataSource = httpserver.NewHttpServerDataSource(
			serverUrl,
			utils.Getenv("TESTCASE_SERVER_URL_PLACEHOLDER", ":id"),
			utils.Getenv("TESTCASE_SERVER_AUTH_TOKEN", "iris"),
			utils.Getenv("TESTCASE_SERVER_AUTH_HEADER", "Authorization"),
			time.Second * time.Duration(timeout),
		)
	}
	testcaseManager := testcase.NewTestcaseManager(dataSource, cache)

	fileManager := file.NewFileManager("/app/sandbox/results")
	langConfig := sandbox.NewLangConfig(fileManager, "/app/sandbox/policy/java_policy")

	sb := sandbox.NewSandbox("/app/sandbox/libjudger.so", logProvider)
	compiler := sandbox.NewCompiler(sb, langConfig, fileManager)
	runner := sandbox.NewRunner(sb, langConfig, fileManager)

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

	uri := "amqp://" +
		utils.Getenv("RABBITMQ_DEFAULT_USER", "skku") + ":" +
		utils.Getenv("RABBITMQ_DEFAULT_PASS", "1234") + "@" +
		utils.Getenv("RABBITMQ_HOST", "localhost") + ":" +
		utils.Getenv("RABBITMQ_PORT", "5672") + "/"

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
