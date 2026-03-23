package generate

import (
	"fmt"

	"github.com/skkuding/codedang/apps/iris/src/service/sandbox"
)

type GenerateRequest struct {
	ProblemId         int      `json:"problemId"`
	GeneratorLanguage string   `json:"generatorLanguage"`
	GeneratorCode     string   `json:"generatorCode"`
	GeneratorArgs     []string `json:"generatorArgs"`
	SolutionLanguage  string   `json:"solutionLanguage,omitempty"`
	SolutionCode      string   `json:"solutionCode,omitempty"`
	TestcaseCount     int      `json:"testcaseCount"`
}

const maxTestcaseCount = 100
const maxExtraArgs = 20
const maxArgLength = 256

func (r GenerateRequest) Validate() (*GenerateRequest, error) {
	if r.ProblemId == 0 {
		return nil, fmt.Errorf("problemId must not be empty or zero")
	}
	if r.GeneratorLanguage == "" {
		return nil, fmt.Errorf("generatorLanguage must not be empty")
	}
	if !sandbox.Language(r.GeneratorLanguage).IsValid() {
		return nil, fmt.Errorf("unsupported generatorLanguage: %s", r.GeneratorLanguage)
	}
	if r.GeneratorCode == "" {
		return nil, fmt.Errorf("generatorCode must not be empty")
	}
	if r.TestcaseCount <= 0 {
		return nil, fmt.Errorf("testcaseCount must be greater than 0")
	}
	if r.TestcaseCount > maxTestcaseCount {
		return nil, fmt.Errorf("testcaseCount must not exceed %d", maxTestcaseCount)
	}
	if len(r.GeneratorArgs) > maxExtraArgs {
		return nil, fmt.Errorf("generatorArgs must not exceed %d elements", maxExtraArgs)
	}
	for _, arg := range r.GeneratorArgs {
		if len(arg) > maxArgLength {
			return nil, fmt.Errorf("generatorArgs element exceeds %d bytes", maxArgLength)
		}
	}
	if (r.SolutionCode == "") != (r.SolutionLanguage == "") {
		return nil, fmt.Errorf("solutionCode and solutionLanguage must be provided together")
	}
	if r.SolutionLanguage != "" && !sandbox.Language(r.SolutionLanguage).IsValid() {
		return nil, fmt.Errorf("unsupported solutionLanguage: %s", r.SolutionLanguage)
	}
	return &r, nil
}

type GenerateResult struct {
	GeneratedTestcases int `json:"generatedTestcases"`
	TotalTestcases     int `json:"totalTestcases"`
}
