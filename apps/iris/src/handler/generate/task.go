package generate

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/skkuding/codedang/apps/iris/src/handler"
	"github.com/skkuding/codedang/apps/iris/src/service/logger"
	"github.com/skkuding/codedang/apps/iris/src/service/sandbox"
	"github.com/skkuding/codedang/apps/iris/src/service/sandbox/judger"
)

type Task struct {
	req        *GenerateRequest
	buildUnits []*handler.BuildUnit
	sandbox    sandbox.Sandbox[judger.JudgerConfig, judger.ExecArgs]
	logger     logger.Logger
}

func (t *Task) GetDebugString() string {
	if t == nil {
		return "generate.Task<nil>"
	}

	reqDump := "nil"
	if t.req != nil {
		if data, err := json.Marshal(t.req); err == nil {
			reqDump = string(data)
		} else {
			reqDump = fmt.Sprintf("%+v", *t.req)
		}
	}

	return fmt.Sprintf("generate.Task{req:%s}", reqDump)
}

func (t *Task) GetBuildUnits() []*handler.BuildUnit {
	return t.buildUnits
}

func (t *Task) RunAction(ctx context.Context, sendResult func(handler.ResultMessage)) {
	validReq := t.req
	var generatorUnit *handler.BuildUnit
	var solutionUnit *handler.BuildUnit
	
	for _, u := range t.buildUnits {
		if u.Name == "generator" {
			generatorUnit = u
		} else if u.Name == "solution" {
			solutionUnit = u
		}
	}

	if generatorUnit == nil || generatorUnit.Dir == "" {
		sendResult(handler.ResultMessage{Result: nil, Err: handler.NewHandlerError("GenerateTask.RunAction", fmt.Errorf("generator build unit not found"), logger.ERROR)})
		return
	}

	hasSolutionUnit := solutionUnit != nil
	successCount := 0

	for i := 0; i < validReq.TestcaseCount; i++ {
		// TimeLimit/MemoryLimit는 요청에 없으므로 기본값(예: 2000ms, 512MB) 지정
		// run to make input
		runResult, err := generatorUnit.Run(t.sandbox, sandbox.RunRequest{
			Order:       i,
			TimeLimit:   2000,
			MemoryLimit: 512 * 1024 * 1024,
			ExtraArgs:   validReq.GeneratorArgs,
		}, []byte{})

		if err != nil {
			t.logger.Log(logger.ERROR, fmt.Sprintf("Error while generating testcase: %s", err.Error()))
			sendResult(handler.ResultMessage{Result: nil, Err: handler.NewHandlerError("GenerateTask.RunAction", err, logger.ERROR)})
			return
		}

		// todo: run answer code to make output, and compare with expected output if needed
		// save runResult.Output

		if runResult.ExecResult.StatusCode != sandbox.RUN_SUCCESS {
			t.logger.Log(logger.ERROR, fmt.Sprintf("Generator execution failed at testcase %d, status: %v, error: %s", i, runResult.ExecResult.StatusCode, string(runResult.ErrOutput)))
			sendResult(handler.ResultMessage{Result: nil, Err: handler.NewHandlerError("GenerateTask.RunAction", handler.ErrSandbox, logger.ERROR)})
			return
		}

		if validReq.SolutionCode != "" {
			if !hasSolutionUnit || solutionUnit.Dir == "" {
				sendResult(handler.ResultMessage{Result: nil, Err: handler.NewHandlerError("GenerateTask.RunAction", fmt.Errorf("solution build unit not found"), logger.ERROR)})
				return
			}

			solutionRunResult, solutionErr := solutionUnit.Run(t.sandbox, sandbox.RunRequest{
				Order:       i,
				TimeLimit:   2000,
				MemoryLimit: 512 * 1024 * 1024,
				ExtraArgs:   validReq.SolutionArgs,
			}, runResult.Output)
			if solutionErr != nil {
				t.logger.Log(logger.ERROR, fmt.Sprintf("Error while generating expected output: %s", solutionErr.Error()))
				sendResult(handler.ResultMessage{Result: nil, Err: handler.NewHandlerError("GenerateTask.RunAction", solutionErr, logger.ERROR)})
				return
			}
			if solutionRunResult.ExecResult.StatusCode != sandbox.RUN_SUCCESS {
				t.logger.Log(logger.ERROR, fmt.Sprintf("Solution execution failed at testcase %d, status: %v, error: %s", i, solutionRunResult.ExecResult.StatusCode, string(solutionRunResult.ErrOutput)))
				sendResult(handler.ResultMessage{Result: nil, Err: handler.NewHandlerError("GenerateTask.RunAction", handler.ErrSandbox, logger.ERROR)})
				return
			}
		}

		// TODO: write runResult.Output to somewhere if needed (S3, etc)
		successCount++
	}

	res := GenerateResult{
		GeneratedTestcases: successCount,
	}
	marshaledRes, err := json.Marshal(res)
	if err != nil {
		sendResult(handler.ResultMessage{Result: nil, Err: handler.NewHandlerError("GenerateTask.RunAction", handler.ErrMarshalJson, logger.ERROR)})
	} else {
		sendResult(handler.ResultMessage{Result: marshaledRes, Err: nil})
	}
}
