package rabbitmq

import (
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestMessageTimeoutFromEnv(t *testing.T) {
	t.Run("uses the default", func(t *testing.T) {
		t.Setenv(MessageTimeoutEnv, "")
		timeout, err := messageTimeoutFromEnv()
		require.NoError(t, err)
		assert.Equal(t, time.Duration(DefaultMessageTimeoutMS)*time.Millisecond, timeout)
	})

	t.Run("uses a configured value", func(t *testing.T) {
		t.Setenv(MessageTimeoutEnv, "1234")
		timeout, err := messageTimeoutFromEnv()
		require.NoError(t, err)
		assert.Equal(t, 1234*time.Millisecond, timeout)
	})

	t.Run("rejects a non-positive value", func(t *testing.T) {
		t.Setenv(MessageTimeoutEnv, "0")
		_, err := messageTimeoutFromEnv()
		assert.EqualError(t, err, "must be a positive integer")
	})
}
