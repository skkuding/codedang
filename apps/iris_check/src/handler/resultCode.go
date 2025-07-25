package handler

import "github.com/skkuding/codedang/apps/iris/src/service/sandbox"

type ResultCode int8

const (
	ACCEPTED ResultCode = 0 + iota
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

func SandboxStatusCodeToJudgeResultCode(status sandbox.StatusCode) ResultCode {
	switch status {
	case sandbox.CPU_TIME_LIMIT_EXCEEDED:
		return CPU_TIME_LIMIT_EXCEEDED
	case sandbox.REAL_TIME_LIMIT_EXCEEDED:
		return REAL_TIME_LIMIT_EXCEEDED
	case sandbox.MEMORY_LIMIT_EXCEEDED:
		return MEMORY_LIMIT_EXCEEDED
	case sandbox.RUNTIME_ERROR:
		return RUNTIME_ERROR
	case sandbox.SERVER_ERROR:
		return SERVER_ERROR
	}
	return ACCEPTED
}
