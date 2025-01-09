package handler

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestValidate(t *testing.T) {
	t.Run("invalid code", func(t *testing.T) {
		t.Parallel()
		req := Request{Code: ""}
		result, err := req.Validate()

		assert.Nil(t, result)
		assert.EqualError(t, err, "code must not be empty")
	})

	t.Run("invalid language", func(t *testing.T) {
		t.Parallel()
		req := Request{
			Code:     "print('')",
			Language: "",
		}
		result, err := req.Validate()

		assert.Nil(t, result)
		assert.EqualError(t, err, "language must not be empty")
	})

	t.Run("invalid language", func(t *testing.T) {
		t.Parallel()
		req := Request{
			Code:     "print('')",
			Language: "Umm",
		}
		result, err := req.Validate()

		assert.Nil(t, result)
		assert.EqualError(t, err, "unsupported language: Umm")
	})

	t.Run("invalid problemId", func(t *testing.T) {
		t.Parallel()
		req := Request{
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
		req := Request{
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
		req := Request{
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

	t.Run("valid request", func(t *testing.T) {
		t.Parallel()
		req := Request{
			Code:        "print('')",
			Language:    "C",
			ProblemId:   1,
			TimeLimit:   1000,
			MemoryLimit: 100,
		}
		result, err := req.Validate()

		assert.NotNil(t, result)
		assert.Nil(t, err)
	})
}
