package handler

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"strconv"
	"time"

	instrumentation "github.com/skkuding/codedang/apps/iris/src"
	"github.com/skkuding/codedang/apps/iris/src/common/constants"
	"github.com/skkuding/codedang/apps/iris/src/common/result"
	"github.com/skkuding/codedang/apps/iris/src/loader"
	"github.com/skkuding/codedang/apps/iris/src/service/file"
	"github.com/skkuding/codedang/apps/iris/src/service/grader"
	"github.com/skkuding/codedang/apps/iris/src/service/logger"
	"github.com/skkuding/codedang/apps/iris/src/service/sandbox"
	"github.com/skkuding/codedang/apps/iris/src/service/testcase"
	"github.com/skkuding/codedang/apps/iris/src/utils"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/trace"
)

type Request struct {
	Code                     string            `json:"code"`
	Language                 string            `json:"language"`
	ProblemId                int               `json:"problemId"`
	TimeLimit                int               `json:"timeLimit"`
	MemoryLimit              int               `json:"memoryLimit"`
	UserTestcases            *[]loader.Element `json:"userTestcases,omitempty"`            // 사용자 테스트 케이스
	StopOnNotAccepted        bool              `json:"stopOnNotAccepted,omitempty"`        // 테스트 케이스가 틀리면 이후 테스트 케이스 실행 중단
	JudgeOnlyHiddenTestcases bool              `json:"judgeOnlyHiddenTestcases,omitempty"` // Hidden 테스트 케이스만 채점
	ContainHiddenTestcases   bool              `json:"containHiddenTestcases,omitempty"`   // Hidden 테스트 케이스도 포함하여 채점(Run의 경우)
}

func (r Request) Validate() (*Request, error) {
	if r.Code == "" {
		return nil, fmt.Errorf("code must not be empty")
	}
	if r.Language == "" {
		return nil, fmt.Errorf("language must not be empty")
	}
	if !sandbox.Language(r.Language).IsValid() {
		return nil, fmt.Errorf("unsupported language: %s", r.Language)
	}
	if r.ProblemId == 0 {
		return nil, fmt.Errorf("problemId must not be empty or zero")
	}
	if r.TimeLimit <= 0 {
		return nil, fmt.Errorf("timeLimit must not be empty or less than 0")
	}
	if r.MemoryLimit <= 0 {
		return nil, fmt.Errorf("memoryLimit must not be empty or less than 0")
	}
	return &r, nil
}

type JudgeResult struct {
	TestcaseId int    `json:"testcaseId"`
	Output     string `json:"output"`
	CpuTime    int    `json:"cpuTime"`
	RealTime   int    `json:"realTime"`
	Memory     int    `json:"memory"`
	Signal     int    `json:"signal"`
	ExitCode   int    `json:"exitCode"`
	ErrorCode  int    `json:"errorCode"`
	Error      string `json:"error"`
}

type JudgeResultMessage struct {
	Result json.RawMessage
	Err    error
}

var ErrJudgeEnd = errors.New("judge handle end")

func (r *JudgeResult) SetJudgeExecResult(execResult sandbox.ExecResult) {
	r.CpuTime = execResult.CpuTime
	r.RealTime = execResult.RealTime
	r.Memory = execResult.Memory
	r.Signal = execResult.Signal
	r.ExitCode = execResult.ExitCode
	r.ErrorCode = execResult.ErrorCode
}

type JudgeHandler[C any, E any] struct {
	sandbox         sandbox.Sandbox[C, E]
	testcaseManager testcase.TestcaseManager
	file            file.FileManager
	logger          logger.Logger
	tracer          trace.Tracer
}

func NewJudgeHandler[C any, E any](
	sandbox sandbox.Sandbox[C, E],
	testcaseManager testcase.TestcaseManager,
	file file.FileManager,
	logger logger.Logger,
	tracer trace.Tracer,
) *JudgeHandler[C, E] {
	return &JudgeHandler[C, E]{
		sandbox,
		testcaseManager,
		file,
		logger,
		tracer,
	}
}

