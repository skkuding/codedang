package check

import (
	"fmt"

	"github.com/skkuding/codedang/apps/iris/src/service/sandbox"
)

type CheckRequest struct {
	ProblemId        int    `json:"problemId"`
	Language         string `json:"language"`
	CheckerCode      string `json:"checkerCode"`
	SolutionLanguage string `json:"solutionLanguage,omitempty"`
	SolutionCode     string `json:"solutionCode,omitempty"`
}

func (r CheckRequest) Validate() (*CheckRequest, error) {
	if r.ProblemId == 0 {
		return nil, fmt.Errorf("problemId must not be empty or zero")
	}
	if r.Language == "" {
		return nil, fmt.Errorf("language must not be empty")
	}
	if !sandbox.Language(r.Language).IsValid() {
		return nil, fmt.Errorf("unsupported language: %s", r.Language)
	}
	if r.CheckerCode == "" {
		return nil, fmt.Errorf("checkerCode must not be empty")
	}
	if r.SolutionLanguage != "" && !sandbox.Language(r.SolutionLanguage).IsValid() {
		return nil, fmt.Errorf("unsupported solutionLanguage: %s", r.SolutionLanguage)
	}
	return &r, nil
}

type CheckTestcaseToolResult struct {
	TestcaseId int    `json:"testcaseId"`
	Verdict    string `json:"verdict"` // "ok" | "wrong_answer" | "presentation_error" | "fail"
	Message    string `json:"message,omitempty"`
	CpuTime    int    `json:"cpuTime,omitempty"`
	Memory     int    `json:"memory,omitempty"`
}

type CheckToolResult struct {
	IsAllCorrect  bool                      `json:"isAllCorrect"`
	TestcaseCount int                       `json:"testcaseCount"`
	Results       []CheckTestcaseToolResult `json:"results"`
}
