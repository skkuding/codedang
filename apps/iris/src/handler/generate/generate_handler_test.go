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

	t.Run("unsupported generatorLanguage", func(t *testing.T) {
		t.Parallel()
		req := GenerateRequest{
			ProblemId:         1,
			GeneratorLanguage: "COBOL",
			GeneratorCode:     "print('')",
			TestcaseCount:     5,
		}
		result, err := req.Validate()

		assert.Nil(t, result)
		assert.EqualError(t, err, "unsupported generatorLanguage: COBOL")
	})

	t.Run("testcaseCount exceeds max", func(t *testing.T) {
		t.Parallel()
		req := GenerateRequest{
			ProblemId:         1,
			GeneratorLanguage: "C",
			GeneratorCode:     "print('')",
			TestcaseCount:     101,
		}
		result, err := req.Validate()

		assert.Nil(t, result)
		assert.EqualError(t, err, "testcaseCount must not exceed 100")
	})

	t.Run("generatorArgs exceeds max count", func(t *testing.T) {
		t.Parallel()
		args := make([]string, 21)
		for i := range args {
			args[i] = "arg"
		}
		req := GenerateRequest{
			ProblemId:         1,
			GeneratorLanguage: "C",
			GeneratorCode:     "print('')",
			TestcaseCount:     5,
			GeneratorArgs:     args,
		}
		result, err := req.Validate()

		assert.Nil(t, result)
		assert.EqualError(t, err, "generatorArgs must not exceed 20 elements")
	})

	t.Run("generatorArgs element too long", func(t *testing.T) {
		t.Parallel()
		req := GenerateRequest{
			ProblemId:         1,
			GeneratorLanguage: "C",
			GeneratorCode:     "print('')",
			TestcaseCount:     5,
			GeneratorArgs:     []string{string(make([]byte, 257))},
		}
		result, err := req.Validate()

		assert.Nil(t, result)
		assert.EqualError(t, err, "generatorArgs element exceeds 256 bytes")
	})

	t.Run("solution code without language", func(t *testing.T) {
		t.Parallel()
		req := GenerateRequest{
			ProblemId:         1,
			GeneratorLanguage: "C",
			GeneratorCode:     "print('')",
			TestcaseCount:     5,
			SolutionCode:      "int main(){}",
		}
		result, err := req.Validate()

		assert.Nil(t, result)
		assert.EqualError(t, err, "solutionCode and solutionLanguage must be provided together")
	})

	t.Run("solution language without code", func(t *testing.T) {
		t.Parallel()
		req := GenerateRequest{
			ProblemId:         1,
			GeneratorLanguage: "C",
			GeneratorCode:     "print('')",
			TestcaseCount:     5,
			SolutionLanguage:  "C",
		}
		result, err := req.Validate()

		assert.Nil(t, result)
		assert.EqualError(t, err, "solutionCode and solutionLanguage must be provided together")
	})

	t.Run("unsupported solutionLanguage", func(t *testing.T) {
		t.Parallel()
		req := GenerateRequest{
			ProblemId:         1,
			GeneratorLanguage: "C",
			GeneratorCode:     "print('')",
			TestcaseCount:     5,
			SolutionLanguage:  "COBOL",
			SolutionCode:      "int main(){}",
		}
		result, err := req.Validate()

		assert.Nil(t, result)
		assert.EqualError(t, err, "unsupported solutionLanguage: COBOL")
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

	t.Run("valid request with solution", func(t *testing.T) {
		t.Parallel()
		req := GenerateRequest{
			ProblemId:         1,
			GeneratorLanguage: "C",
			GeneratorCode:     "int main(){}",
			TestcaseCount:     5,
			SolutionLanguage:  "C",
			SolutionCode:      "int main(){}",
		}
		result, err := req.Validate()

		assert.NotNil(t, result)
		assert.Nil(t, err)
	})
}
