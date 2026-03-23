package generate

import (
	"context"
	"encoding/json"
	"fmt"
	"strconv"

	"github.com/skkuding/codedang/apps/iris/src/handler"
	"github.com/skkuding/codedang/apps/iris/src/loader"
	"github.com/skkuding/codedang/apps/iris/src/service/logger"
	"github.com/skkuding/codedang/apps/iris/src/service/sandbox"
	"github.com/skkuding/codedang/apps/iris/src/service/sandbox/judger"
	"github.com/skkuding/codedang/apps/iris/src/service/testcase"
)

type Task struct {
	req        *GenerateRequest
	buildUnits []*handler.BuildUnit
	tcManager  testcase.TestcaseManager
	sandbox    sandbox.Sandbox[judger.JudgerConfig, judger.ExecArgs]
	logger     logger.Logger
}

func (t *Task) GetDebugString() string {
	if t == nil {
		return "generate.Task<nil>"
	}
	if t.req == nil {
		return "generate.Task{req:nil}"
	}
	return fmt.Sprintf(
		"generate.Task{problemId:%d,language:%s,testcaseCount:%d}",
		t.req.ProblemId,
		t.req.GeneratorLanguage,
		t.req.TestcaseCount,
	)
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
		sendResult(handler.ResultMessage{
			Result: nil,
			Err: handler.NewHandlerError(
				"GenerateTask.RunAction",
				fmt.Errorf("generator build unit not found"),
				logger.ERROR,
			),
		})
		return
	}

	hasSolutionUnit := solutionUnit != nil
	successCount := 0
	var pairs []loader.ElementIn

	for i := 0; i < validReq.TestcaseCount; i++ {
		select {
		case <-ctx.Done():
			t.logger.Log(
				logger.WARN,
				fmt.Sprintf(
					"Generate loop cancelled after %d/%d testcases for problemId %d",
					i,
					validReq.TestcaseCount,
					validReq.ProblemId,
				),
			)
			goto save
		default:
		}
		// TimeLimit/MemoryLimit defaults: 2000ms, 512MB
		// run to make input
		runResult, err := generatorUnit.Run(t.sandbox, sandbox.RunRequest{
			Order:       i,
			TimeLimit:   2000,
			MemoryLimit: 512 * 1024 * 1024,
			ExtraArgs:   validReq.GeneratorArgs,
		}, []byte{})

		if err != nil {
			t.logger.Log(logger.ERROR, fmt.Sprintf("Error while generating testcase: %s", err.Error()))
			sendResult(handler.ResultMessage{
				Result: nil,
				Err:    handler.NewHandlerError("GenerateTask.RunAction", err, logger.ERROR),
			})
			return
		}

		// todo: run answer code to make output, and compare with expected output if needed
		// save runResult.Output

		if runResult.ExecResult.StatusCode != sandbox.RUN_SUCCESS {
			t.logger.Log(
				logger.ERROR,
				fmt.Sprintf(
					"Generator execution failed at testcase %d, status: %v, error: %s",
					i,
					runResult.ExecResult.StatusCode,
					string(runResult.ErrOutput),
				),
			)
			sendResult(handler.ResultMessage{
				Result: nil,
				Err:    handler.NewHandlerError("GenerateTask.RunAction", handler.ErrSandbox, logger.ERROR),
			})
			return
		}

		out := []byte{}
		if validReq.SolutionCode != "" {
			if !hasSolutionUnit || solutionUnit.Dir == "" {
				sendResult(handler.ResultMessage{
					Result: nil,
					Err: handler.NewHandlerError(
						"GenerateTask.RunAction",
						fmt.Errorf("solution build unit not found"),
						logger.ERROR,
					),
				})
				return
			}

			solutionRunResult, solutionErr := solutionUnit.Run(t.sandbox, sandbox.RunRequest{
				Order:       i,
				TimeLimit:   2000,
				MemoryLimit: 512 * 1024 * 1024,
				ExtraArgs:   []string{},
			}, runResult.Output)
			if solutionErr != nil {
				t.logger.Log(logger.ERROR, fmt.Sprintf("Error while generating expected output: %s", solutionErr.Error()))
				sendResult(handler.ResultMessage{
					Result: nil,
					Err:    handler.NewHandlerError("GenerateTask.RunAction", solutionErr, logger.ERROR),
				})
				return
			}
			if solutionRunResult.ExecResult.StatusCode != sandbox.RUN_SUCCESS {
				t.logger.Log(
					logger.ERROR,
					fmt.Sprintf(
						"Solution execution failed at testcase %d, status: %v, error: %s",
						i,
						solutionRunResult.ExecResult.StatusCode,
						string(solutionRunResult.ErrOutput),
					),
				)
				sendResult(handler.ResultMessage{
					Result: nil,
					Err:    handler.NewHandlerError("GenerateTask.RunAction", handler.ErrSandbox, logger.ERROR),
				})
				return
			}
			out = solutionRunResult.Output
		}
		pairs = append(pairs, loader.ElementIn{
			Id:     i + 1,
			In:     string(runResult.Output),
			Out:    string(out),
			Hidden: false,
		})
	}

save:
	for _, pair := range pairs {
		if err := t.tcManager.SaveTestcase(
			strconv.Itoa(validReq.ProblemId),
			false,
			[]loader.ElementIn{pair},
		); err != nil {
			t.logger.Log(logger.ERROR, fmt.Sprintf("Failed to save testcase %d: %s", pair.Id, err.Error()))
			continue
		}
		successCount++
	}
	if successCount < len(pairs) {
		t.logger.Log(
			logger.WARN,
			fmt.Sprintf(
				"Partial save: %d/%d testcases persisted for problemId %d",
				successCount,
				len(pairs),
				validReq.ProblemId,
			),
		)
	}

	res := GenerateResult{
		GeneratedTestcases: successCount,
		TotalTestcases:     len(pairs),
	}
	marshaledRes, err := json.Marshal(res)
	if err != nil {
		sendResult(handler.ResultMessage{
			Result: nil,
			Err:    handler.NewHandlerError("GenerateTask.RunAction", handler.ErrMarshalJson, logger.ERROR),
		})
	} else {
		sendResult(handler.ResultMessage{Result: marshaledRes, Err: nil})
	}
}
