package sandbox

import (
	"fmt"
	"strconv"

	"github.com/skkuding/codedang/apps/iris/src/service/file"
	"github.com/skkuding/codedang/apps/iris/src/service/logger"
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
	Run(dto RunRequest, input []byte, isSpecial bool) (RunResult, error)
}

type runner struct {
	sandbox    Sandbox
	langConfig LangConfig
	file       file.FileManager
	logger     logger.Logger
}

func NewRunner(sandbox Sandbox, langConfig LangConfig, file file.FileManager, logger logger.Logger) *runner {
	return &runner{sandbox, langConfig, file, logger}
}

func (r *runner) Run(req RunRequest, input []byte, isSpecial bool) (RunResult, error) {

	execArgs, err := r.langConfig.ToRunExecArgs(
		req.Dir,
		req.Language,
		req.Order,
		Limit{
			CpuTime:  req.TimeLimit,
			RealTime: req.TimeLimit * 3,
			Memory:   req.MemoryLimit,
		},
		false, isSpecial,
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

	if execResult.ErrorCode != SUCCESS {
		return runResult, fmt.Errorf("execution failed (error code %d)", execResult.ErrorCode)
	}

	orderStr := strconv.Itoa(req.Order)
	if execResult.ResultCode != RUN_SUCCESS {
		errorPath := r.file.MakeFilePath(req.Dir, orderStr+".error").String()
		errData, err := r.file.ReadFile(errorPath)
		if err != nil {
			return runResult, fmt.Errorf("reading error output file: %w", err)
		}
		runResult.ErrOutput = errData
	}
	outputPath := r.file.MakeFilePath(req.Dir, orderStr+".out").String()
	outputData, err := r.file.ReadFile(outputPath)
	if err != nil {
		return runResult, fmt.Errorf("reading output file: %w", err)
	}
	runResult.Output = outputData
	return runResult, nil
}
