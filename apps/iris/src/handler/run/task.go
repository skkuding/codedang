package run

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"strconv"

	instrumentation "github.com/skkuding/codedang/apps/iris/src"
	"github.com/skkuding/codedang/apps/iris/src/common/constants"
	"github.com/skkuding/codedang/apps/iris/src/handler"
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
	req        *RunRequest
	hidden     bool
	buildUnits []*handler.BuildUnit
	tcManager  testcase.TestcaseManager
	sandbox    sandbox.Sandbox[judger.JudgerConfig, judger.ExecArgs]
	logger     logger.Logger
	tracer     trace.Tracer
}

func (t *Task) GetDebugString() string {
	if t == nil {
		return "run.Task<nil>"
	}
	if t.req == nil {
		return "run.Task{req:nil}"
	}
	return fmt.Sprintf("run.Task{problemId:%d,language:%s,hidden:%t}", t.req.ProblemId, t.req.Language, t.hidden)
}

func (t *Task) GetBuildUnits() []*handler.BuildUnit {
	return t.buildUnits
}

func (t *Task) RunAction(ctx context.Context, sendResult func(handler.ResultMessage)) {
	validReq := t.req

	var tc testcase.Testcase
	if validReq.UserTestcases != nil {
		tc = testcase.Testcase{Elements: *validReq.UserTestcases}
	} else {
		res, err := t.tcManager.GetTestcase(strconv.Itoa(validReq.ProblemId), t.hidden)
		if err != nil {
			sendResult(handler.ResultMessage{Result: nil, Err: handler.NewHandlerError("handle", fmt.Errorf("%w: %s", handler.ErrTestcaseGet, err), logger.ERROR)})
			return
		}

		tc = res

		if validReq.JudgeOnlyHiddenTestcases {
			hiddenTestcases := make([]loader.ElementOut, 0)
			for _, testcase := range tc.Elements {
				if testcase.Hidden {
					hiddenTestcases = append(hiddenTestcases, testcase)
				}
			}
			tc = testcase.Testcase{Elements: hiddenTestcases}
		}
	}

	tcId, tcNum := 0, len(tc.Elements)
	for tcId = 0; tcId < tcNum; tcId++ {
		var judgeResult runTestcaseResult
		if tc.Elements[tcId].In != "" {
			judgeResult = t.runTestcase(ctx, tcId, validReq, tc.Elements[tcId])
		}

		sendResult(judgeResult.message)
		if validReq.StopOnNotAccepted && judgeResult.code != handler.ACCEPTED {
			break
		}
	}

	if tcId < tcNum {
		for idxToCancel := tcId + 1; idxToCancel < tcNum; idxToCancel++ {
			canceledResult := RunResult{
				TestcaseId: tc.Elements[idxToCancel].Id,
				ErrorCode:  int(handler.CANCELED),
				Error:      "Execution canceled due to previous test case failure",
			}

			marshaledRes, err := json.Marshal(canceledResult)
			if err != nil {
				sendResult(handler.ResultMessage{Result: nil, Err: handler.NewHandlerError("Task.sendCancelResult", handler.ErrMarshalJson, logger.ERROR)})
				return
			}
			sendResult(handler.ResultMessage{Result: marshaledRes, Err: handler.ParseError(canceledResult, handler.CANCELED)})
		}
	}
}

type runTestcaseResult struct {
	code    handler.ResultCode
	message handler.ResultMessage
}

func (t *Task) runTestcase(ctx context.Context, idx int, validReq *RunRequest,
	tc loader.ElementOut) runTestcaseResult {
	_, childSpan := t.tracer.Start(
		ctx,
		instrumentation.GetSemanticSpanName("run-handler", "runTestcase"),
		trace.WithAttributes(attribute.String("problemId", strconv.Itoa(validReq.ProblemId)), attribute.String("testcaseId", strconv.Itoa(tc.Id))),
	)
	defer childSpan.End()

	res := RunResult{}

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
	res.SetRunExecResult(runResult.ExecResult)
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
		return runTestcaseResult{
			code: judgeResultCode,
			message: handler.ResultMessage{
				Result: nil,
				Err:    handler.NewHandlerError("Task.judgeTestcase", handler.ErrMarshalJson, logger.ERROR),
			},
		}
	} else {
		return runTestcaseResult{
			code: judgeResultCode,
			message: handler.ResultMessage{
				Result: marshaledRes,
				Err:    handler.ParseError(res, judgeResultCode),
			},
		}
	}
}
