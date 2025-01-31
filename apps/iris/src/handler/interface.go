package handler

import (
	"encoding/json"

	"github.com/skkuding/codedang/apps/iris/src/service/logger"
	"github.com/skkuding/codedang/apps/iris/src/service/sandbox"
)

type Handler interface {
	Handle(data interface{}) (json.RawMessage, error)
}

func SandboxResultCodeToJudgeResultCode(code sandbox.ResultCode) JudgeResultCode {
	switch code {
	case sandbox.CPU_TIME_LIMIT_EXCEEDED:
		return CPU_TIME_LIMIT_EXCEEDED
	case sandbox.REAL_TIME_LIMIT_EXCEEDED:
		return REAL_TIME_LIMIT_EXCEEDED
	case sandbox.MEMORY_LIMIT_EXCEEDED:
		return MEMORY_LIMIT_EXCEEDED
	case sandbox.RUNTIME_ERROR:
		return RUNTIME_ERROR
	case sandbox.SYSTEM_ERROR:
		return SERVER_ERROR
	}
	return ACCEPTED
}

func ParseError(j JudgeResult, resultCode JudgeResultCode) error {
	if resultCode != ACCEPTED {
		if j.Signal == 11 && resultCode != MEMORY_LIMIT_EXCEEDED {
			return resultCodeToError(SEGMENTATION_FAULT_ERROR)
		}
		if j.RealTime >= 2000 && j.Signal == 9 && resultCode == RUNTIME_ERROR {
			return resultCodeToError(REAL_TIME_LIMIT_EXCEEDED)
		}
		return resultCodeToError(resultCode)
	}
	return nil
}

func resultCodeToError(code JudgeResultCode) error {
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
	}
	return &HandlerError{caller: caller, err: ErrSandbox, level: logger.ERROR}
}
