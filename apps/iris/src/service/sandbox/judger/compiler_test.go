package judger

import (
	"os"
	"path/filepath"
	"testing"

	"github.com/skkuding/codedang/apps/iris/src/service/sandbox"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestCompileExecClassifiesCompilerExit(t *testing.T) {
	outputPath := filepath.Join(t.TempDir(), "compile.out")
	c := &compiler{}

	result, err := c.compileExec(ExecArgs{
		ExePath:     "/bin/sh",
		Args:        []string{"-c", "printf 'syntax error\\n' >&2; exit 1"},
		OutputPath:  outputPath,
		MaxRealTime: 1000,
	})

	require.NoError(t, err)
	assert.Equal(t, sandbox.COMPILE_ERROR, result.StatusCode)
	assert.Equal(t, 1, result.ExitCode)
	output, err := os.ReadFile(outputPath)
	require.NoError(t, err)
	assert.Equal(t, "syntax error\n", string(output))
}

func TestCompileExecReportsStartFailure(t *testing.T) {
	c := &compiler{}
	result, err := c.compileExec(ExecArgs{
		ExePath:     filepath.Join(t.TempDir(), "missing-compiler"),
		OutputPath:  filepath.Join(t.TempDir(), "compile.out"),
		MaxRealTime: 1000,
	})

	require.Error(t, err)
	assert.Equal(t, sandbox.StatusCode(SYSTEM_ERROR), result.StatusCode)
}
