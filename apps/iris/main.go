package main

import (
	"context"
	"fmt"
	"net/http"
	_ "net/http/pprof"
	"runtime"
	"strconv"
	"time"

	"github.com/joho/godotenv"
	instrumentation "github.com/skkuding/codedang/apps/iris/src"
	"github.com/skkuding/codedang/apps/iris/src/common/constants"
	"github.com/skkuding/codedang/apps/iris/src/connector/mq"
	"github.com/skkuding/codedang/apps/iris/src/handler"
	"github.com/skkuding/codedang/apps/iris/src/handler/generate"
	"github.com/skkuding/codedang/apps/iris/src/handler/judge"
	"github.com/skkuding/codedang/apps/iris/src/handler/run"
	"github.com/skkuding/codedang/apps/iris/src/handler/validate"
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
		healthMux := http.NewServeMux()
		healthMux.HandleFunc("/health", healthCheckHandler)
		go func() {
			if err := http.ListenAndServe("0.0.0.0:3404", healthMux); err != nil {
				logProvider.Log(logger.ERROR, fmt.Sprintf("Failed to start health checker: %v", err))
			}
		}()
	}

	if blockRate := utils.Getenv("PPROF_BLOCK_RATE", "0"); blockRate != "0" {
		if n, err := strconv.Atoi(blockRate); err == nil {
			runtime.SetBlockProfileRate(n)
		} else {
			logProvider.Log(logger.ERROR, fmt.Sprintf("Invalid PPROF_BLOCK_RATE: %v", err))
		}
	}
	if mutexFraction := utils.Getenv("PPROF_MUTEX_FRACTION", "0"); mutexFraction != "0" {
		if n, err := strconv.Atoi(mutexFraction); err == nil {
			runtime.SetMutexProfileFraction(n)
		} else {
			logProvider.Log(logger.ERROR, fmt.Sprintf("Invalid PPROF_MUTEX_FRACTION: %v", err))
		}
	}

	go func() {
		logProvider.Log(logger.INFO, "Intializing pprof listening on :6060")
		if err := http.ListenAndServe("0.0.0.0:6060", nil); err != nil {
			logProvider.Log(logger.ERROR, fmt.Sprintf("Failed to start pprof: %v", err))
		}
	}()

	// Go SDK는 OTEL_SDK_DISABLED를 읽지 않아 앱에서 직접 확인한다
	if utils.Getenv("OTEL_SDK_DISABLED", "false") != "true" {
		shutdown, err := instrumentation.Init(ctx, "iris")
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
	database, err := loader.NewPostgresDataSource(logProvider)
	if err != nil {
		logProvider.Log(logger.ERROR, fmt.Sprintf("Failed to create Postgres data source: %v", err))
		return
	}
	testcaseManager := testcase.NewTestcaseManager(s3reader, database, logProvider)

	fileManager := file.NewFileManager(constants.RESULT_PATH)

	sandbox := judger.NewJudgerSandboxImpl(fileManager, logProvider)

	taskRunner := handler.NewTaskRunner(
		sandbox,
		fileManager,
		logProvider,
		defaultTracer,
	)

	judgeTaskFactory := judge.NewFactory(testcaseManager, sandbox, logProvider, defaultTracer)

	runTaskFactory := run.NewFactory(testcaseManager, sandbox, logProvider, defaultTracer)

	generateTaskFactory := generate.NewFactory(testcaseManager, sandbox, logProvider)

	validateTaskFactory := validate.NewFactory(testcaseManager, sandbox, logProvider)

	routeProvider := router.NewRouter(
		taskRunner,
		judgeTaskFactory,
		runTaskFactory,
		generateTaskFactory,
		validateTaskFactory,
		logProvider,
		defaultTracer,
	)

	logProvider.Log(logger.INFO, "Server Started")

	mqConnector := mq.NewConnector(routeProvider, logProvider)
	go mqConnector.Connect(ctx)

	select {}
}
