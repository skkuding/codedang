package logger

import (
	"log"

	"github.com/skkuding/codedang/apps/iris/src/common/constants"
	"go.opentelemetry.io/contrib/bridges/otelzap"
	"go.opentelemetry.io/otel/log/global"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

type Mode int
type Level string

const (
	DEBUG Level = "Debug"
	INFO  Level = "Info"
	WARN  Level = "Warn"
	ERROR Level = "Error"
)

const (
	File Mode = 1 + iota
	Console
)

type Logger interface {
	Log(level Level, msg string)
}

type logger struct {
	zap *zap.Logger
}

func NewLogger(mode Mode, isProduction bool) *logger {
	var zapLogger *zap.Logger
	var cfg zap.Config
	var err error

	if isProduction {
		cfg = zap.NewProductionConfig()
		setMode(&cfg, mode, constants.LOG_PATH_PROD).
			EncoderConfig = zap.NewProductionEncoderConfig()
		cfg.EncoderConfig.EncodeTime = zapcore.ISO8601TimeEncoder
		zapLogger, err = cfg.Build(zap.AddCallerSkip(2))
		if err != nil {
			log.Fatalf("can't initialize zap logger: %v", err)
		}
	} else {
		cfg = zap.NewDevelopmentConfig()
		setMode(&cfg, mode, constants.LOG_PATH_STAGE).
			EncoderConfig = zap.NewDevelopmentEncoderConfig()
		cfg.EncoderConfig.EncodeTime = zapcore.ISO8601TimeEncoder
		// cfg.Encoding = "json"
		zapLogger, err = cfg.Build(zap.AddCallerSkip(2))
		if err != nil {
			log.Fatalf("can't initialize zap logger: %v", err)
		}
	}

	loggerProvider := global.GetLoggerProvider()
	// 기존 로거의 Core를 가져와 OTel Core와 Tee로 묶는 Core Wrapper 적용
	zapLogger = zapLogger.WithOptions(zap.WrapCore(func(originalCore zapcore.Core) zapcore.Core {
		otelCore := otelzap.NewCore(
			"IRIS", // 로그의 scope_name에 사용될 이름
			otelzap.WithLoggerProvider(loggerProvider),
		)
		return zapcore.NewTee(originalCore, otelCore)
	}))

	return &logger{zap: zapLogger}
}

func setMode(cfg *zap.Config, mode Mode, logPath string) *zap.Config {
	switch mode {
	case Console:
	case File:
		cfg.OutputPaths = []string{logPath}
	case File | Console:
		cfg.OutputPaths = append(cfg.OutputPaths, logPath)
	default:
		log.Fatalf("invalid logger mode: %d", mode)
	}
	return cfg
}

func (l *logger) Log(level Level, msg string) {
	defer l.zap.Sync()
	switch level {
	case DEBUG:
		l.zap.Debug(msg)
	case INFO:
		l.zap.Info(msg)
	case WARN:
		l.zap.Warn(msg)
	case ERROR:
		l.zap.Error(msg)
	}
}
