package handler

import (
	"fmt"

	"github.com/skkuding/codedang/apps/iris/src/service/file"
	"github.com/skkuding/codedang/apps/iris/src/service/logger"
	"github.com/skkuding/codedang/apps/iris/src/service/sandbox"
	"github.com/skkuding/codedang/apps/iris/src/service/sandbox/judger"
	"github.com/skkuding/codedang/apps/iris/src/utils"
)

type BuildUnit struct {
	Name     string
	Code     string
	Language string

	// Populated after setup
	Dir        string
	ParsedLang sandbox.Language
}



func (bu *BuildUnit) Setup(
	idx int,
	totalUnits int,
	fileManager file.FileManager,
	sandboxService sandbox.Sandbox[judger.JudgerConfig, judger.ExecArgs],
) *HandlerError {
	caller := "BuildUnit.Setup"

	name := bu.Name
	if name == "" {
		if totalUnits == 1 {
			name = "default"
		} else {
			name = fmt.Sprintf("unit-%d", idx)
		}
	}
	bu.Name = name

	unitDir := fmt.Sprintf("%s-%s", utils.RandString(8), name)
	if err := fileManager.CreateDir(unitDir); err != nil {
		return &HandlerError{
			caller:  caller,
			err:     fmt.Errorf("creating dir for build unit(%s): %w", bu.Name, err),
			level:   logger.ERROR,
			Message: err.Error(),
		}
	}

	language := sandbox.Language(bu.Language)
	srcPath, err := sandboxService.MakeSrcPath(unitDir, language)
	if err != nil {
		return &HandlerError{
			caller:  caller,
			err:     fmt.Errorf("making src path for build unit(%s): %w", bu.Name, err),
			level:   logger.ERROR,
			Message: err.Error(),
		}
	}

	if err := fileManager.CreateFile(srcPath, bu.Code); err != nil {
		return &HandlerError{
			caller:  caller,
			err:     fmt.Errorf("creating file for build unit(%s): %w", bu.Name, err),
			level:   logger.ERROR,
			Message: err.Error(),
		}
	}

	bu.Dir = unitDir
	bu.ParsedLang = language

	compileResult, compileErr := sandboxService.Compile(sandbox.CompileRequest{
    Dir:      bu.Dir,
    Language: bu.ParsedLang,
  })
  // compileErr is not nil when there is an error in the sandbox service itself (e.g., timeout, internal error, etc.)
  // compileResult.ExecResult.ErrorCode is not 0 when the sandbox service successfully runs but there is an error in the user's code (e.g., compilation error, runtime error, etc.)
	if compileErr != nil {
		return &HandlerError{
			caller:  caller,
			err:     fmt.Errorf("compilation error(%s): %w", bu.Name, compileErr),
			level:   logger.ERROR,
			Message: compileErr.Error(),
		}
	}

	if compileResult.ExecResult.ErrorCode != 0 {
		return &HandlerError{
			caller:  caller,
			err:     fmt.Errorf("%w: %s (%s)", ErrCompile, "sandbox error", bu.Name),
			level:   logger.ERROR,
			Message: "sandbox error",
		}
	}

	if compileResult.ExecResult.StatusCode != sandbox.RUN_SUCCESS {
		return &HandlerError{
			caller:  caller,
			err:     ErrCompile,
			level:   logger.INFO,
			Message: fmt.Sprintf("%s (%s)", string(compileResult.ErrOutput), bu.Name),
		}
	}

	return nil
}

func (bu *BuildUnit) Run(
	sandboxService sandbox.Sandbox[judger.JudgerConfig, judger.ExecArgs],
	req sandbox.RunRequest,
	input []byte,
) (sandbox.RunResult, error) {
	req.Dir = bu.Dir
	req.Language = bu.ParsedLang
	return sandboxService.Run(req, input)
}
