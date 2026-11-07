package mq

import (
	"fmt"
	"os"
	"strconv"
	"time"
)

const (
	MessageTimeoutEnv       = "IRIS_MESSAGE_TIMEOUT_MS"
	DefaultMessageTimeoutMS = 10 * 60 * 1000
)

func MessageTimeoutFromEnv() (time.Duration, error) {
	raw := os.Getenv(MessageTimeoutEnv)
	if raw == "" {
		return time.Duration(DefaultMessageTimeoutMS) * time.Millisecond, nil
	}
	milliseconds, err := strconv.Atoi(raw)
	if err != nil || milliseconds <= 0 {
		return 0, fmt.Errorf("must be a positive integer")
	}
	return time.Duration(milliseconds) * time.Millisecond, nil
}
