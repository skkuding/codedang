package handler

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/skkuding/codedang/apps/iris/src/service/logger"
	"go.opentelemetry.io/otel/trace"
)

type ValidateRequest struct {
	ProblemId     int    `json:"problemId"`
	Language      string `json:"language"`
	ValidatorCode string `json:"validatorCode"`
}

type ValidateResult struct {
	IsValid       bool                   `json:"isValid"`
	TestcaseCount int                    `json:"testcaseCount"`
	Results       []ValidateResultDetail `json:"results"`
}

type ValidateResultDetail struct {
	Id      int    `json:"id"`
	IsValid bool   `json:"isValid"`
	Error   string `json:"error,omitempty"`
}

type ValidateHandler[C any, E any] struct {
	logger logger.Logger
	tracer trace.Tracer
}

func NewValidateHandler[C any, E any](
	logger logger.Logger,
	tracer trace.Tracer,
) *ValidateHandler[C, E] {
	return &ValidateHandler[C, E]{
		logger: logger,
		tracer: tracer,
	}
}

func (h *ValidateHandler[C, E]) Handle(id string, data []byte, out chan JudgeResultMessage, ctx context.Context) {
	// 1. Unmarshal Request
	req := ValidateRequest{}
	err := json.Unmarshal(data, &req)
	if err != nil {
		out <- JudgeResultMessage{nil, &HandlerError{
			caller:  "handle-validate",
			err:     fmt.Errorf("%w: %s", ErrValidate, err),
			level:   logger.ERROR,
			Message: err.Error(),
		}}
		close(out)
		return
	}

	// 2. [TODO] Validate Request
	// 3. [TODO] Create Sandbox/File environment for Validation
	// 4. [TODO] Compile validatorCode (e.g. example_validator.cc)
	// 5. [TODO] Iterate through Testcases and run validator

	// Dummy response for skeleton
	details := make([]ValidateResultDetail, 0) // No testcases input anymore in request

	res := ValidateResult{
		IsValid:       true,
		TestcaseCount: 0,
		Results:       details,
	}

	marshaledRes, err := json.Marshal(res)
	if err != nil {
		out <- JudgeResultMessage{nil, &HandlerError{err: ErrMarshalJson, level: logger.ERROR}}
	} else {
		out <- JudgeResultMessage{marshaledRes, nil}
	}
	close(out)
}
