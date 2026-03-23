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
	switch taskType {
	case "run":
		hidden = validReq.ContainHiddenTestcases
	case "userTestCase":
		hidden = false
	default:
		return nil, handler.NewHandlerError("run.Factory.Create", fmt.Errorf("unknown taskType: %s", taskType), logger.ERROR)
	}

	buildUnits := []*handler.BuildUnit{
		{
			Name:     "default",
			Code:     validReq.Code,
			Language: validReq.Language,
		},
	}

	task := &Task{
		req:        validReq,
		hidden:     hidden,
		buildUnits: buildUnits,
		tcManager:  f.tcManager,
		sandbox:    f.sandbox,
		logger:     f.logger,
		tracer:     f.tracer,
	}

	return task, nil
}
