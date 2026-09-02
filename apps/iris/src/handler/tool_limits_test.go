package handler

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestToolLimitsFromEnv(t *testing.T) {
	t.Run("uses defaults when omitted", func(t *testing.T) {
		t.Setenv(ToolTimeLimitEnv, "")
		t.Setenv(ToolMemoryLimitEnv, "")
		t.Setenv(ToolMaxWorkersEnv, "")
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
		t.Setenv(ToolMaxWorkersEnv, "")
		workers, err := WorkerCountFromEnv("TEST_WORKERS", 1, 4)
		require.NoError(t, err)
		assert.Equal(t, 1, workers)
	})

	t.Run("uses configured worker count", func(t *testing.T) {
		t.Setenv(ToolMaxWorkersEnv, "")
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

	t.Run("caps configured worker count to the global maximum", func(t *testing.T) {
		t.Setenv("TEST_WORKERS", "10")
		t.Setenv(ToolMaxWorkersEnv, "3")
		workers, err := WorkerCountFromEnv("TEST_WORKERS", 20, 1)
		require.NoError(t, err)
		assert.Equal(t, 3, workers)
	})

	t.Run("rejects an invalid global maximum", func(t *testing.T) {
		t.Setenv(ToolMaxWorkersEnv, "0")
		_, err := WorkerCountFromEnv("TEST_WORKERS", 10, 1)
		assert.EqualError(t, err, "POLYGON_TOOL_MAX_WORKERS must be a positive integer")
	})
}

func TestRetryCountFromEnv(t *testing.T) {
	t.Run("uses default when omitted", func(t *testing.T) {
		retries, err := RetryCountFromEnv("TEST_RETRIES", 1)
		require.NoError(t, err)
		assert.Equal(t, 1, retries)
	})

	t.Run("allows zero retries", func(t *testing.T) {
		t.Setenv("TEST_RETRIES", "0")
		retries, err := RetryCountFromEnv("TEST_RETRIES", 1)
		require.NoError(t, err)
		assert.Zero(t, retries)
	})

	t.Run("rejects invalid retry count", func(t *testing.T) {
		t.Setenv("TEST_RETRIES", "-1")
		_, err := RetryCountFromEnv("TEST_RETRIES", 1)
		assert.EqualError(t, err, "TEST_RETRIES must be a non-negative integer")
	})
}
