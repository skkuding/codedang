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
	factory   *Factory
	req       *JudgeRequest
	hidden    bool
	tcManager testcase.TestcaseManager
	sandbox   sandbox.Sandbox[judger.JudgerConfig, judger.ExecArgs]
	logger    logger.Logger
	tracer    trace.Tracer
}

func (t *Task) GetCode() string {
	return t.req.Code
}

func (t *Task) GetLanguage() string {
	return t.req.Language
}

func (t *Task) RunAction(ctx context.Context, dir string, out chan<- handler.ResultMessage) {
	validReq := t.req

	var tc testcase.Testcase

	if validReq.UserTestcases != nil {
		tc = testcase.Testcase{Elements: *validReq.UserTestcases}
	} else {
		res, err := t.tcManager.GetTestcase(strconv.Itoa(validReq.ProblemId), t.hidden)
		if err != nil {
			out <- handler.ResultMessage{Result: nil, Err: handler.NewHandlerError("handle", fmt.Errorf("%w: %s", handler.ErrTestcaseGet, err), logger.ERROR)}
			return
		}

		tc = res

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

	tcNum := len(tc.Elements)
	for i, tElement := range tc.Elements {
		var judgeResultCode handler.ResultCode
		if tElement.In != "" {
			judgeResultCode = t.judgeTestcase(ctx, i, dir, validReq, tElement, out)
		}

		if validReq.StopOnNotAccepted && judgeResultCode != handler.ACCEPTED {
			for idxToCancel := i + 1; idxToCancel < tcNum; idxToCancel++ {
				t.sendCancelResult(tc.Elements[idxToCancel], out)
			}
			break
		}
	}
}

func (t *Task) judgeTestcase(ctx context.Context, idx int, dir string, validReq *JudgeRequest,
	tc loader.Element, out chan<- handler.ResultMessage) handler.ResultCode {
	_, childSpan := t.tracer.Start(
		ctx,
		instrumentation.GetSemanticSpanName("judge-handler", "judgeTestcase"),
		trace.WithAttributes(attribute.String("problemId", strconv.Itoa(validReq.ProblemId)), attribute.String("testcaseId", strconv.Itoa(tc.Id))),
	)
	defer childSpan.End()

	res := JudgeResult{}

	runResult, err := t.sandbox.Run(sandbox.RunRequest{
		Order:       idx,
		Dir:         dir,
		Language:    sandbox.Language(validReq.Language),
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
		out <- handler.ResultMessage{Result: nil, Err: handler.NewHandlerError("Task.judgeTestcase", handler.ErrMarshalJson, logger.ERROR)}
	} else {
		out <- handler.ResultMessage{Result: marshaledRes, Err: handler.ParseError(res, judgeResultCode)}
	}
	return judgeResultCode
}

func (t *Task) sendCancelResult(element loader.Element, out chan<- handler.ResultMessage) {
	canceledResult := JudgeResult{
		TestcaseId: element.Id,
		ErrorCode:  int(handler.CANCELED),
		Error:      "Execution canceled due to previous test case failure",
	}

	marshaledRes, err := json.Marshal(canceledResult)
	if err != nil {
		out <- handler.ResultMessage{Result: nil, Err: handler.NewHandlerError("Task.sendCancelResult", handler.ErrMarshalJson, logger.ERROR)}
		return
	}
	out <- handler.ResultMessage{Result: marshaledRes, Err: handler.ParseError(canceledResult, handler.CANCELED)}
}
