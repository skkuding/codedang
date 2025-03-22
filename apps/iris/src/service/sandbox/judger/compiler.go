package judger

import (
	"bytes"
	"fmt"

	"context"
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

	if execResult.StatusCode == sandbox.StatusCode(SYSTEM_ERROR) {
		c.logger.Log(logger.ERROR, fmt.Sprintf("Compile failed: %+v", execResult))
		data, err := c.file.ReadFile(constants.COMPILE_LOG_PATH)
		if err != nil {
			return sandbox.CompileResult{}, fmt.Errorf("failed to read output file: %w", err)
		}
		c.logger.Log(logger.ERROR, fmt.Sprintf("Compile Log: %s", string(data)))
		return sandbox.CompileResult{}, fmt.Errorf("system error: %v", execResult)
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
			StatusCode: sandbox.StatusCode(SYSTEM_ERROR),
		}, err
	}
	defer outputFile.Close()

	ctx, cancel := context.WithTimeout(context.Background(), time.Duration(args.MaxRealTime)*time.Millisecond)
	defer cancel()

	cmd := exec.CommandContext(ctx, args.ExePath, args.Args...)
	cmd.Env = append(cmd.Env, env)

	var stderr bytes.Buffer
	cmd.Stderr = &stderr

	startTime := time.Now()
	err = cmd.Run()

	if ctx.Err() == context.DeadlineExceeded {
		return sandbox.ExecResult{
			StatusCode: sandbox.StatusCode(REAL_TIME_LIMIT_EXCEEDED),
		}, nil
	}

	if err != nil {
		return sandbox.ExecResult{
			StatusCode: sandbox.StatusCode(SYSTEM_ERROR),
		}, fmt.Errorf("%s", stderr.String())
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
