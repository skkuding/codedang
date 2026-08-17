package handler

import (
	"fmt"
	"os"
	"strconv"
)

const (
	ToolTimeLimitEnv       = "POLYGON_TOOL_TIME_LIMIT_MS"
	ToolMemoryLimitEnv     = "POLYGON_TOOL_MEMORY_LIMIT_BYTES"
	GenerateRetryCountEnv  = "GENERATE_RETRY_COUNT"
	DefaultToolTimeLimit   = 2000
	DefaultToolMemoryLimit = 512 * 1024 * 1024
	DefaultGenerateRetries = 1
)

type ToolExecutionLimits struct {
	TimeLimit   int
	MemoryLimit int
}

func ToolLimitsFromEnv() (ToolExecutionLimits, error) {
	timeLimit, err := positiveIntFromEnv(ToolTimeLimitEnv, DefaultToolTimeLimit)
	if err != nil {
		return ToolExecutionLimits{}, err
	}
	memoryLimit, err := positiveIntFromEnv(ToolMemoryLimitEnv, DefaultToolMemoryLimit)
	if err != nil {
		return ToolExecutionLimits{}, err
	}
	return ToolExecutionLimits{TimeLimit: timeLimit, MemoryLimit: memoryLimit}, nil
}

func WorkerCountFromEnv(name string, total, fallback int) (int, error) {
	if total <= 0 {
		return 0, nil
	}
	workers, err := positiveIntFromEnv(name, fallback)
	if err != nil {
		return 0, err
	}
	if workers > total {
		workers = total
	}
	return workers, nil
}

func RetryCountFromEnv(name string, fallback int) (int, error) {
	raw := os.Getenv(name)
	if raw == "" {
		return fallback, nil
	}
	value, err := strconv.Atoi(raw)
	if err != nil || value < 0 {
		return 0, fmt.Errorf("%s must be a non-negative integer", name)
	}
	return value, nil
}

func positiveIntFromEnv(name string, fallback int) (int, error) {
	raw := os.Getenv(name)
	if raw == "" {
		return fallback, nil
	}
	value, err := strconv.Atoi(raw)
	if err != nil || value <= 0 {
		return 0, fmt.Errorf("%s must be a positive integer", name)
	}
	return value, nil
}
