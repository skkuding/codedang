package validate

import (
	"encoding/json"
	"fmt"

	"github.com/skkuding/codedang/apps/iris/src/handler"
	"github.com/skkuding/codedang/apps/iris/src/service/logger"
	"github.com/skkuding/codedang/apps/iris/src/service/sandbox"
	"github.com/skkuding/codedang/apps/iris/src/service/sandbox/judger"
	"github.com/skkuding/codedang/apps/iris/src/service/testcase"
)

type Factory struct {
	tcManager testcase.TestcaseManager
	sandbox   sandbox.Sandbox[judger.JudgerConfig, judger.ExecArgs]
	logger    logger.Logger
}

func NewFactory(tcManager testcase.TestcaseManager, sandbox sandbox.Sandbox[judger.JudgerConfig, judger.ExecArgs], logger logger.Logger) *Factory {
	return &Factory{
		tcManager: tcManager,
		sandbox:   sandbox,
		logger:    logger,
	}
}

func (f *Factory) Create(taskType string, data []byte) (handler.Task, error) {
	req := ValidateRequest{}
	err := json.Unmarshal(data, &req)
	if err != nil {
		return nil, handler.NewHandlerError("handle-validate", fmt.Errorf("%w: %s", handler.ErrValidate, err), logger.ERROR)
	}

	validReq, err := req.Validate()
	if err != nil {
		return nil, handler.NewHandlerError("handle-validate", fmt.Errorf("%w: %s", handler.ErrValidate, err), logger.ERROR)
	}

	task := &Task{
		req:       validReq,
		tcManager: f.tcManager,
		sandbox:   f.sandbox,
		logger:    f.logger,
	}

	return task, nil
}
