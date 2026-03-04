package run

import (
	"encoding/json"
	"fmt"

	"github.com/skkuding/codedang/apps/iris/src/handler"
	"github.com/skkuding/codedang/apps/iris/src/service/logger"
	"github.com/skkuding/codedang/apps/iris/src/service/sandbox"
	"github.com/skkuding/codedang/apps/iris/src/service/sandbox/judger"
	"github.com/skkuding/codedang/apps/iris/src/service/testcase"
	"go.opentelemetry.io/otel/trace"
)

type Factory struct {
	tcManager testcase.TestcaseManager
	sandbox   sandbox.Sandbox[judger.JudgerConfig, judger.ExecArgs]
	logger    logger.Logger
	tracer    trace.Tracer
}

func NewFactory(tcManager testcase.TestcaseManager, sandbox sandbox.Sandbox[judger.JudgerConfig, judger.ExecArgs], logger logger.Logger, tracer trace.Tracer) *Factory {
	return &Factory{
		tcManager: tcManager,
		sandbox:   sandbox,
		logger:    logger,
		tracer:    tracer,
	}
}

func (f *Factory) Create(taskType string, data []byte) (handler.Task, error) {
	req := RunRequest{}

	err := json.Unmarshal(data, &req)
	if err != nil {
		return nil, handler.NewHandlerError("handle", fmt.Errorf("%w: %s", handler.ErrValidate, err), logger.ERROR)
	}
	validReq, err := req.Validate()
	if err != nil {
		return nil, handler.NewHandlerError("request validate", fmt.Errorf("%w: %s", handler.ErrValidate, err), logger.ERROR)
	}

	hidden := false
	if taskType == "run" {
		hidden = validReq.ContainHiddenTestcases
	} else if taskType == "user_test_case" {
		hidden = false
	}

	task := &Task{
		factory:   f,
		req:       validReq,
		hidden:    hidden,
		tcManager: f.tcManager,
		sandbox:   f.sandbox,
		logger:    f.logger,
		tracer:    f.tracer,
	}

	return task, nil
}
