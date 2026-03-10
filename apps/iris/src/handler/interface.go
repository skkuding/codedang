package handler

import (
	"context"
	"encoding/json"

	"github.com/skkuding/codedang/apps/iris/src/service/logger"
)

const MAX_BUF = 10

type Handler interface {
	Handle(data any) (json.RawMessage, error)
}

type Request interface {
}

type ResultMessage struct {
	Result json.RawMessage
	Err    error
}

type Task interface {
	GetCode() string
	GetLanguage() string
	GetOutChan() chan ResultMessage
	RunAction(ctx context.Context, dir string)
}

func NewHandlerError(caller string, err error, level logger.Level) *HandlerError {
	return &HandlerError{
		caller: caller,
		err:    err,
		level:  level,
	}
}

func ParseError(res any, resultCode ResultCode) error {
	if resultCode != ACCEPTED {
		// Attempt to extract typical Sandbox signals from Result if present
		if j, ok := res.(struct {
			Signal   int
			RealTime int
		}); ok {
			if j.Signal == 11 && resultCode != MEMORY_LIMIT_EXCEEDED {
				return resultCodeToError(SEGMENTATION_FAULT_ERROR)
			}
			if j.RealTime >= 2000 && j.Signal == 9 && resultCode == RUNTIME_ERROR {
				return resultCodeToError(REAL_TIME_LIMIT_EXCEEDED)
			}
		}

		// Attempt to extract by map for parsing if res comes as interface{} JSON decode
		if m, ok := res.(map[string]any); ok {
			signal, hasSignal := m["signal"].(float64)
			realTime, hasRealTime := m["realTime"].(float64)

			if hasSignal && int(signal) == 11 && resultCode != MEMORY_LIMIT_EXCEEDED {
				return resultCodeToError(SEGMENTATION_FAULT_ERROR)
			}
			if hasRealTime && hasSignal && int(realTime) >= 2000 && int(signal) == 9 && resultCode == RUNTIME_ERROR {
				return resultCodeToError(REAL_TIME_LIMIT_EXCEEDED)
			}
		}

		return resultCodeToError(resultCode)
	}
	return nil
}

func resultCodeToError(code ResultCode) error {
	caller := "parse error"
	err := &HandlerError{
		caller: caller,
		level:  logger.INFO,
	}
	switch code {
	case WRONG_ANSWER:
		return err.Wrap(ErrWrongAnswer)
	case CPU_TIME_LIMIT_EXCEEDED:
		return err.Wrap(ErrCpuTimeLimitExceed)
	case REAL_TIME_LIMIT_EXCEEDED:
		return err.Wrap(ErrRealTimeLimitExceed)
	case MEMORY_LIMIT_EXCEEDED:
		return err.Wrap(ErrMemoryLimitExceed)
	case RUNTIME_ERROR:
		return err.Wrap(ErrRuntime)
	case SEGMENTATION_FAULT_ERROR:
		return err.Wrap(ErrSegFault)
	case CANCELED:
		return err.Wrap(ErrCanceled)
	}
	return &HandlerError{caller: caller, err: ErrSandbox, level: logger.ERROR}
}
