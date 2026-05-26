package validate

import (
	"context"
	"testing"

	"github.com/skkuding/codedang/apps/iris/src/loader"
	"github.com/skkuding/codedang/apps/iris/src/service/logger"
	"github.com/stretchr/testify/assert"
)

type noopLogger struct{}

func (noopLogger) Log(_ logger.Level, _ string)                              {}
func (noopLogger) LogWithContext(_ logger.Level, _ string, _ context.Context) {}
func (noopLogger) Panic(_ string)                                             {}

func TestRunValidations(t *testing.T) {
	t.Run("cancelled context returns error, not allValid=true", func(t *testing.T) {
		t.Parallel()
		ctx, cancel := context.WithCancel(context.Background())
		cancel()

		task := &Task{
			req:    &ValidateRequest{},
			logger: noopLogger{},
		}
		elements := []loader.ElementOut{
			{Id: 1, In: "1", Out: "1"},
			{Id: 2, In: "2", Out: "2"},
		}

		// nil validatorUnit is safe here: goroutines exit via gCtx.Done() before calling Run
		allValid, results, err := task.runValidations(ctx, nil, elements)

		assert.ErrorIs(t, err, context.Canceled)
		assert.False(t, allValid)
		assert.Nil(t, results)
	})

	t.Run("empty elements returns allValid=true with no error", func(t *testing.T) {
		t.Parallel()
		task := &Task{
			req:    &ValidateRequest{},
			logger: noopLogger{},
		}

		allValid, results, err := task.runValidations(context.Background(), nil, []loader.ElementOut{})

		assert.Nil(t, err)
		assert.True(t, allValid)
		assert.Empty(t, results)
	})
}
