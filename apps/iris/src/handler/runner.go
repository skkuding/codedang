package handler

import (
	"context"
	"fmt"
	"strconv"
	"sync"
	"time"

	instrumentation "github.com/skkuding/codedang/apps/iris/src"
	"github.com/skkuding/codedang/apps/iris/src/service/build"
	"github.com/skkuding/codedang/apps/iris/src/service/file"
	"github.com/skkuding/codedang/apps/iris/src/service/logger"
	"github.com/skkuding/codedang/apps/iris/src/service/sandbox"
	"github.com/skkuding/codedang/apps/iris/src/service/sandbox/judger"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/trace"
)

type TaskRunner struct {
	sandbox sandbox.Sandbox[judger.JudgerConfig, judger.ExecArgs]
	file    file.FileManager
	logger  logger.Logger
	tracer  trace.Tracer
}

func NewTaskRunner(
	sandbox sandbox.Sandbox[judger.JudgerConfig, judger.ExecArgs],
	file file.FileManager,
	logger logger.Logger,
	tracer trace.Tracer,
) *TaskRunner {
	return &TaskRunner{
		sandbox: sandbox,
		file:    file,
		logger:  logger,
		tracer:  tracer,
	}
}

func (tr *TaskRunner) Logger() logger.Logger {
	return tr.logger
}

func (tr *TaskRunner) Sandbox() sandbox.Sandbox[judger.JudgerConfig, judger.ExecArgs] {
	return tr.sandbox
}

func (tr *TaskRunner) Tracer() trace.Tracer {
	return tr.tracer
}

func (tr *TaskRunner) Run(ctx context.Context, id string, validReq Task, sendResult ResultSender) {
	startedAt := time.Now()
	defer func() {
		tr.logger.Log(logger.DEBUG, fmt.Sprintf("task done: total time: %s", time.Since(startedAt)))
	}()

	handleCtx, childSpan := tr.tracer.Start(
		ctx,
		instrumentation.GetSemanticSpanName("taskRunner", "run"),
		trace.WithAttributes(attribute.Int("submissionId", func() int {
			submissionId, _ := strconv.Atoi(id)
			return submissionId
		}()),
		),
	)
	defer childSpan.End()
	tr.logger.Log(logger.INFO, fmt.Sprintf("TaskRunner started for message id: %s ", id))

	if validReq == nil {
		sendResult(ResultMessage{Err: NewTaskError("runner", SERVER_ERROR, logger.ERROR, fmt.Errorf("task must not be nil"))})
		return
	}

	// handle buildUnits
	units := validReq.GetBuildUnits()

	defer func() {
		for _, unit := range units {
			if unit != nil && unit.Dir != "" {
				if err := tr.file.RemoveDir(unit.Dir); err != nil {
					tr.logger.Log(logger.WARN, fmt.Sprintf("failed to remove build dir %s: %v", unit.Dir, err))
				}
			}
		}
	}()

	setupErrs := make([]*build.BuildUnitError, len(units))
	var wg sync.WaitGroup

	// setup buildunits concurrently
	wg.Add(len(units))
	for idx, u := range units {
		go func(index int, unit *build.BuildUnit) {
			defer wg.Done()
			if unit == nil {
				setupErrs[index] = &build.BuildUnitError{
					Unit:    fmt.Sprintf("unit-%d", index),
					Phase:   "init",
					Err:     fmt.Errorf("nil build unit at index %d", index),
					UserMsg: fmt.Sprintf("nil build unit at index %d", index),
				}
				return
			}
			if err := unit.Setup(index, len(units), tr.file, tr.sandbox); err != nil {
				setupErrs[index] = err
			}
		}(idx, u)
	}

	wg.Wait()

	for _, buildErr := range setupErrs {
		if buildErr == nil {
			continue
		}
		taskErr := buildUnitErrorToTaskError(buildErr)
		if responder, ok := validReq.(SetupFailureResponder); ok {
			responder.SendSetupFailure(id, taskErr, sendResult)
		} else {
			sendResult(ResultMessage{Result: nil, Err: taskErr})
		}
		return
	}

	// execute main job
	validReq.RunAction(handleCtx, id, sendResult)
}

func buildUnitErrorToTaskError(be *build.BuildUnitError) *TaskError {
	level := logger.ERROR
	code := SERVER_ERROR
	if be.IsUserError {
		level = logger.INFO
		code = COMPILE_ERROR
	}
	return &TaskError{
		Handler: "runner",
		Code:    code,
		UserMsg: be.UserMsg,
		Level:   level,
		Err:     be,
	}
}
