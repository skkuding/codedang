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
	factory *Factory
	req     *GenerateRequest
	sandbox sandbox.Sandbox[judger.JudgerConfig, judger.ExecArgs]
	logger  logger.Logger
}

func (t *Task) GetCode() string {
	return t.req.GeneratorCode
}

func (t *Task) GetLanguage() string {
	return t.req.Language
}

func (t *Task) RunAction(ctx context.Context, dir string, out chan<- handler.ResultMessage) {
	validReq := t.req
	successCount := 0

	for i := 0; i < validReq.TestcaseCount; i++ {
		// TimeLimit/MemoryLimit는 요청에 없으므로 기본값(예: 2000ms, 512MB) 지정
		runResult, err := t.sandbox.Run(sandbox.RunRequest{
			Order:       0,
			Dir:         dir,
			Language:    sandbox.Language(validReq.Language),
			TimeLimit:   2000,
			MemoryLimit: 512 * 1024 * 1024,
			ExtraArgs:   validReq.GeneratorArgs,
		}, []byte{})

		if err != nil {
			t.logger.Log(logger.ERROR, fmt.Sprintf("Error while generating testcase: %s", err.Error()))
			out <- handler.ResultMessage{Result: nil, Err: handler.NewHandlerError("GenerateTask.RunAction", err, logger.ERROR)}
			return
		}

		if runResult.ExecResult.StatusCode != sandbox.RUN_SUCCESS {
			t.logger.Log(logger.ERROR, fmt.Sprintf("Generator execution failed at testcase %d, status: %v, error: %s", i, runResult.ExecResult.StatusCode, string(runResult.ErrOutput)))
			out <- handler.ResultMessage{Result: nil, Err: handler.NewHandlerError("GenerateTask.RunAction", handler.ErrSandbox, logger.ERROR)}
			return
		}

		// TODO: write runResult.Output to somewhere if needed (S3, etc)
		successCount++
	}

	res := GenerateResult{
		GeneratedTestcases: successCount,
	}
	marshaledRes, err := json.Marshal(res)
	if err != nil {
		out <- handler.ResultMessage{Result: nil, Err: handler.NewHandlerError("GenerateTask.RunAction", handler.ErrMarshalJson, logger.ERROR)}
	} else {
		out <- handler.ResultMessage{Result: marshaledRes, Err: nil}
	}
}
