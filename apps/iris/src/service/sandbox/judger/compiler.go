package judger

import (
	"context"
	"errors"
	"fmt"
	"os"
	"os/exec"
	"time"

	"github.com/skkuding/codedang/apps/iris/src/common/constants"
	"github.com/skkuding/codedang/apps/iris/src/service/file"
	"github.com/skkuding/codedang/apps/iris/src/service/logger"
	"github.com/skkuding/codedang/apps/iris/src/service/sandbox"
)

type compiler struct {
	judgerExec JudgerExec
	langConfig sandbox.LangConfig[JudgerConfig, ExecArgs]
	file       file.FileManager
	logger     logger.Logger
}

func NewJudgerCompiler(judgerExec JudgerExec, langConfig sandbox.LangConfig[JudgerConfig, ExecArgs], file file.FileManager, logger logger.Logger) *compiler {
	return &compiler{judgerExec, langConfig, file, logger}
}

func (c *compiler) Compile(dto sandbox.CompileRequest) (sandbox.CompileResult, error) {
	dir, language := dto.Dir, dto.Language

	execArgs, err := c.langConfig.ToCompileExecArgs(dir, language)
	if err != nil {
		return sandbox.CompileResult{}, err
	}

	execResult, err := c.compileExec(execArgs)

	if err != nil {
		return sandbox.CompileResult{}, err
	}

	compileResult := sandbox.CompileResult{}
	compileResult.ExecResult = execResult

	if execResult.StatusCode != sandbox.StatusCode(RUN_SUCCESS) {
		compileOutputPath := c.file.MakeFilePath(dir, constants.COMPILE_OUT_FILE).String()
		data, err := c.file.ReadFile(compileOutputPath)
		if err != nil {
			return sandbox.CompileResult{}, fmt.Errorf("failed to read output file: %w", err)
		}
		compileResult.ErrOutput = string(data)
	}

	return compileResult, nil
}

func (c *compiler) compileExec(args ExecArgs) (sandbox.ExecResult, error) {
	env := "PATH=" + os.Getenv("PATH")

	outputFile, err := os.Create(args.OutputPath)
	if err != nil {
		return sandbox.ExecResult{
			StatusCode: sandbox.SERVER_ERROR,
		}, err
	}
	defer outputFile.Close()

	ctx, cancel := context.WithTimeout(context.Background(), time.Duration(args.MaxRealTime)*time.Millisecond)
	defer cancel()

	cmd := exec.CommandContext(ctx, args.ExePath, args.Args...)
	cmd.Env = append(cmd.Env, env)
	cmd.Stdout = outputFile
	cmd.Stderr = outputFile

	startTime := time.Now()
	err = cmd.Run()

	if ctx.Err() == context.DeadlineExceeded {
		return sandbox.ExecResult{
			StatusCode: sandbox.StatusCode(REAL_TIME_LIMIT_EXCEEDED),
		}, nil
	}

	if err != nil {
		var exitErr *exec.ExitError
		if errors.As(err, &exitErr) && exitErr.ExitCode() >= 0 {
			return sandbox.ExecResult{
				ExitCode:   exitErr.ExitCode(),
				StatusCode: sandbox.COMPILE_ERROR,
			}, nil
		}
		return sandbox.ExecResult{
			StatusCode: sandbox.SERVER_ERROR,
		}, fmt.Errorf("compiler execution failed: %w", err)
	}

	realTimeSpentMS := int(time.Since(startTime).Milliseconds())

	c.logger.Log(logger.DEBUG, fmt.Sprintf("compile takes: %d ms", realTimeSpentMS))

	return sandbox.ExecResult{
		RealTime:   realTimeSpentMS,
		ExitCode:   0,
		ErrorCode:  0,
		StatusCode: sandbox.StatusCode(RUN_SUCCESS),
	}, nil
}
