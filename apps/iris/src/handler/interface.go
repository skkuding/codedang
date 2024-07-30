package handler

import (
	"encoding/json"

	"github.com/skkuding/codedang/apps/iris/src/service/logger"
	"github.com/skkuding/codedang/apps/iris/src/service/sandbox"
)

type Handler interface {
	Handle(data interface{}) (json.RawMessage, error)
	// result code mapper? (sandbox, handler)
	// error mapper? (han)
}

// FIXME: use more proper name
// FIXME: refactor
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
		return SYSTEM_ERROR
	}
	return ACCEPTED
}

func ParseFirstError(j []JudgeResult) error {
	for _, res := range j {
		if res.ResultCode != ACCEPTED {
			// TODO : Customizing Results
			if res.Signal == 11 && res.ResultCode != MEMORY_LIMIT_EXCEEDED {
				return resultCodeToError(SEGMENATION_FAULT)
			}
			if res.RealTime >= 2000 && res.Signal == 9 && res.ResultCode == RUNTIME_ERROR {
				return resultCodeToError(REAL_TIME_LIMIT_EXCEEDED)
			}
			return resultCodeToError(res.ResultCode)
		}
	}
	return nil
}

func resultCodeToError(code JudgeResultCode) error {
	caller := "parse first error"
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
	case SEGMENATION_FAULT:
		return err.Wrap(ErrSegFault)
	}
	return &HandlerError{caller: caller, err: ErrSandbox, level: logger.ERROR}
}
