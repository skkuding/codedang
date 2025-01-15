package sandbox

import (
	"fmt"

	"context"
	"os"
	"os/exec"
	"time"

	"github.com/skkuding/codedang/apps/iris/src/common/constants"
	"github.com/skkuding/codedang/apps/iris/src/service/file"
	"github.com/skkuding/codedang/apps/iris/src/service/logger"
)

type CompileResult struct {
	ErrOutput  string     // compile error message
	ExecResult ExecResult // resource usage and metadata from sandbox
}

type CompileRequest struct {
	Dir      string
	Language Language
}

type Compiler interface {
	Compile(dto CompileRequest) (CompileResult, error)
}

type compiler struct {
	sandbox    Sandbox
	langConfig LangConfig
	file       file.FileManager
	logger     logger.Logger
}

func NewCompiler(sandbox Sandbox, langConfig LangConfig, file file.FileManager, logger logger.Logger) *compiler {
	return &compiler{sandbox, langConfig, file, logger}
}

func (c *compiler) Compile(dto CompileRequest) (CompileResult, error) {
	dir, language := dto.Dir, dto.Language

	execArgs, err := c.langConfig.ToCompileExecArgs(dir, language)
	if err != nil {
		return CompileResult{}, err
	}

	execResult, err := c.compileExec(execArgs)

	if err != nil {
		return CompileResult{}, err
	}

	if execResult.ResultCode == SYSTEM_ERROR {
		c.logger.Log(logger.ERROR, fmt.Sprintf("Compile failed: %+v", execResult))
		data, err := c.file.ReadFile(constants.COMPILE_LOG_PATH)
		if err != nil {
			return CompileResult{}, fmt.Errorf("failed to read output file: %w", err)
		}
		c.logger.Log(logger.ERROR, fmt.Sprintf("Compile Log: %s", string(data)))
		return CompileResult{}, fmt.Errorf("system error: %v", execResult)
	}

	compileResult := CompileResult{}
	compileResult.ExecResult = execResult

	if execResult.ResultCode != RUN_SUCCESS {
		compileOutputPath := c.file.MakeFilePath(dir, constants.COMPILE_OUT_FILE).String()
		data, err := c.file.ReadFile(compileOutputPath)
		if err != nil {
			return CompileResult{}, fmt.Errorf("failed to read output file: %w", err)
		}
		compileResult.ErrOutput = string(data)
	}

	return compileResult, nil
}

func (c *compiler) compileExec(args ExecArgs) (ExecResult, error) {
	env := "PATH=" + os.Getenv("PATH")

	outputFile, err := os.Create(args.OutputPath)
	if err != nil {
		return ExecResult{
			ResultCode: SYSTEM_ERROR,
		}, err
	}
	defer outputFile.Close()

	ctx, cancel := context.WithTimeout(context.Background(), time.Duration(args.MaxRealTime)*time.Millisecond)
	defer cancel()

	cmd := exec.CommandContext(ctx, args.ExePath, args.Args...)
	cmd.Env = append(cmd.Env, env)

	startTime := time.Now()
	err = cmd.Run()

	if ctx.Err() == context.DeadlineExceeded {
		return ExecResult{
			ResultCode: REAL_TIME_LIMIT_EXCEEDED,
		}, nil
	}

	if err != nil {
		return ExecResult{
			ResultCode: SYSTEM_ERROR,
		}, nil
	}

	realTimeSpentMS := int(time.Since(startTime).Milliseconds())

	c.logger.Log(logger.DEBUG, fmt.Sprintf("compile takes: %d ms", realTimeSpentMS))

	return ExecResult{
		RealTime:   realTimeSpentMS,
		ExitCode:   0,
		ErrorCode:  0,
		ResultCode: RUN_SUCCESS,
	}, nil
}
