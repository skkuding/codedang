package handler

import (
	"context"
	"encoding/json"
	"reflect"

	"github.com/skkuding/codedang/apps/iris/src/service/logger"
)

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
	GetBuildUnits() []*BuildUnit
	GetDebugString() string
	RunAction(ctx context.Context, sendResult func(ResultMessage))
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
		signal, realTime, ok := extractSignalAndRealTime(res)
		if ok {
			if signal == 11 && resultCode != MEMORY_LIMIT_EXCEEDED {
				return resultCodeToError(SEGMENTATION_FAULT_ERROR)
			}
			if realTime >= 2000 && signal == 9 && resultCode == RUNTIME_ERROR {
				return resultCodeToError(REAL_TIME_LIMIT_EXCEEDED)
			}
		}

		return resultCodeToError(resultCode)
	}
	return nil
}

func extractSignalAndRealTime(res any) (int, int, bool) {
	v := reflect.ValueOf(res)
	if !v.IsValid() {
		return 0, 0, false
	}

	if v.Kind() == reflect.Pointer {
		if v.IsNil() {
			return 0, 0, false
		}
		v = v.Elem()
	}

	if v.Kind() == reflect.Struct {
		signalField := v.FieldByName("Signal")
		realTimeField := v.FieldByName("RealTime")
		if signalField.IsValid() && realTimeField.IsValid() &&
			signalField.Kind() == reflect.Int && realTimeField.Kind() == reflect.Int {
			return int(signalField.Int()), int(realTimeField.Int()), true
		}
	}

	if m, ok := res.(map[string]any); ok {
		signal, hasSignal := m["signal"].(float64)
		realTime, hasRealTime := m["realTime"].(float64)
		if hasSignal && hasRealTime {
			return int(signal), int(realTime), true
		}
	}

	return 0, 0, false
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
