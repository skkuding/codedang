package sandbox

import (
	"fmt"
	"strconv"

	"github.com/cranemont/iris/src/service/file"
)

type RunResult struct {
	Order      int
	ErrOutput  []byte
	Output     []byte
	ExecResult ExecResult
}

type RunRequest struct {
	Order       int
	Dir         string
	Language    Language
	TimeLimit   int
	MemoryLimit int
}

type Runner interface {
	Run(dto RunRequest, input []byte) (RunResult, error)
}

type runner struct {
	sandbox    Sandbox
	langConfig LangConfig
	file       file.FileManager
}

func NewRunner(sandbox Sandbox, langConfig LangConfig, file file.FileManager) *runner {
	return &runner{sandbox, langConfig, file}
}

func (r *runner) Run(req RunRequest, input []byte) (RunResult, error) {

	execArgs, err := r.langConfig.ToRunExecArgs(
		req.Dir,
		req.Language,
		req.Order,
		Limit{
			CpuTime:  req.TimeLimit,
			RealTime: req.TimeLimit * 3,
			Memory:   req.MemoryLimit,
		},
		false,
	)
	if err != nil {
		return RunResult{}, err
	}

	execResult, err := r.sandbox.Exec(execArgs, input)
	if err != nil {
		return RunResult{}, fmt.Errorf("execution failed: %w", err)
	}

	runResult := RunResult{
		Order:      req.Order,
		ExecResult: execResult,
	}

	orderStr := strconv.Itoa(req.Order)
	if execResult.ResultCode != RUN_SUCCESS {
		errorPath := r.file.MakeFilePath(req.Dir, orderStr+".error").String()
		errData, err := r.file.ReadFile(errorPath)
		if err != nil {
			return RunResult{}, fmt.Errorf("reading error output file: %w", err)
		}
		runResult.ErrOutput = errData
	}
	outputPath := r.file.MakeFilePath(req.Dir, orderStr+".out").String()
	outputData, err := r.file.ReadFile(outputPath)
	if err != nil {
		return RunResult{}, fmt.Errorf("reading output file: %w", err)
	}
	runResult.Output = outputData
	return runResult, nil
}
