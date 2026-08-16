package taskerror

import (
	"errors"
	"fmt"
	"reflect"

	"github.com/skkuding/codedang/apps/iris/src/service/logger"
)

type ResultCode int8

const (
	ACCEPTED ResultCode = iota
	WRONG_ANSWER
	CPU_TIME_LIMIT_EXCEEDED
	REAL_TIME_LIMIT_EXCEEDED
	MEMORY_LIMIT_EXCEEDED
	RUNTIME_ERROR
	COMPILE_ERROR
	TESTCASE_ERROR
	SEGMENTATION_FAULT_ERROR
	SERVER_ERROR
	CANCELED
)

type Error struct {
	Handler string
	Code    ResultCode
	UserMsg string
	Level   logger.Level
	Err     error
}

func (e *Error) Error() string { return fmt.Sprintf("[%s] %s", e.Handler, e.Err) }

func (e *Error) Unwrap() error { return e.Err }

func New(handler string, code ResultCode, level logger.Level, err error) *Error {
	return &Error{Handler: handler, Code: code, Level: level, Err: err}
}

func ExtractUserMessage(err error) string {
	var taskErr *Error
	if errors.As(err, &taskErr) && taskErr.UserMsg != "" {
		return taskErr.UserMsg
	}
	return "Internal server error"
}

func ExtractResultCode(err error) ResultCode {
	var taskErr *Error
	if errors.As(err, &taskErr) {
		return taskErr.Code
	}
	return SERVER_ERROR
}

func Parse(res any, resultCode ResultCode) error {
	if resultCode == ACCEPTED {
		return nil
	}
	level := logger.INFO
	code := resultCode
	signal, realTime, ok := extractSignalAndRealTime(res)
	if ok {
		if signal == 11 && resultCode != MEMORY_LIMIT_EXCEEDED {
			code = SEGMENTATION_FAULT_ERROR
		}
		if realTime >= 2000 && signal == 9 && resultCode == RUNTIME_ERROR {
			code = REAL_TIME_LIMIT_EXCEEDED
		}
	}
	if code == SERVER_ERROR {
		level = logger.ERROR
	}
	return &Error{Handler: "parse", Code: code, Level: level, Err: fmt.Errorf("result code: %d", code)}
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
		if signalField.IsValid() && realTimeField.IsValid() && signalField.Kind() == reflect.Int && realTimeField.Kind() == reflect.Int {
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
