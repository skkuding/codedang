package validate

import (
	"context"
	"encoding/json"
	"fmt"

	"strconv"

	"github.com/skkuding/codedang/apps/iris/src/handler"
	"github.com/skkuding/codedang/apps/iris/src/service/logger"
	"github.com/skkuding/codedang/apps/iris/src/service/sandbox"
	"github.com/skkuding/codedang/apps/iris/src/service/sandbox/judger"
	"github.com/skkuding/codedang/apps/iris/src/service/testcase"
)

type Task struct {
	req        *ValidateRequest
	buildUnits []*handler.BuildUnit
	tcManager  testcase.TestcaseManager
	sandbox    sandbox.Sandbox[judger.JudgerConfig, judger.ExecArgs]
	logger     logger.Logger
}

func (t *Task) GetDebugString() string {
	if t == nil {
		return "validate.Task<nil>"
	}

	reqDump := "nil"
	if t.req != nil {
		if data, err := json.Marshal(t.req); err == nil {
			reqDump = string(data)
		} else {
			reqDump = fmt.Sprintf("%+v", *t.req)
		}
	}

	return fmt.Sprintf("validate.Task{req:%s}", reqDump)
}

func (t *Task) GetBuildUnits() []*handler.BuildUnit {
	return t.buildUnits
}

func (t *Task) RunAction(ctx context.Context, sendResult func(handler.ResultMessage)) {
	validReq := t.req
	var validatorUnit *handler.BuildUnit
	for _, u := range t.buildUnits {
		if u.Name == "validator" {
			validatorUnit = u
			break
		}
	}

	if validatorUnit == nil || validatorUnit.Dir == "" {
		sendResult(handler.ResultMessage{Result: nil, Err: handler.NewHandlerError("ValidateTask.RunAction", fmt.Errorf("validator build unit not found"), logger.ERROR)})
		return
	}

	tc, err := t.tcManager.GetTestcase(strconv.Itoa(validReq.ProblemId), false)
	if err != nil {
		sendResult(handler.ResultMessage{Result: nil, Err: handler.NewHandlerError("ValidateTask.RunAction", err, logger.ERROR)})
		return
	}

	isValid := true
	allValid := true

	for i, tElement := range tc.Elements {
		runResult, err := validatorUnit.Run(t.sandbox, sandbox.RunRequest{
			Order:       i,
			TimeLimit:   2000,
			MemoryLimit: 512 * 1024 * 1024,
			ExtraArgs:   []string{}, // validator code takes implicitly from stdin
		}, []byte(tElement.Out))

		errorMsg := ""

		if err != nil {
			t.logger.Log(logger.ERROR, fmt.Sprintf("Error while validating testcase: %s", err.Error()))
			sendResult(handler.ResultMessage{Result: nil, Err: handler.NewHandlerError("ValidateTask.RunAction", err, logger.ERROR)})
			return
		}

		if runResult.ExecResult.StatusCode != sandbox.RUN_SUCCESS {
			t.logger.Log(logger.ERROR, fmt.Sprintf("Validator execution failed at testcase %d", i))
			sendResult(handler.ResultMessage{Result: nil, Err: handler.NewHandlerError("ValidateTask.RunAction", handler.ErrSandbox, logger.ERROR)})
			return
		}

		if !isValid {
			allValid = false
			t.logger.Log(logger.INFO, fmt.Sprintf("Validation failed at testcase %d: %s", i, errorMsg))
			break
		}
	}

	res := ValidateResult{
		IsValid: allValid,
	}
	marshaledRes, err := json.Marshal(res)
	if err != nil {
		sendResult(handler.ResultMessage{Result: nil, Err: handler.NewHandlerError("ValidateTask.RunAction", handler.ErrMarshalJson, logger.ERROR)})
	} else {
		sendResult(handler.ResultMessage{Result: marshaledRes, Err: nil})
	}
}
