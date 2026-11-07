package logger

import "context"

type Logger interface {
	Debug(ctx context.Context, msg string)
	Info(ctx context.Context, msg string)
	Error(ctx context.Context, msg string)
	Panic(msg string)
}
