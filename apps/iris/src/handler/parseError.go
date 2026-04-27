package handler

import (
	"fmt"
	"reflect"

	"github.com/skkuding/codedang/apps/iris/src/service/logger"
)

func ParseError(res any, resultCode ResultCode) error {
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
	return &TaskError{
		Handler: "parse",
		Code:    code,
		Level:   level,
		Err:     fmt.Errorf("result code: %d", code),
	}
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
