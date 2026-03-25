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
	"github.com/skkuding/codedang/apps/iris/src/service/testcase"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/trace"
)

type TaskRunner struct {
	sandbox         sandbox.Sandbox[judger.JudgerConfig, judger.ExecArgs]
	testcaseManager testcase.TestcaseManager
	file            file.FileManager
	logger          logger.Logger
	tracer          trace.Tracer
}

func NewTaskRunner(
	sandbox sandbox.Sandbox[judger.JudgerConfig, judger.ExecArgs],
	testcaseManager testcase.TestcaseManager,
	file file.FileManager,
	logger logger.Logger,
	tracer trace.Tracer,
) *TaskRunner {
	return &TaskRunner{
		sandbox:         sandbox,
		testcaseManager: testcaseManager,
		file:            file,
		logger:          logger,
		tracer:          tracer,
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

func (tr *TaskRunner) Run(id string, validReq Task, out chan ResultMessage, ctx context.Context) {
	startedAt := time.Now()
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

	units := validReq.GetBuildUnits()

	// sendResult is scoped to this invocation, safe under concurrent Run calls.
	sendResult := func(msg ResultMessage) {
		out <- msg
	}

	defer func() {
		for _, unit := range units {
			if unit != nil && unit.Dir != "" {
				tr.file.RemoveDir(unit.Dir)
			}
		}
		close(out)
		tr.logger.Log(logger.DEBUG, fmt.Sprintf("task done: total time: %s", time.Since(startedAt)))
	}()

	errCh := make(chan *build.BuildUnitError, len(units))
	var wg sync.WaitGroup

	for idx, u := range units {
		wg.Add(1)
		go func(index int, unit *build.BuildUnit) {
			defer wg.Done()
			if unit == nil {
				errCh <- &build.BuildUnitError{
					Unit:    fmt.Sprintf("unit-%d", index),
					Phase:   "init",
					Err:     fmt.Errorf("nil build unit at index %d", index),
					UserMsg: fmt.Sprintf("nil build unit at index %d", index),
				}
				return
			}
			if err := unit.Setup(index, len(units), tr.file, tr.sandbox); err != nil {
				errCh <- err
			}
		}(idx, u)
	}

	wg.Wait()
	close(errCh)

	for buildErr := range errCh {
		sendResult(ResultMessage{Result: nil, Err: buildUnitErrorToTaskError(buildErr)})
		return
	}

	validReq.RunAction(handleCtx, sendResult)
}
