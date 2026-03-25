package run

import (
	"encoding/json"
	"fmt"

	"github.com/skkuding/codedang/apps/iris/src/handler"
	"github.com/skkuding/codedang/apps/iris/src/service/build"
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
		return nil, handler.NewTaskError("run", handler.SERVER_ERROR, logger.ERROR, fmt.Errorf("unmarshal failed: %w", err))
	}
	validReq, err := req.Validate()
	if err != nil {
		return nil, handler.NewTaskError("run", handler.SERVER_ERROR, logger.ERROR, fmt.Errorf("validation failed: %w", err))
	}

	hidden := false
	switch taskType {
	case "run":
		hidden = validReq.ContainHiddenTestcases
	case "userTestCase":
		hidden = false
	default:
		return nil, handler.NewTaskError("run", handler.SERVER_ERROR, logger.ERROR, fmt.Errorf("unknown taskType: %s", taskType))
	}

	buildUnits := []*build.BuildUnit{
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
