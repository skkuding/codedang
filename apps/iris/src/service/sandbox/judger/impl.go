package judger

import (
	"github.com/skkuding/codedang/apps/iris/src/service/file"
	"github.com/skkuding/codedang/apps/iris/src/service/logger"
	"github.com/skkuding/codedang/apps/iris/src/service/sandbox"
	"github.com/skkuding/codedang/apps/iris/src/utils"
)

type judgerSandboxImpl struct {
	sandbox.Compiler
	sandbox.Runner
	sandbox.LangConfig[JudgerConfig, ExecArgs]
}

func NewJudgerSandboxImpl(fileManager file.FileManager, logProvider logger.Logger) sandbox.Sandbox[JudgerConfig, ExecArgs] {
	// load env
	javaPolicyPath := string(utils.Getenv("JAVA_POLICY_PATH", "/app/sandbox/policy/java_policy"))
	libjudgerPath := string(utils.Getenv("LIBJUDGER_PATH", "/app/sandbox/libjudger.a"))

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
