package sandbox

import (
	"fmt"

	"github.com/cranemont/iris/src/common/constants"
	"github.com/cranemont/iris/src/service/file"
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
}

func NewCompiler(sandbox Sandbox, langConfig LangConfig, file file.FileManager) *compiler {
	return &compiler{sandbox, langConfig, file}
}

func (c *compiler) Compile(dto CompileRequest) (CompileResult, error) {
	dir, language := dto.Dir, dto.Language

	execArgs, err := c.langConfig.ToCompileExecArgs(dir, language)
	if err != nil {
		return CompileResult{}, err
	}

	execResult, err := c.sandbox.Exec(execArgs, nil)
	if err != nil {
		return CompileResult{}, err
	}

	compileResult := CompileResult{}
	if execResult.ResultCode != SUCCESS {

		compileOutputPath := c.file.MakeFilePath(dir, constants.COMPILE_OUT_FILE).String()
		data, err := c.file.ReadFile(compileOutputPath)
		if err != nil {
			return CompileResult{}, fmt.Errorf("failed to read output file: %w", err)
		}
		compileResult.ExecResult = execResult
		compileResult.ErrOutput = string(data)
		if execResult.ResultCode == SYSTEM_ERROR {
			return CompileResult{}, fmt.Errorf("system error: %v", compileResult)
		}
	}
	return compileResult, nil
}
