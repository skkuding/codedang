package build

import (
	"errors"
	"path/filepath"
	"testing"
	"time"

	"github.com/skkuding/codedang/apps/iris/src/service/file"
	"github.com/skkuding/codedang/apps/iris/src/service/sandbox"
	"github.com/skkuding/codedang/apps/iris/src/service/sandbox/judger"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

type blockingSandbox struct {
	firstEntered  chan struct{}
	secondEntered chan struct{}
	releaseFirst  chan struct{}
	calls         int
}

func newBlockingSandbox() *blockingSandbox {
	return &blockingSandbox{
		firstEntered:  make(chan struct{}),
		secondEntered: make(chan struct{}),
		releaseFirst:  make(chan struct{}),
	}
}

func (s *blockingSandbox) Run(_ sandbox.RunRequest, _ []byte) (sandbox.RunResult, error) {
	s.calls++
	switch s.calls {
	case 1:
		close(s.firstEntered)
		<-s.releaseFirst
	case 2:
		close(s.secondEntered)
	}
	return sandbox.RunResult{}, nil
}

func (*blockingSandbox) Compile(sandbox.CompileRequest) (sandbox.CompileResult, error) {
	return sandbox.CompileResult{}, nil
}

func (*blockingSandbox) GetConfig(sandbox.Language) (judger.JudgerConfig, error) {
	return judger.JudgerConfig{}, nil
}

func (*blockingSandbox) MakeSrcPath(string, sandbox.Language) (string, error) {
	return "", nil
}

func (*blockingSandbox) ToCompileExecArgs(string, sandbox.Language) (judger.ExecArgs, error) {
	return judger.ExecArgs{}, nil
}

func (*blockingSandbox) ToRunExecArgs(string, sandbox.Language, int, sandbox.Limit, bool, []string) (judger.ExecArgs, error) {
	return judger.ExecArgs{}, nil
}

func TestBuildUnitRunSerializesSameUnit(t *testing.T) {
	unit := &BuildUnit{Dir: "generator", ParsedLang: sandbox.CPP}
	fake := newBlockingSandbox()
	done := make(chan struct{}, 2)

	go func() {
		_, _ = unit.Run(fake, sandbox.RunRequest{Order: 0}, nil)
		done <- struct{}{}
	}()

	select {
	case <-fake.firstEntered:
	case <-time.After(time.Second):
		require.FailNow(t, "first run did not enter sandbox")
	}

	go func() {
		_, _ = unit.Run(fake, sandbox.RunRequest{Order: 1}, nil)
		done <- struct{}{}
	}()

	concurrent := false
	select {
	case <-fake.secondEntered:
		concurrent = true
	case <-time.After(50 * time.Millisecond):
	}

	close(fake.releaseFirst)
	if !concurrent {
		select {
		case <-fake.secondEntered:
		case <-time.After(time.Second):
			require.FailNow(t, "second run did not enter after first completed")
		}
	}

	<-done
	<-done
	assert.False(t, concurrent, "same BuildUnit entered the sandbox concurrently")
}

type compilingSandbox struct {
	*blockingSandbox
	baseDir string
	result  sandbox.CompileResult
	err     error
}

func (s *compilingSandbox) MakeSrcPath(dir string, _ sandbox.Language) (string, error) {
	return filepath.Join(s.baseDir, dir, "main.c"), nil
}

func (s *compilingSandbox) Compile(sandbox.CompileRequest) (sandbox.CompileResult, error) {
	return s.result, s.err
}

func TestBuildUnitSetupClassifiesCompileFailure(t *testing.T) {
	for _, tc := range []struct {
		name        string
		result      sandbox.CompileResult
		err         error
		isUserError bool
	}{
		{
			name: "compiler rejected source",
			result: sandbox.CompileResult{
				ExecResult: sandbox.ExecResult{StatusCode: sandbox.COMPILE_ERROR},
				ErrOutput:  "syntax error",
			},
			isUserError: true,
		},
		{
			name: "compiler could not start",
			err:  errors.New("compiler execution failed"),
		},
	} {
		t.Run(tc.name, func(t *testing.T) {
			baseDir := t.TempDir()
			unit := &BuildUnit{Code: "invalid source", Language: string(sandbox.CPP)}
			fake := &compilingSandbox{
				blockingSandbox: newBlockingSandbox(),
				baseDir:         baseDir,
				result:          tc.result,
				err:             tc.err,
			}

			buildErr := unit.Setup(0, 1, file.NewFileManager(baseDir), fake)

			require.Error(t, buildErr)
			assert.Equal(t, "compile", buildErr.Phase)
			assert.Equal(t, tc.isUserError, buildErr.IsUserError)
		})
	}
}
