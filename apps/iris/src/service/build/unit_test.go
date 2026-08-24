package build

import (
	"testing"
	"time"

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