// handle top layer logical flow
func (j *JudgeHandler[C, E]) Handle(id string, data []byte, hidden bool, out chan JudgeResultMessage, ctx context.Context) {
	startedAt := time.Now()
	handleCtx, childSpan := j.tracer.Start(
		ctx,
		instrumentation.GetSemanticSpanName("judge-handler", "handle"),
		trace.WithAttributes(attribute.Int("submissionId", func() int {
			submissionId, _ := strconv.Atoi(id)
			return submissionId
		}()),
		),
	)
	defer childSpan.End()

	//TODO: validation logic here
	req := Request{}

	err := json.Unmarshal(data, &req)
	if err != nil {
		out <- JudgeResultMessage{nil, &HandlerError{
			caller:  "handle",
			err:     fmt.Errorf("%w: %s", ErrValidate, err),
			level:   logger.ERROR,
			Message: err.Error(),
		}}
		close(out)
		return
	}
	validReq, err := req.Validate()
	if err != nil {
		out <- JudgeResultMessage{nil, &HandlerError{
			caller:  "request validate",
			err:     fmt.Errorf("%w: %s", ErrValidate, err),
			level:   logger.ERROR,
			Message: err.Error(),
		}}
		close(out)
		return
	}

	dir := utils.RandString(constants.DIR_NAME_LEN) + id
	defer func() {
		j.file.RemoveDir(dir)
		close(out)
		j.logger.Log(logger.DEBUG, fmt.Sprintf("task %s done: total time: %s", dir, time.Since(startedAt)))
	}()

	if err := j.file.CreateDir(dir); err != nil {
		out <- JudgeResultMessage{nil, &HandlerError{
			caller:  "handle",
			err:     fmt.Errorf("creating base directory: %w", err),
			level:   logger.ERROR,
			Message: err.Error(),
		}}
		return
	}

	srcPath, err := j.sandbox.MakeSrcPath(dir, sandbox.Language(validReq.Language))
	if err != nil {
		out <- JudgeResultMessage{nil, &HandlerError{
			caller:  "handle",
			err:     fmt.Errorf("creating src path: %w", err),
			level:   logger.ERROR,
			Message: err.Error(),
		}}
		return
	}

	if err := j.file.CreateFile(srcPath, validReq.Code); err != nil {
		out <- JudgeResultMessage{nil, &HandlerError{
			caller:  "handle",
			err:     fmt.Errorf("creating src file: %w", err),
			level:   logger.ERROR,
			Message: err.Error(),
		}}
		return
	}

	var tc testcase.Testcase

	if req.UserTestcases != nil {
		tc = testcase.Testcase{Elements: *req.UserTestcases}
	} else {
		testcaseOutCh := make(chan result.ChResult)
		go j.getTestcase(handleCtx, testcaseOutCh, strconv.Itoa(validReq.ProblemId), hidden)

		testcaseOut := <-testcaseOutCh

		if testcaseOut.Err != nil {
			out <- JudgeResultMessage{nil, &HandlerError{
				caller:  "handle",
				err:     fmt.Errorf("%w: %s", ErrTestcaseGet, testcaseOut.Err),
				level:   logger.ERROR,
				Message: testcaseOut.Err.Error(),
			}}
			return
		}

		var ok bool

		tc, ok = testcaseOut.Data.(testcase.Testcase)
		if !ok {
			out <- JudgeResultMessage{nil, &HandlerError{
				caller: "handle",
				err:    fmt.Errorf("%w: Testcase", ErrTypeAssertionFail),
				level:  logger.ERROR,
			}}
			return
		}

		if validReq.JudgeOnlyHiddenTestcases {
			hiddenTestcases := make([]loader.Element, 0)
			for _, testcase := range tc.Elements {
				if testcase.Hidden {
					hiddenTestcases = append(hiddenTestcases, testcase)
				}
			}
			tc = testcase.Testcase{Elements: hiddenTestcases}
		}
	}

	compileOutCh := make(chan result.ChResult)
	go j.compile(handleCtx, compileOutCh, sandbox.CompileRequest{Dir: dir, Language: sandbox.Language(validReq.Language)})

	compileOut := <-compileOutCh

	// 컴파일러 실행 과정이나 이후 처리 과정에서 오류가 생긴 경우
	if compileOut.Err != nil {
		out <- JudgeResultMessage{nil, &HandlerError{
			caller:  "handle",
			err:     fmt.Errorf("%w: %s", ErrCompile, compileOut.Err),
			level:   logger.ERROR,
			Message: compileOut.Err.Error(),
		}}
		return
	}

	compileResult, ok := compileOut.Data.(sandbox.CompileResult)
	if !ok {
		out <- JudgeResultMessage{nil, &HandlerError{
			caller: "handle",
			err:    fmt.Errorf("%w: CompileResult", ErrTypeAssertionFail),
			level:  logger.INFO,
		}}
		return
	}

	if compileResult.ExecResult.StatusCode != sandbox.RUN_SUCCESS {
		// 컴파일러를 실행했으나 컴파일에 실패한 경우
		// FIXME: 함수로 분리
		out <- JudgeResultMessage{nil, &HandlerError{
			err: ErrCompile, Message: compileResult.ErrOutput,
		}}
		return
	}

	tcNum := tc.Count()
	for i := range tcNum {
		judgeResultCode := j.judgeTestcase(ctx, i, dir, validReq, tc.Elements[i], out)
		if validReq.StopOnNotAccepted && judgeResultCode != ACCEPTED {
			for idxToCancel := i + 1; idxToCancel < tcNum; idxToCancel++ {
				j.sendCancelResult(tc.Elements[idxToCancel], out)
			}
			break
		}
	}
}

