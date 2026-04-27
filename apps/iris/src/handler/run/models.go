package run

import (
	"fmt"

	"github.com/skkuding/codedang/apps/iris/src/loader"
	"github.com/skkuding/codedang/apps/iris/src/service/sandbox"
)

type RunRequest struct {
	Code                     string               `json:"code"`
	Language                 string               `json:"language"`
	ProblemId                int                  `json:"problemId"`
	TimeLimit                int                  `json:"timeLimit"`
	MemoryLimit              int                  `json:"memoryLimit"`
	UserTestcases            *[]loader.ElementOut `json:"userTestcases,omitempty"`            // user-provided testcases
	StopOnNotAccepted        bool                 `json:"stopOnNotAccepted,omitempty"`        // stop executing further testcases on first non-accepted result
	JudgeOnlyHiddenTestcases bool                 `json:"judgeOnlyHiddenTestcases,omitempty"` // judge only hidden testcases
	ContainHiddenTestcases   bool                 `json:"containHiddenTestcases,omitempty"`   // include hidden testcases when running
	IsInteractive            bool                 `json:"isInteractive,omitempty"`
}

func (r RunRequest) Validate() (*RunRequest, error) {
	if r.Code == "" {
		return nil, fmt.Errorf("code must not be empty")
	}
	if r.Language == "" {
		return nil, fmt.Errorf("language must not be empty")
	}
	if !sandbox.Language(r.Language).IsValid() {
		return nil, fmt.Errorf("unsupported language: %s", r.Language)
	}
	if r.ProblemId == 0 {
		return nil, fmt.Errorf("problemId must not be empty or zero")
	}
	if r.TimeLimit <= 0 {
		return nil, fmt.Errorf("timeLimit must not be empty or less than 0")
	}
	if r.MemoryLimit <= 0 {
		return nil, fmt.Errorf("memoryLimit must not be empty or less than 0")
	}
	return &r, nil
}

type RunResult struct {
	TestcaseId int    `json:"testcaseId"`
	Output     string `json:"output"`
	CpuTime    int    `json:"cpuTime"`
	RealTime   int    `json:"realTime"`
	Memory     int    `json:"memory"`
	Signal     int    `json:"signal"`
	ExitCode   int    `json:"exitCode"`
	ErrorCode  int    `json:"errorCode"`
	Error      string `json:"error"`
}

func (r *RunResult) SetRunExecResult(execResult sandbox.ExecResult) {
	r.CpuTime = execResult.CpuTime
	r.RealTime = execResult.RealTime
	r.Memory = execResult.Memory
	r.Signal = execResult.Signal
	r.ExitCode = execResult.ExitCode
	r.ErrorCode = execResult.ErrorCode
}
