package taskerror

import (
	"errors"
	"testing"

	"github.com/skkuding/codedang/apps/iris/src/service/logger"
	"github.com/stretchr/testify/assert"
)

func TestExtractUserMessage(t *testing.T) {
	t.Run("returns a safe fallback for errors without a user message", func(t *testing.T) {
		assert.Equal(t, "Internal server error", ExtractUserMessage(errors.New("database password leaked")))
	})

	t.Run("returns the explicit user message", func(t *testing.T) {
		err := New("test", SERVER_ERROR, logger.ERROR, errors.New("internal"))
		err.UserMsg = "The request could not be processed"
		assert.Equal(t, "The request could not be processed", ExtractUserMessage(err))
	})
}

func TestParsePointerResult(t *testing.T) {
	type result struct {
		Signal   int
		RealTime int
	}

	err := Parse(&result{Signal: 11}, RUNTIME_ERROR)
	var taskErr *Error
	assert.ErrorAs(t, err, &taskErr)
	assert.Equal(t, SEGMENTATION_FAULT_ERROR, taskErr.Code)
}
