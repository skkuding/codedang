package run

import (
	"testing"

	"github.com/skkuding/codedang/apps/iris/src/loader"
	"github.com/skkuding/codedang/apps/iris/src/service/sandbox"
	"github.com/stretchr/testify/assert"
)

func TestValidate(t *testing.T) {
	t.Run("invalid code", func(t *testing.T) {
		t.Parallel()
		req := RunRequest{Code: ""}
		result, err := req.Validate()

		assert.Nil(t, result)
		assert.EqualError(t, err, "code must not be empty")
	})

	t.Run("invalid language", func(t *testing.T) {
		t.Parallel()
		req := RunRequest{
			Code:     "print('')",
			Language: "",
		}
		result, err := req.Validate()

		assert.Nil(t, result)
		assert.EqualError(t, err, "language must not be empty")
	})

	t.Run("unsupported language", func(t *testing.T) {
		t.Parallel()
		req := RunRequest{
			Code:     "print('')",
			Language: "Umm",
		}
		result, err := req.Validate()

		assert.Nil(t, result)
		assert.EqualError(t, err, "unsupported language: Umm")
	})

	t.Run("invalid problemId", func(t *testing.T) {
		t.Parallel()
		req := RunRequest{
			Code:      "print('')",
			Language:  "C",
			ProblemId: 0,
		}
		result, err := req.Validate()

		assert.Nil(t, result)
		assert.EqualError(t, err, "problemId must not be empty or zero")
	})

	t.Run("invalid timeLimit", func(t *testing.T) {
		t.Parallel()
		req := RunRequest{
			Code:      "print('')",
			Language:  "C",
			ProblemId: 1,
			TimeLimit: 0,
		}
		result, err := req.Validate()

		assert.Nil(t, result)
		assert.EqualError(t, err, "timeLimit must not be empty or less than 0")
	})

	t.Run("invalid memoryLimit", func(t *testing.T) {
		t.Parallel()
		req := RunRequest{
			Code:        "print('')",
			Language:    "C",
			ProblemId:   1,
			TimeLimit:   1000,
			MemoryLimit: 0,
		}
		result, err := req.Validate()

		assert.Nil(t, result)
		assert.EqualError(t, err, "memoryLimit must not be empty or less than 0")
	})

	t.Run("negative timeLimit", func(t *testing.T) {
		t.Parallel()
		req := RunRequest{
			Code:      "print('')",
			Language:  "C",
			ProblemId: 1,
			TimeLimit: -1,
		}
		result, err := req.Validate()

		assert.Nil(t, result)
		assert.EqualError(t, err, "timeLimit must not be empty or less than 0")
	})

	t.Run("negative memoryLimit", func(t *testing.T) {
		t.Parallel()
		req := RunRequest{
			Code:        "print('')",
			Language:    "C",
			ProblemId:   1,
			TimeLimit:   1000,
			MemoryLimit: -1,
		}
		result, err := req.Validate()

		assert.Nil(t, result)
		assert.EqualError(t, err, "memoryLimit must not be empty or less than 0")
	})

	t.Run("valid request", func(t *testing.T) {
		t.Parallel()
		userTestcases := []loader.ElementOut{{Id: 1, In: "1", Out: "1"}}
		req := RunRequest{
			Code:                   "print('')",
			Language:               "C",
			ProblemId:              1,
			TimeLimit:              1000,
			MemoryLimit:            100,
			UserTestcases:          &userTestcases,
			StopOnNotAccepted:      true,
			ContainHiddenTestcases: true,
		}
		result, err := req.Validate()

		assert.Nil(t, err)
		if assert.NotNil(t, result) {
			assert.Equal(t, req, *result)
		}
	})
}

func TestSetRunExecResult(t *testing.T) {
	t.Run("copies exec metrics only", func(t *testing.T) {
		t.Parallel()
		res := RunResult{TestcaseId: 3, Output: "out", Error: "err"}
		res.SetRunExecResult(sandbox.ExecResult{
			CpuTime:    10,
			RealTime:   20,
			Memory:     30,
			Signal:     9,
			ExitCode:   1,
			ErrorCode:  2,
			StatusCode: sandbox.RUNTIME_ERROR,
			CgroupPath: "/sys/fs/cgroup/run",
		})

		assert.Equal(t, RunResult{
			TestcaseId: 3,
			Output:     "out",
			CpuTime:    10,
			RealTime:   20,
			Memory:     30,
			Signal:     9,
			ExitCode:   1,
			ErrorCode:  2,
			Error:      "err",
		}, res)
	})

	t.Run("overwrites previous metrics", func(t *testing.T) {
		t.Parallel()
		res := RunResult{CpuTime: 99, RealTime: 99, Memory: 99, Signal: 99, ExitCode: 99, ErrorCode: 99}
		res.SetRunExecResult(sandbox.ExecResult{})

		assert.Equal(t, RunResult{}, res)
	})
}
