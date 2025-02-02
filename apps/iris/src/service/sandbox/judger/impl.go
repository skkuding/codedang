package judger

import (
	"github.com/skkuding/codedang/apps/iris/src/service/file"
	"github.com/skkuding/codedang/apps/iris/src/service/logger"
	"github.com/skkuding/codedang/apps/iris/src/service/sandbox"
)

type judgerSandboxImpl struct {
	sandbox.Compiler
	sandbox.Runner
	sandbox.LangConfig[JudgerConfig, ExecArgs]
}

func NewJudgerSandboxImpl(fileManager file.FileManager, logProvider logger.Logger, javaPolicyPath string, libjudgerPath string) *judgerSandboxImpl {
	langConfig := NewJudgerLangConfig(fileManager, javaPolicyPath)
	sb := NewJudgerExec(libjudgerPath, logProvider)
	compiler := NewJudgerCompiler(sb, langConfig, fileManager, logProvider)
	runner := NewJudgerRunner(sb, langConfig, fileManager, logProvider)

	sandbox := judgerSandboxImpl{
		compiler,
		runner,
		langConfig,
	}

	return &sandbox
}
