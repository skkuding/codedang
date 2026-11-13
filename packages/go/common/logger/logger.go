package logger

import "context"

type Level string

const (
	DEBUG Level = "Debug"
	INFO  Level = "Info"
	WARN  Level = "Warn"
	ERROR Level = "Error"
)

type Logger interface {
	Log(level Level, msg string)
	LogWithContext(level Level, msg string, ctx context.Context)
	Panic(msg string)
}
