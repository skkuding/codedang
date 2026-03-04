package generate

import (
	"fmt"
)

type GenerateRequest struct {
	ProblemId     int      `json:"problemId"`
	Language      string   `json:"language"`
	GeneratorCode string   `json:"generatorCode"`
	GeneratorArgs []string `json:"generatorArgs"`
	TestcaseCount int      `json:"testcaseCount"`
}

func (r GenerateRequest) Validate() (*GenerateRequest, error) {
	if r.ProblemId == 0 {
		return nil, fmt.Errorf("problemId must not be empty or zero")
	}
	if r.Language == "" {
		return nil, fmt.Errorf("language must not be empty")
	}
	if r.GeneratorCode == "" {
		return nil, fmt.Errorf("generatorCode must not be empty")
	}
	if r.TestcaseCount <= 0 {
		return nil, fmt.Errorf("testcaseCount must be greater than 0")
	}
	return &r, nil
}

type GenerateResult struct {
	GeneratedTestcases int `json:"generatedTestcases"`
}
