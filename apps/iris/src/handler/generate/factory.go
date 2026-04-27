package generate

import (
	"encoding/json"
	"fmt"

	"github.com/skkuding/codedang/apps/iris/src/handler"
	"github.com/skkuding/codedang/apps/iris/src/service/build"
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
	req := GenerateRequest{}
	err := json.Unmarshal(data, &req)
	if err != nil {
		return nil, handler.NewTaskError("generate", handler.SERVER_ERROR, logger.ERROR, fmt.Errorf("unmarshal failed: %w", err))
	}

	validReq, err := req.Validate()
	if err != nil {
		return nil, handler.NewTaskError("generate", handler.SERVER_ERROR, logger.ERROR, fmt.Errorf("validation failed: %w", err))
	}

	buildUnits := []*build.BuildUnit{
		{
			Name:     "generator",
			Code:     validReq.GeneratorCode,
			Language: validReq.GeneratorLanguage,
		},
	}
	if validReq.SolutionCode != "" {
		buildUnits = append(buildUnits, &build.BuildUnit{
			Name:     "solution",
			Code:     validReq.SolutionCode,
			Language: validReq.SolutionLanguage,
		})
	}

	task := &Task{
		req:        validReq,
		buildUnits: buildUnits,
		tcManager:  f.tcManager,
		sandbox:    f.sandbox,
		logger:     f.logger,
	}

	return task, nil
}
