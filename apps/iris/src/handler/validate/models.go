package validate

import (
	"fmt"

	"github.com/skkuding/codedang/apps/iris/src/service/sandbox"
)

type ValidateRequest struct {
	ProblemId     int    `json:"problemId"`
	Language      string `json:"language"`
	ValidatorCode string `json:"validatorCode"`
}

func (r ValidateRequest) Validate() (*ValidateRequest, error) {
	if r.ProblemId == 0 {
		return nil, fmt.Errorf("problemId must not be empty or zero")
	}
	if r.Language == "" {
		return nil, fmt.Errorf("language must not be empty")
	}
	if !sandbox.Language(r.Language).IsValid() {
		return nil, fmt.Errorf("unsupported language: %s", r.Language)
	}
	if r.ValidatorCode == "" {
		return nil, fmt.Errorf("validatorCode must not be empty")
	}
	return &r, nil
}

type ValidateTestcaseResult struct {
	Id      int  `json:"id"`
	IsValid bool `json:"isValid"`
}

type ValidateResult struct {
	IsValid       bool                     `json:"isValid"`
	TestcaseCount int                      `json:"testcaseCount"`
	Results       []ValidateTestcaseResult `json:"results"`
}
