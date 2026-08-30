package handler

import (
	"github.com/skkuding/codedang/apps/iris/src/common/taskerror"
	"github.com/skkuding/codedang/apps/iris/src/service/sandbox"
)

type ResultCode = taskerror.ResultCode

const (
	ACCEPTED                 = taskerror.ACCEPTED
	WRONG_ANSWER             = taskerror.WRONG_ANSWER
	CPU_TIME_LIMIT_EXCEEDED  = taskerror.CPU_TIME_LIMIT_EXCEEDED
	REAL_TIME_LIMIT_EXCEEDED = taskerror.REAL_TIME_LIMIT_EXCEEDED
	MEMORY_LIMIT_EXCEEDED    = taskerror.MEMORY_LIMIT_EXCEEDED
	RUNTIME_ERROR            = taskerror.RUNTIME_ERROR
	COMPILE_ERROR            = taskerror.COMPILE_ERROR
	TESTCASE_ERROR           = taskerror.TESTCASE_ERROR
	SEGMENTATION_FAULT_ERROR = taskerror.SEGMENTATION_FAULT_ERROR
	SERVER_ERROR             = taskerror.SERVER_ERROR
	CANCELED                 = taskerror.CANCELED
)

func SandboxStatusCodeToJudgeResultCode(status sandbox.StatusCode) ResultCode {
	switch status {
	case sandbox.RUN_SUCCESS:
		return ACCEPTED
	case sandbox.CPU_TIME_LIMIT_EXCEEDED:
		return CPU_TIME_LIMIT_EXCEEDED
	case sandbox.REAL_TIME_LIMIT_EXCEEDED:
		return REAL_TIME_LIMIT_EXCEEDED
	case sandbox.MEMORY_LIMIT_EXCEEDED:
		return MEMORY_LIMIT_EXCEEDED
	case sandbox.RUNTIME_ERROR:
		return RUNTIME_ERROR
	case sandbox.COMPILE_ERROR:
		return COMPILE_ERROR
	case sandbox.SEGMENTATION_FAULT_ERROR:
		return SEGMENTATION_FAULT_ERROR
	case sandbox.SERVER_ERROR:
		return SERVER_ERROR
	}
	return SERVER_ERROR
}