// wrapper to use goroutine
func (j *JudgeHandler[C, E]) compile(ctx context.Context, out chan<- result.ChResult, dto sandbox.CompileRequest) {
	_, childSpan := j.tracer.Start(
		ctx,
		instrumentation.GetSemanticSpanName("judge-handler", "compile"),
	)
	defer childSpan.End()

	res, err := j.sandbox.Compile(dto)
	if err != nil {
		out <- result.ChResult{Err: err}
		return
	}
	out <- result.ChResult{Data: res}
}

// wrapper to use goroutine
func (j *JudgeHandler[C, E]) getTestcase(ctx context.Context, out chan<- result.ChResult, problemId string, hidden bool) {
	_, childSpan := j.tracer.Start(
		ctx,
		instrumentation.GetSemanticSpanName("judge-handler", "getTestcase"),
	)
	defer childSpan.End()

	res, err := j.testcaseManager.GetTestcase(problemId, hidden)

	if err != nil {
		out <- result.ChResult{Err: err}
		return
	}
	out <- result.ChResult{Data: res}
}

func (j *JudgeHandler[C, E]) judgeTestcase(ctx context.Context, idx int, dir string, validReq *Request,
	tc loader.Element, out chan JudgeResultMessage) ResultCode {
	_, childSpan := j.tracer.Start(
		ctx,
		instrumentation.GetSemanticSpanName("judge-handler", "judgeTestcase"),
	)
	defer childSpan.End()

	res := JudgeResult{}

	time.Sleep(time.Millisecond)

	runResult, err := j.sandbox.Run(sandbox.RunRequest{
		Order:       idx,
		Dir:         dir,
		Language:    sandbox.Language(validReq.Language),
		TimeLimit:   validReq.TimeLimit,
		MemoryLimit: validReq.MemoryLimit,
	}, []byte(tc.In))

	var accepted bool
	judgeResultCode := SandboxStatusCodeToJudgeResultCode(runResult.ExecResult.StatusCode)

	// Cgroup 경로 삭제
	if runResult.ExecResult.CgroupPath != "" {
		if err := os.RemoveAll(runResult.ExecResult.CgroupPath); err != nil {
			j.logger.Log(logger.WARN, fmt.Sprintf("failed to clean up run cgroup dir %s: %v", runResult.ExecResult.CgroupPath, err))
		}
	}

	if err != nil {
		j.logger.Log(logger.ERROR, fmt.Sprintf("Error while running sandbox: %s", err.Error()))
		res.Error = string(runResult.ErrOutput)
		goto Send
	}

	res.TestcaseId = tc.Id
	res.SetJudgeExecResult(runResult.ExecResult)
	res.Output = string(runResult.Output)

	if len(res.Output) > constants.MAX_OUTPUT {
		res.Output = res.Output[:constants.MAX_OUTPUT]
	}

	if runResult.ExecResult.StatusCode != sandbox.RUN_SUCCESS {
		goto Send
	}

	accepted = grader.Grade([]byte(tc.Out), runResult.Output)

	if !accepted {
		judgeResultCode = WRONG_ANSWER
	}

	// TODO: ChResult 구조체 활용
Send:
	marshaledRes, err := json.Marshal(res)
	if err != nil {
		out <- JudgeResultMessage{nil, &HandlerError{err: ErrMarshalJson, level: logger.ERROR}}
	} else {
		out <- JudgeResultMessage{marshaledRes, ParseError(res, judgeResultCode)}
	}
	return judgeResultCode
}

func (j *JudgeHandler[C, E]) sendCancelResult(element loader.Element, out chan JudgeResultMessage) {
	canceledResult := JudgeResult{
		TestcaseId: element.Id,
		ErrorCode:  int(CANCELED),
		Error:      "Execution canceled due to previous test case failure",
	}

	marshaledRes, err := json.Marshal(canceledResult)
	if err != nil {
		out <- JudgeResultMessage{nil, &HandlerError{err: ErrMarshalJson, level: logger.ERROR}}
		return
	}
	out <- JudgeResultMessage{marshaledRes, ParseError(canceledResult, CANCELED)}
}
