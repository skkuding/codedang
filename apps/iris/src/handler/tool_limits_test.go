package handler

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestToolLimitsFromEnv(t *testing.T) {
	t.Run("uses defaults when omitted", func(t *testing.T) {
		limits, err := ToolLimitsFromEnv()

		require.NoError(t, err)
		assert.Equal(t, DefaultToolTimeLimit, limits.TimeLimit)
		assert.Equal(t, DefaultToolMemoryLimit, limits.MemoryLimit)
	})

	t.Run("preserves configured limits", func(t *testing.T) {
		t.Setenv(ToolTimeLimitEnv, "5000")
		t.Setenv(ToolMemoryLimitEnv, "268435456")
		limits, err := ToolLimitsFromEnv()

		require.NoError(t, err)
		assert.Equal(t, 5000, limits.TimeLimit)
		assert.Equal(t, 256*1024*1024, limits.MemoryLimit)
	})

	t.Run("rejects invalid limits", func(t *testing.T) {
		t.Setenv(ToolTimeLimitEnv, "0")
		_, err := ToolLimitsFromEnv()
		assert.EqualError(t, err, "POLYGON_TOOL_TIME_LIMIT_MS must be a positive integer")

		t.Setenv(ToolTimeLimitEnv, "1000")
		t.Setenv(ToolMemoryLimitEnv, "invalid")
		_, err = ToolLimitsFromEnv()
		assert.EqualError(t, err, "POLYGON_TOOL_MEMORY_LIMIT_BYTES must be a positive integer")
	})
}

func TestWorkerCountFromEnv(t *testing.T) {
	t.Run("uses fallback and caps to work", func(t *testing.T) {
		workers, err := WorkerCountFromEnv("TEST_WORKERS", 1, 4)
		require.NoError(t, err)
		assert.Equal(t, 1, workers)
	})

	t.Run("uses configured worker count", func(t *testing.T) {
		t.Setenv("TEST_WORKERS", "3")
		workers, err := WorkerCountFromEnv("TEST_WORKERS", 10, 1)
		require.NoError(t, err)
		assert.Equal(t, 3, workers)
	})

	t.Run("rejects invalid worker count", func(t *testing.T) {
		t.Setenv("TEST_WORKERS", "many")
		_, err := WorkerCountFromEnv("TEST_WORKERS", 10, 1)
		assert.EqualError(t, err, "TEST_WORKERS must be a positive integer")
	})
}
