package judge

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"strconv"

	instrumentation "github.com/skkuding/codedang/apps/iris/src"
	"github.com/skkuding/codedang/apps/iris/src/common/constants"
	"github.com/skkuding/codedang/apps/iris/src/handler"
	"github.com/skkuding/codedang/apps/iris/src/service/build"
	"github.com/skkuding/codedang/apps/iris/src/loader"
	"github.com/skkuding/codedang/apps/iris/src/service/grader"
	"github.com/skkuding/codedang/apps/iris/src/service/logger"
	"github.com/skkuding/codedang/apps/iris/src/service/sandbox"
	"github.com/skkuding/codedang/apps/iris/src/service/sandbox/judger"
	"github.com/skkuding/codedang/apps/iris/src/service/testcase"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/trace"
)

type Task struct {
	req        *JudgeRequest
	tcFilter   testcase.TestcaseFilterCode
	buildUnits []*build.BuildUnit
	tcManager  testcase.TestcaseManager
	sandbox    sandbox.Sandbox[judger.JudgerConfig, judger.ExecArgs]
	logger     logger.Logger
	tracer     trace.Tracer
}

func (t *Task) GetDebugString() string {
	if t == nil {
		return "judge.Task<nil>"
	}
	if t.req == nil {
		return "judge.Task{req:nil}"
	}
	return fmt.Sprintf("judge.Task{problemId:%d,language:%s,tcFilter:%d}", t.req.ProblemId, t.req.Language, t.tcFilter)
}

func (t *Task) GetBuildUnits() []*build.BuildUnit {
	return t.buildUnits
}

func (t *Task) RunAction(ctx context.Context, sendResult handler.ResultSender2Runner) {
	validReq := t.req

	var tc testcase.Testcase

	if validReq.UserTestcases != nil {
		tc = testcase.Testcase{Elements: *validReq.UserTestcases}
	} else {
		res, err := t.tcManager.GetTestcase(strconv.Itoa(validReq.ProblemId), t.tcFilter)
		if err != nil {
			sendResult(handler.ResultMessage{Result: nil, Err: handler.NewTaskError("judge", handler.TESTCASE_ERROR, logger.ERROR, fmt.Errorf("get testcase failed: %w", err))})
			return
		}

		tc = res
	}

	tcNum := len(tc.Elements)
	for i, tElement := range tc.Elements {
		var judgeResultCode handler.ResultCode
		if tElement.In != "" {
			judgeResultCode = t.judgeTestcase(ctx, i, validReq, tElement, sendResult)
		}

		if validReq.StopOnNotAccepted && judgeResultCode != handler.ACCEPTED {
			for idxToCancel := i + 1; idxToCancel < tcNum; idxToCancel++ {
				t.sendCancelResult(tc.Elements[idxToCancel], sendResult)
			}
			break
		}
	}
}

func (t *Task) judgeTestcase(ctx context.Context, idx int, validReq *JudgeRequest,
	tc loader.ElementOut, sendResult func(handler.ResultMessage)) handler.ResultCode {
	_, childSpan := t.tracer.Start(
		ctx,
		instrumentation.GetSemanticSpanName("judge-handler", "judgeTestcase"),
		trace.WithAttributes(attribute.String("problemId", strconv.Itoa(validReq.ProblemId)), attribute.String("testcaseId", strconv.Itoa(tc.Id))),
	)
	defer childSpan.End()

	res := JudgeResult{}

	runResult, err := t.buildUnits[0].Run(t.sandbox, sandbox.RunRequest{
		Order:       idx,
		TimeLimit:   validReq.TimeLimit,
		MemoryLimit: validReq.MemoryLimit,
	}, []byte(tc.In))

	var accepted bool
	judgeResultCode := handler.SandboxStatusCodeToJudgeResultCode(runResult.ExecResult.StatusCode)

	// Cgroup 경로 삭제
	if runResult.ExecResult.CgroupPath != "" {
		if err := os.RemoveAll(runResult.ExecResult.CgroupPath); err != nil {
			t.logger.Log(logger.WARN, fmt.Sprintf("failed to clean up run cgroup dir %s: %v", runResult.ExecResult.CgroupPath, err))
		}
	}

	if err != nil {
		t.logger.Log(logger.ERROR, fmt.Sprintf("Error while running sandbox: %s", err.Error()))
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
		judgeResultCode = handler.WRONG_ANSWER
	}

Send:
	marshaledRes, err := json.Marshal(res)
	if err != nil {
		sendResult(handler.ResultMessage{Result: nil, Err: handler.NewTaskError("judge", handler.SERVER_ERROR, logger.ERROR, fmt.Errorf("marshal failed"))})
	} else {
		sendResult(handler.ResultMessage{Result: marshaledRes, Err: handler.ParseError(res, judgeResultCode)})
	}
	return judgeResultCode
}

func (t *Task) sendCancelResult(element loader.ElementOut, sendResult func(handler.ResultMessage)) {
	canceledResult := JudgeResult{
		TestcaseId: element.Id,
		ErrorCode:  int(handler.CANCELED),
		Error:      "Execution canceled due to previous test case failure",
	}

	marshaledRes, err := json.Marshal(canceledResult)
	if err != nil {
		sendResult(handler.ResultMessage{Result: nil, Err: handler.NewTaskError("judge", handler.SERVER_ERROR, logger.ERROR, fmt.Errorf("marshal failed"))})
		return
	}
	sendResult(handler.ResultMessage{Result: marshaledRes, Err: handler.ParseError(canceledResult, handler.CANCELED)})
}
