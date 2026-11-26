package judger

import (
	"testing"

	"github.com/skkuding/codedang/apps/iris/src/common/constants"
	"github.com/stretchr/testify/assert"
)

func TestMakeExecArgsPassesSandboxUser(t *testing.T) {
	uid, gid := constants.SANDBOX_UID, constants.SANDBOX_GID
	args := makeExecArgs(ExecArgs{Uid: &uid, Gid: &gid})

	assert.Contains(t, args, "--uid=65534")
	assert.Contains(t, args, "--gid=65534")
}

func TestMakeExecArgsOmitsUnsetUser(t *testing.T) {
	args := makeExecArgs(ExecArgs{})

	for _, a := range args {
		assert.NotContains(t, a, "--uid=")
		assert.NotContains(t, a, "--gid=")
	}
}
