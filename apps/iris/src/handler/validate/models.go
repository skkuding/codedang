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

type ValidateTestcaseToolResult struct {
	TestcaseId int    `json:"testcaseId"`
	IsValid    bool   `json:"isValid"`
	Message    string `json:"message,omitempty"` // testlib validation message
	Stderr     string `json:"stderr,omitempty"`  // raw stderr from validator
}

type ValidateToolResult struct {
	IsAllValid    bool                         `json:"isAllValid"`
	TestcaseCount int                          `json:"testcaseCount"`
	Results       []ValidateTestcaseToolResult `json:"results"`
}
