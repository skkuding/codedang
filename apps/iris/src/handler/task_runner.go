package handler

import (
	"context"
	"fmt"
	"strconv"
	"time"

	instrumentation "github.com/skkuding/codedang/apps/iris/src"
	"github.com/skkuding/codedang/apps/iris/src/common/constants"
	"github.com/skkuding/codedang/apps/iris/src/service/file"
	"github.com/skkuding/codedang/apps/iris/src/service/logger"
	"github.com/skkuding/codedang/apps/iris/src/service/sandbox"
	"github.com/skkuding/codedang/apps/iris/src/service/sandbox/judger"
	"github.com/skkuding/codedang/apps/iris/src/service/testcase"
	"github.com/skkuding/codedang/apps/iris/src/utils"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/trace"
)

type Task interface {
	GetCode() string
	GetLanguage() string
	RunAction(ctx context.Context, dir string, out chan<- ResultMessage)
}

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
		instrumentation.GetSemanticSpanName("base-handler", "handle"),
		trace.WithAttributes(attribute.Int("submissionId", func() int {
			submissionId, _ := strconv.Atoi(id)
			return submissionId
		}()),
		),
	)
	defer childSpan.End()

	dir := utils.RandString(constants.DIR_NAME_LEN) + id
	defer func() {
		tr.file.RemoveDir(dir)
		close(out)
		tr.logger.Log(logger.DEBUG, fmt.Sprintf("task %s done: total time: %s", dir, time.Since(startedAt)))
	}()

	if err := tr.file.CreateDir(dir); err != nil {
		out <- ResultMessage{Result: nil, Err: &HandlerError{
			caller:  "handle",
			err:     fmt.Errorf("creating base directory: %w", err),
			level:   logger.ERROR,
			Message: err.Error(),
		}}
		return
	}

	srcPath, err := tr.sandbox.MakeSrcPath(dir, sandbox.Language(validReq.GetLanguage()))
	if err != nil {
		out <- ResultMessage{Result: nil, Err: &HandlerError{
			caller:  "handle",
			err:     fmt.Errorf("creating src path: %w", err),
			level:   logger.ERROR,
			Message: err.Error(),
		}}
		return
	}

	if err := tr.file.CreateFile(srcPath, validReq.GetCode()); err != nil {
		out <- ResultMessage{Result: nil, Err: &HandlerError{
			caller:  "handle",
			err:     fmt.Errorf("creating src file: %w", err),
			level:   logger.ERROR,
			Message: err.Error(),
		}}
		return
	}

	compileOutCh := make(chan struct {
		Data interface{}
		Err  error
	})
	go tr.compile(handleCtx, compileOutCh, sandbox.CompileRequest{Dir: dir, Language: sandbox.Language(validReq.GetLanguage())})

	compileOut := <-compileOutCh

	if compileOut.Err != nil {
		out <- ResultMessage{Result: nil, Err: &HandlerError{
			caller:  "handle",
			err:     fmt.Errorf("%w: %s", ErrCompile, compileOut.Err),
			level:   logger.ERROR,
			Message: compileOut.Err.Error(),
		}}
		return
	}

	compileResult, ok := compileOut.Data.(sandbox.CompileResult)
	if !ok {
		out <- ResultMessage{Result: nil, Err: &HandlerError{
			caller: "handle",
			err:    fmt.Errorf("%w: CompileResult", ErrTypeAssertionFail),
			level:  logger.ERROR,
		}}
		return
	}

	// TODO: check SUCCESS
	if compileResult.ExecResult.ErrorCode != 0 {
		out <- ResultMessage{Result: nil, Err: &HandlerError{
			caller:  "handle",
			err:     fmt.Errorf("%w: %s", ErrCompile, "sandbox error"),
			level:   logger.ERROR,
			Message: "sandbox error",
		}}
		return
	}

	// RUN_SUCCESS == 1
	if compileResult.ExecResult.StatusCode != 1 {
		out <- ResultMessage{Result: nil, Err: &HandlerError{
			caller:  "handle",
			err:     ErrCompile,
			level:   logger.INFO,
			Message: string(compileResult.ErrOutput),
		}}
		return
	}

	// Dispatch to implementer's behavior
	validReq.RunAction(handleCtx, dir, out)
}

func (tr *TaskRunner) GetTestcase(ctx context.Context, out chan<- struct {
	Data any
	Err  error
}, problemId string, hidden bool) {
	_, childSpan := tr.tracer.Start(
		ctx,
		instrumentation.GetSemanticSpanName("TaskRunner", "GetTestcase"),
	)
	defer childSpan.End()

	res, err := tr.testcaseManager.GetTestcase(problemId, hidden)

	if err != nil {
		out <- struct {
			Data any
			Err  error
		}{Err: err}
		return
	}
	out <- struct {
		Data any
		Err  error
	}{Data: res}
}

func (tr *TaskRunner) compile(ctx context.Context, out chan<- struct {
	Data any
	Err  error
}, req sandbox.CompileRequest) {
	_, childSpan := tr.tracer.Start(ctx, instrumentation.GetSemanticSpanName("base-handler", "compile"))
	defer childSpan.End()

	res, err := tr.sandbox.Compile(req)
	if err != nil {
		out <- struct {
			Data any
			Err  error
		}{Err: err}
		return
	}
	out <- struct {
		Data any
		Err  error
	}{Data: res}
}
