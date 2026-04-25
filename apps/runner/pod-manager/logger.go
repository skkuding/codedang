package main

import (
	"context"
	"fmt"
	"log"

	"go.opentelemetry.io/contrib/bridges/otelzap"
	"go.opentelemetry.io/otel/log/global"
	"go.opentelemetry.io/otel/trace"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

type LogLevel string

const (
	LogLevelDebug LogLevel = "debug"
	LogLevelInfo  LogLevel = "info"
	LogLevelWarn  LogLevel = "warn"
	LogLevelError LogLevel = "error"
)

type Logger interface {
	Log(level LogLevel, msg string)
	LogWithContext(level LogLevel, msg string, ctx context.Context)
	LogFields(level LogLevel, msg string, fields ...zap.Field)
	Printf(format string, args ...any)
	Println(args ...any)
	Sync() error
}

type appLogger struct {
	zap *zap.Logger
}

func newLogger(serviceName string, isProduction bool) *appLogger {
	var cfg zap.Config
	if isProduction {
		cfg = zap.NewProductionConfig()
		cfg.EncoderConfig = zap.NewProductionEncoderConfig()
	} else {
		cfg = zap.NewDevelopmentConfig()
		cfg.EncoderConfig = zap.NewDevelopmentEncoderConfig()
	}
	cfg.EncoderConfig.EncodeTime = zapcore.ISO8601TimeEncoder

	zapLogger, err := cfg.Build(zap.AddCallerSkip(2))
	if err != nil {
		log.Fatalf("can't initialize zap logger: %v", err)
	}

	loggerProvider := global.GetLoggerProvider()
	zapLogger = zapLogger.WithOptions(zap.WrapCore(func(original zapcore.Core) zapcore.Core {
		otelCore := otelzap.NewCore(
			serviceName,
			otelzap.WithLoggerProvider(loggerProvider),
		)
		return zapcore.NewTee(original, otelCore)
	}))

	return &appLogger{zap: zapLogger}
}

func (l *appLogger) Log(level LogLevel, msg string) {
	l.logWithFields(level, msg, nil)
}

func (l *appLogger) LogWithContext(level LogLevel, msg string, ctx context.Context) {
	fields := fieldsFromContext(ctx)
	l.logWithFields(level, msg, fields)
}

func (l *appLogger) LogFields(level LogLevel, msg string, fields ...zap.Field) {
	l.logWithFields(level, msg, fields)
}

func (l *appLogger) Printf(format string, args ...any) {
	l.zap.Sugar().Infof(format, args...)
}

func (l *appLogger) Println(args ...any) {
	l.zap.Sugar().Info(fmt.Sprint(args...))
}

func (l *appLogger) Sync() error {
	return l.zap.Sync()
}

func (l *appLogger) logWithFields(level LogLevel, msg string, fields []zap.Field) {
	switch level {
	case LogLevelDebug:
		l.zap.Debug(msg, fields...)
	case LogLevelWarn:
		l.zap.Warn(msg, fields...)
	case LogLevelError:
		l.zap.Error(msg, fields...)
	default:
		l.zap.Info(msg, fields...)
	}
}

func fieldsFromContext(ctx context.Context) []zap.Field {
	if ctx == nil {
		return nil
	}
	span := trace.SpanFromContext(ctx)
	spanCtx := span.SpanContext()
	if !spanCtx.IsValid() {
		return nil
	}
	return []zap.Field{
		zap.String("trace_id", spanCtx.TraceID().String()),
		zap.String("span_id", spanCtx.SpanID().String()),
	}
}

func traceFields(ctx context.Context) []zap.Field {
	return fieldsFromContext(ctx)
}
