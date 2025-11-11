package utils

import (
	"fmt"
	"os"

	"github.com/skkuding/codedang/apps/plag/src/service/logger"
)

// 필수 환경변수가 설정되어 있는지 확인하고, 설정되어 있지 않으면 프로그램을 종료합니다.
func MustGetenvOrElseThrow(key string, logProvider logger.Logger) string {

	value, ok := os.LookupEnv(key)
	if !ok || value == "" {
		logProvider.Log(logger.ERROR, fmt.Sprintf("FATAL: Required environment variable %s is not set", key))
		os.Exit(1)
	}
	return value
}

func Getenv(key, fallback string) string {
	value, ok := os.LookupEnv(key)
	if !ok {
		return fallback
	}
	return value
}
