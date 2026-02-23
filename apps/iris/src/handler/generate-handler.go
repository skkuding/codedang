package handler

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/skkuding/codedang/apps/iris/src/service/logger"
	"go.opentelemetry.io/otel/trace"
)

type GenerateRequest struct {
	ProblemId     int      `json:"problemId"`
	Language      string   `json:"language"`
	GeneratorCode string   `json:"generatorCode"`
	GeneratorArgs []string `json:"generatorArgs"`
	TestcaseCount int      `json:"testcaseCount"`
}

type GenerateResult struct {
	GeneratedTestcases int `json:"generatedTestcases"`
}

type GenerateHandler[C any, E any] struct {
	logger logger.Logger
	tracer trace.Tracer
}

func NewGenerateHandler[C any, E any](
	logger logger.Logger,
	tracer trace.Tracer,
) *GenerateHandler[C, E] {
	return &GenerateHandler[C, E]{
		logger: logger,
		tracer: tracer,
	}
}

func (h *GenerateHandler[C, E]) Handle(id string, data []byte, out chan JudgeResultMessage, ctx context.Context) {
	// 1. Unmarshal Request
	req := GenerateRequest{}
	err := json.Unmarshal(data, &req)
	if err != nil {
		out <- JudgeResultMessage{nil, &HandlerError{
			caller:  "handle-generate",
			err:     fmt.Errorf("%w: %s", ErrValidate, err),
			level:   logger.ERROR,
			Message: err.Error(),
		}}
		close(out)
		return
	}

	// 2. [TODO] Validate Request
	// 3. [TODO] Create Sandbox/File environment for Generation
	// 4. [TODO] Compile generatorCode (e.g. example_generator.cc)
	// 5. [TODO] Run generator iteratively for TestcaseCount with GeneratorArgs
	// 6. [TODO] Marshal GenerateResult and send to out channel

	// Dummy response for skeleton
	res := GenerateResult{
		GeneratedTestcases: req.TestcaseCount,
	}
	marshaledRes, err := json.Marshal(res)
	if err != nil {
		out <- JudgeResultMessage{nil, &HandlerError{err: ErrMarshalJson, level: logger.ERROR}}
	} else {
		out <- JudgeResultMessage{marshaledRes, nil}
	}
	close(out)
}
