package handler

import (
	"encoding/json"
	"fmt"
	"strconv"
	"time"

	"github.com/skkuding/codedang/iris/src/common/constants"
	"github.com/skkuding/codedang/iris/src/common/result"
	"github.com/skkuding/codedang/iris/src/service/file"
	"github.com/skkuding/codedang/iris/src/service/grader"
	"github.com/skkuding/codedang/iris/src/service/logger"
	"github.com/skkuding/codedang/iris/src/service/sandbox"
	"github.com/skkuding/codedang/iris/src/service/testcase"
	"github.com/skkuding/codedang/iris/src/utils"
)

type Request struct {
	Code        string `json:"code"`
	Language    string `json:"language"`
	ProblemId   int    `json:"problemId"`
	TimeLimit   int    `json:"timeLimit"`
	MemoryLimit int    `json:"memoryLimit"`
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

type Result struct {
	TotalTestcase int           `json:"totalTestcase"`
	AcceptedNum   int           `json:"acceptedNum"`
	JudgeResult   []JudgeResult `json:"judgeResult"`
}

type JudgeResult struct {
	TestcaseId string          `json:"testcaseId"`
	ResultCode JudgeResultCode `json:"resultCode"`
	CpuTime    int             `json:"cpuTime"`
	RealTime   int             `json:"realTime"`
	Memory     int             `json:"memory"`
	Signal     int             `json:"signal"`
	ExitCode   int             `json:"exitCode"`
	ErrorCode  int             `json:"errorCode"`
	Error      string          `json:"error"`
}

type JudgeResultMessage struct {
	Result json.RawMessage
	Err    error
}

func (r *Result) Accepted() {
	r.AcceptedNum += 1
}

func (r *Result) SetJudgeResult(idx int, testcaseId string, execResult sandbox.ExecResult) {
	r.JudgeResult[idx].TestcaseId = testcaseId
	r.JudgeResult[idx].CpuTime = execResult.CpuTime
	r.JudgeResult[idx].RealTime = execResult.RealTime
	r.JudgeResult[idx].Memory = execResult.Memory
	r.JudgeResult[idx].Signal = execResult.Signal
	r.JudgeResult[idx].ErrorCode = execResult.ErrorCode
	r.JudgeResult[idx].ExitCode = execResult.ExitCode
	r.JudgeResult[idx].ResultCode = SandboxResultCodeToJudgeResultCode(execResult.ResultCode)
	// system error가 아니면 run result task에 반영(Resource usage)
}

func (r *Result) SetJudgeResultCode(idx int, code JudgeResultCode) {
	r.JudgeResult[idx].ResultCode = code
}

func (r *Result) Marshal() (json.RawMessage, error) {
	if res, err := json.Marshal(r); err != nil {
		return nil, &HandlerError{caller: "judge-handler", err: fmt.Errorf("marshaling result: %w", err)}
	} else {
		return res, nil
	}
}

// JudgeResult ResultCode
type JudgeResultCode int8

const (
	ACCEPTED = 0 + iota
	WRONG_ANSWER
	CPU_TIME_LIMIT_EXCEEDED
	REAL_TIME_LIMIT_EXCEEDED
	MEMORY_LIMIT_EXCEEDED
	RUNTIME_ERROR
	SYSTEM_ERROR
)

type JudgeHandler struct {
	compiler        sandbox.Compiler
	runner          sandbox.Runner
	testcaseManager testcase.TestcaseManager
	langConfig      sandbox.LangConfig
	file            file.FileManager
	logger          logger.Logger
}

func NewJudgeHandler(
	compiler sandbox.Compiler,
	runner sandbox.Runner,
	testcaseManager testcase.TestcaseManager,
	langConfig sandbox.LangConfig,
	file file.FileManager,
	logger logger.Logger,
) *JudgeHandler {
	return &JudgeHandler{
		compiler,
		runner,
		testcaseManager,
		langConfig,
		file,
		logger,
	}
}

// handle top layer logical flow
func (j *JudgeHandler) Handle(id string, data []byte, out chan JudgeResultMessage) {
	startedAt := time.Now()

	//TODO: validation logic here
	req := Request{}
	res := Result{}

	err := json.Unmarshal(data, &req)
	if err != nil {
		out <- JudgeResultMessage{nil, &HandlerError{
			caller:  "handle",
			err:     fmt.Errorf("%w: %s", ErrValidate, err),
			level:   logger.ERROR,
			Message: err.Error(),
		}}
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
		return
	}

	dir := utils.RandString(constants.DIR_NAME_LEN) + id
	defer func() {
		j.file.RemoveDir(dir)
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

	srcPath, err := j.langConfig.MakeSrcPath(dir, sandbox.Language(validReq.Language))
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

	// err = j.judger.Judge(task)
	testcaseOutCh := make(chan result.ChResult)
	go j.getTestcase(testcaseOutCh, strconv.Itoa(validReq.ProblemId))
	compileOutCh := make(chan result.ChResult)
	go j.compile(compileOutCh, sandbox.CompileRequest{Dir: dir, Language: sandbox.Language(validReq.Language)})

	testcaseOut := <-testcaseOutCh
	compileOut := <-compileOutCh

	if testcaseOut.Err != nil {
		out <- JudgeResultMessage{nil, &HandlerError{
			caller:  "handle",
			err:     fmt.Errorf("%w: %s", ErrTestcaseGet, testcaseOut.Err),
			level:   logger.ERROR,
			Message: testcaseOut.Err.Error(),
		}}
		return
	}
	// elements, ok := testcaseOut.Data.([]testcase.Element)
	// tc := testcase.Testcase{Elements: elements}
	tc, ok := testcaseOut.Data.(testcase.Testcase)
	if !ok {
		out <- JudgeResultMessage{nil, &HandlerError{
			caller: "handle",
			err:    fmt.Errorf("%w: Testcase", ErrTypeAssertionFail),
			level:  logger.ERROR,
		}}
		return
	}

	if compileOut.Err != nil {
		// 컴파일러 실행 과정이나 이후 처리 과정에서 오류가 생긴 경우
		out <- JudgeResultMessage{nil, &HandlerError{
			caller: "handle",
			err:    fmt.Errorf("%w: %s", ErrSandbox, compileOut.Err),
			level:  logger.ERROR,
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
	if compileResult.ExecResult.ResultCode != sandbox.SUCCESS {
		// 컴파일러를 실행했으나 컴파일에 실패한 경우
		// FIXME: 함수로 분리
		if marshaledRes, err := res.Marshal(); err != nil {
			out <- JudgeResultMessage{nil, &HandlerError{err: ErrMarshalJson}}
			return
		} else {
			out <- JudgeResultMessage{marshaledRes, &HandlerError{
				err:     ErrCompile,
				Message: compileResult.ErrOutput,
			}}
			return
		}
	}

	tcNum := tc.Count()
	// FIXME: res.Init으로 분리
	res.JudgeResult = make([]JudgeResult, tcNum)
	res.TotalTestcase = tcNum

	for i := 0; i < tcNum; i++ {
		time.Sleep(time.Millisecond)
		runResult, err := j.runner.Run(sandbox.RunRequest{
			Order:       i,
			Dir:         dir,
			Language:    sandbox.Language(validReq.Language),
			TimeLimit:   validReq.TimeLimit,
			MemoryLimit: validReq.MemoryLimit,
		}, []byte(tc.Elements[i].In))

		if err != nil {
			j.logger.Log(logger.ERROR, fmt.Sprintf("Error while running sandbox: %s", err.Error()))
			res.JudgeResult[i].ResultCode = SYSTEM_ERROR
			res.JudgeResult[i].Error = string(runResult.ErrOutput)
			continue
		}
		res.SetJudgeResult(i, tc.Elements[i].Id, runResult.ExecResult)
		if runResult.ExecResult.ResultCode != sandbox.RUN_SUCCESS {
			continue
		}

		// 하나당 약 50microsec 10개 채점시 500microsec.
		// output이 커지면 더 길어짐 -> FIXME: 최적화 과정에서 goroutine으로 수정
		// st := time.Now()
		accepted := grader.Grade([]byte(tc.Elements[i].Out), runResult.Output)
		if accepted {
			res.Accepted()
			res.SetJudgeResultCode(i, ACCEPTED)
		} else {
			res.SetJudgeResultCode(i, WRONG_ANSWER)
		}
	}

	marshaledRes, err := json.Marshal(res)
	if err != nil {
		out <- JudgeResultMessage{nil, &HandlerError{err: ErrMarshalJson, level: logger.ERROR}}
		return
	}
	out <- JudgeResultMessage{marshaledRes, ParseFirstError(res.JudgeResult)}
}

// wrapper to use goroutine
func (j *JudgeHandler) compile(out chan<- result.ChResult, dto sandbox.CompileRequest) {
	res, err := j.compiler.Compile(dto)
	if err != nil {
		out <- result.ChResult{Err: err}
		return
	}
	out <- result.ChResult{Data: res}
}

// wrapper to use goroutine
func (j *JudgeHandler) getTestcase(out chan<- result.ChResult, problemId string) {
	res, err := j.testcaseManager.GetTestcase(problemId)
	if err != nil {
		out <- result.ChResult{Err: err}
		return
	}
	out <- result.ChResult{Data: res}
}
