package handler

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestValidateValidate(t *testing.T) {
	t.Run("invalid problemId", func(t *testing.T) {
		t.Parallel()
		req := ValidateRequest{
			Language:      "C",
			ValidatorCode: "print('')",
		}
		result, err := req.Validate()

		assert.Nil(t, result)
		assert.EqualError(t, err, "problemId must not be empty or zero")
	})

	t.Run("invalid language", func(t *testing.T) {
		t.Parallel()
		req := ValidateRequest{
			ProblemId:     1,
			ValidatorCode: "print('')",
		}
		result, err := req.Validate()

		assert.Nil(t, result)
		assert.EqualError(t, err, "language must not be empty")
	})

	t.Run("invalid validatorCode", func(t *testing.T) {
		t.Parallel()
		req := ValidateRequest{
			ProblemId: 1,
			Language:  "C",
		}
		result, err := req.Validate()

		assert.Nil(t, result)
		assert.EqualError(t, err, "validatorCode must not be empty")
	})

	t.Run("valid request", func(t *testing.T) {
		t.Parallel()
		req := ValidateRequest{
			ProblemId:     1,
			Language:      "C",
			ValidatorCode: "print('')",
		}
		result, err := req.Validate()

		assert.NotNil(t, result)
		assert.Nil(t, err)
	})
}
