package sandbox

import (
	"fmt"

	"github.com/skkuding/codedang/iris/src/common/constants"
	"github.com/skkuding/codedang/iris/src/service/file"
	"github.com/skkuding/codedang/iris/src/service/logger"
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

	// TODO: 컴파일에 sandbox는 안 써도 되지 않을까요?
	execResult, err := c.sandbox.Exec(execArgs, nil)
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
