package handler

import (
	"testing"

	"github.com/skkuding/codedang/apps/iris/src/service/sandbox"
	"github.com/stretchr/testify/assert"
)

func TestSandboxStatusCodeToJudgeResultCode(t *testing.T) {
	assert.Equal(t, ACCEPTED, SandboxStatusCodeToJudgeResultCode(sandbox.RUN_SUCCESS))
	assert.Equal(t, COMPILE_ERROR, SandboxStatusCodeToJudgeResultCode(sandbox.COMPILE_ERROR))
	assert.Equal(t, SEGMENTATION_FAULT_ERROR, SandboxStatusCodeToJudgeResultCode(sandbox.SEGMENTATION_FAULT_ERROR))
	assert.Equal(t, SERVER_ERROR, SandboxStatusCodeToJudgeResultCode(sandbox.StatusCode(127)))
}
