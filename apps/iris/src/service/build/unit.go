package build

import (
	"fmt"
	"strings"

	"github.com/skkuding/codedang/apps/iris/src/service/file"
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
) *BuildUnitError {
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
		return &BuildUnitError{
			Unit:    bu.Name,
			Phase:   "create_dir",
			Err:     fmt.Errorf("creating dir for build unit(%s): %w", bu.Name, err),
			UserMsg: err.Error(),
		}
	}

	language := sandbox.Language(bu.Language)
	srcPath, err := sandboxService.MakeSrcPath(unitDir, language)
	if err != nil {
		return &BuildUnitError{
			Unit:    bu.Name,
			Phase:   "save_src",
			Err:     fmt.Errorf("making src path for build unit(%s): %w", bu.Name, err),
			UserMsg: err.Error(),
		}
	}

	if err := fileManager.CreateFile(srcPath, bu.Code); err != nil {
		return &BuildUnitError{
			Unit:    bu.Name,
			Phase:   "save_src",
			Err:     fmt.Errorf("creating file for build unit(%s): %w", bu.Name, err),
			UserMsg: err.Error(),
		}
	}

	bu.Dir = unitDir
	bu.ParsedLang = language

	compileResult, compileErr := sandboxService.Compile(sandbox.CompileRequest{
		Dir:      bu.Dir,
		Language: bu.ParsedLang,
	})
	// compileErr: sandbox service itself failed (e.g., timeout, internal error)
	// compileResult.ExecResult.ErrorCode != 0: sandbox ran but user code has errors
	if compileErr != nil {
		return &BuildUnitError{
			Unit:    bu.Name,
			Phase:   "compile",
			Err:     fmt.Errorf("compilation error(%s): %w", bu.Name, compileErr),
			UserMsg: normalizeCompileError(compileErr, bu.Dir, bu.ParsedLang),
		}
	}

	if compileResult.ExecResult.ErrorCode != 0 {
		return &BuildUnitError{
			Unit:    bu.Name,
			Phase:   "compile",
			Err:     fmt.Errorf("sandbox error (%s)", bu.Name),
			UserMsg: "sandbox error",
		}
	}

	if compileResult.ExecResult.StatusCode != sandbox.RUN_SUCCESS {
		return &BuildUnitError{
			Unit:        bu.Name,
			Phase:       "compile",
			Err:         fmt.Errorf("compile failed (%s)", bu.Name),
			UserMsg:     fmt.Sprintf("%s (%s)", normalizeCompileError(fmt.Errorf("%s", string(compileResult.ErrOutput)), bu.Dir, bu.ParsedLang), bu.Name),
			IsUserError: true,
		}
	}

	return nil
}

func normalizeCompileError(err error, dir string, lang sandbox.Language) string {
	switch lang {
	case sandbox.C, sandbox.CPP:
		errMsg := err.Error()
		sandboxPath := "/app/sandbox/results/" + dir + "/"
		return strings.ReplaceAll(errMsg, sandboxPath, "")
	default:
		return err.Error()
	}
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
