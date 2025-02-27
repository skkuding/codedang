package judger

import (
	"fmt"
	"strconv"

	"github.com/skkuding/codedang/apps/iris/src/service/file"
	"github.com/skkuding/codedang/apps/iris/src/service/logger"
	"github.com/skkuding/codedang/apps/iris/src/service/sandbox"
)

type runner struct {
	judgerExec JudgerExec
	langConfig sandbox.LangConfig[JudgerConfig, ExecArgs]
	file       file.FileManager
	logger     logger.Logger
}

func NewJudgerRunner(judgerExec JudgerExec, langConfig sandbox.LangConfig[JudgerConfig, ExecArgs], file file.FileManager, logger logger.Logger) *runner {
	return &runner{judgerExec, langConfig, file, logger}
}

func (r *runner) Run(req sandbox.RunRequest, input []byte) (sandbox.RunResult, error) {

	execArgs, err := r.langConfig.ToRunExecArgs(
		req.Dir,
		req.Language,
		req.Order,
		sandbox.Limit{
			CpuTime:  req.TimeLimit,
			RealTime: req.TimeLimit * 3,
			Memory:   req.MemoryLimit,
		},
		false,
	)
	if err != nil {
		return sandbox.RunResult{}, err
	}

	execResult, err := r.judgerExec.Exec(execArgs, input)
	if err != nil {
		return sandbox.RunResult{}, fmt.Errorf("execution failed: %w", err)
	}

	runResult := sandbox.RunResult{
		Order:      req.Order,
		ExecResult: execResult,
	}

	if execResult.ErrorCode != SUCCESS {
		return runResult, fmt.Errorf("execution failed (error code %d)", execResult.ErrorCode)
	}

	orderStr := strconv.Itoa(req.Order)
	if ResultCode(execResult.StatusCode) != RUN_SUCCESS {
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
