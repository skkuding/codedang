package judger_test

import (
	"os"
	"testing"

	"github.com/skkuding/codedang/apps/iris/src/common/constants"
	"github.com/skkuding/codedang/apps/iris/src/service/build"
	"github.com/skkuding/codedang/apps/iris/src/service/file"
	"github.com/skkuding/codedang/apps/iris/src/service/logger"
	"github.com/skkuding/codedang/apps/iris/src/service/sandbox"
	"github.com/skkuding/codedang/apps/iris/src/service/sandbox/judger"
	"github.com/skkuding/codedang/apps/iris/src/utils"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// requireJudgerEnv skips unless the real libjudger can run: it needs root,
// a cgroup id, and the sandbox result dir (devcontainer or iris image).
func requireJudgerEnv(t *testing.T) {
	t.Helper()
	if os.Geteuid() != 0 {
		t.Skip("libjudger requires root")
	}
	if os.Getenv("CONTAINER_ID") == "" {
		t.Skip("CONTAINER_ID is not set")
	}
	if _, err := os.Stat(utils.Getenv("LIBJUDGER_PATH", "/app/sandbox/libjudger.so")); err != nil {
		t.Skip("libjudger.so not found")
	}
	if _, err := os.Stat(constants.RESULT_PATH); err != nil {
		t.Skip("sandbox result dir not found")
	}
}

func TestExecRunsEachLanguageAsUnprivilegedUser(t *testing.T) {
	requireJudgerEnv(t)

	programs := []struct {
		language sandbox.Language
		code     string
	}{
		{sandbox.C, "#include <stdio.h>\nint main(){int a;scanf(\"%d\",&a);printf(\"%d\\n\",a*2);return 0;}"},
		{sandbox.CPP, "#include <iostream>\nint main(){int a;std::cin>>a;std::cout<<a*2<<\"\\n\";}"},
		{sandbox.JAVA, "import java.util.*;public class Main{public static void main(String[] x){System.out.println(new Scanner(System.in).nextInt()*2);}}"},
		{sandbox.PYTHON, "print(int(input())*2)"},
		{sandbox.PYPY, "print(int(input())*2)"},
	}

	fm := file.NewFileManager(constants.RESULT_PATH)
	sb := judger.NewJudgerSandboxImpl(fm, logger.NewLogger(logger.Console, false))

	for _, p := range programs {
		t.Run(string(p.language), func(t *testing.T) {
			bu := &build.BuildUnit{Name: "exec-test", Code: p.code, Language: string(p.language)}
			buildErr := bu.Setup(0, 1, fm, sb)
			if bu.Dir != "" {
				t.Cleanup(func() { _ = fm.RemoveDir(bu.Dir) })
			}
			require.Nil(t, buildErr, "setup failed: %v", buildErr)

			res, err := bu.Run(sb, sandbox.RunRequest{Order: 0, TimeLimit: 2000, MemoryLimit: 256 * 1024 * 1024}, []byte("21\n"))
			if res.ExecResult.CgroupPath != "" {
				t.Cleanup(func() { _ = os.RemoveAll(res.ExecResult.CgroupPath) })
			}

			require.NoError(t, err)
			assert.Equal(t, judger.SUCCESS, res.ExecResult.ErrorCode, "libjudger error code")
			assert.Equal(t, sandbox.RUN_SUCCESS, res.ExecResult.StatusCode, "stderr: %s", res.ErrOutput)
			assert.Equal(t, "42\n", string(res.Output))
		})
	}
}
