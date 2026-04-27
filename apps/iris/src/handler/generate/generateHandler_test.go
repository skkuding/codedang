package generate

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestGenerateValidate(t *testing.T) {
	t.Run("invalid problemId", func(t *testing.T) {
		t.Parallel()
		req := GenerateRequest{
			GeneratorLanguage: "C",
			GeneratorCode:     "print('')",
			TestcaseCount:     5,
		}
		result, err := req.Validate()

		assert.Nil(t, result)
		assert.EqualError(t, err, "problemId must not be empty or zero")
	})

	t.Run("invalid generatorLanguage", func(t *testing.T) {
		t.Parallel()
		req := GenerateRequest{
			ProblemId:     1,
			GeneratorCode: "print('')",
			TestcaseCount: 5,
		}
		result, err := req.Validate()

		assert.Nil(t, result)
		assert.EqualError(t, err, "generatorLanguage must not be empty")
	})

	t.Run("invalid generatorCode", func(t *testing.T) {
		t.Parallel()
		req := GenerateRequest{
			ProblemId:         1,
			GeneratorLanguage: "C",
			TestcaseCount:     5,
		}
		result, err := req.Validate()

		assert.Nil(t, result)
		assert.EqualError(t, err, "generatorCode must not be empty")
	})

	t.Run("invalid testcaseCount", func(t *testing.T) {
		t.Parallel()
		req := GenerateRequest{
			ProblemId:         1,
			GeneratorLanguage: "C",
			GeneratorCode:     "print('')",
			TestcaseCount:     0,
		}
		result, err := req.Validate()

		assert.Nil(t, result)
		assert.EqualError(t, err, "testcaseCount must be greater than 0")
	})

	t.Run("valid request", func(t *testing.T) {
		t.Parallel()
		req := GenerateRequest{
			ProblemId:         1,
			GeneratorLanguage: "C",
			GeneratorCode:     "print('')",
			TestcaseCount:     5,
		}
		result, err := req.Validate()

		assert.NotNil(t, result)
		assert.Nil(t, err)
	})
}
