package utils

import (
	"fmt"
	"os"

	"github.com/skkuding/codedang/apps/iris/src/service/logger"
)

// MustGetenvOrElseThrow returns the value of key. It exits the process if key
// is unset or empty.
func MustGetenvOrElseThrow(key string, logProvider logger.Logger) string {

	value, ok := os.LookupEnv(key)
	if !ok || value == "" {
		logProvider.Log(logger.ERROR, fmt.Sprintf("FATAL: Required environment variable %s is not set", key))
		os.Exit(1)
	}
	return value
}

// Getenv returns the value of key, or fallback if key is unset. An empty value
// is returned as is.
func Getenv(key, fallback string) string {
	value, ok := os.LookupEnv(key)
	if !ok {
		return fallback
	}
	return value
}
