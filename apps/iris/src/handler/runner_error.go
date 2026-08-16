package handler

import (
	"github.com/skkuding/codedang/apps/iris/src/service/build"
	"github.com/skkuding/codedang/apps/iris/src/service/logger"
)

func buildUnitErrorToTaskError(be *build.BuildUnitError) *TaskError {
	level := logger.ERROR
	if be.IsUserError {
		level = logger.INFO
	}
	return &TaskError{
		Handler: "runner",
		Code:    COMPILE_ERROR,
		UserMsg: be.UserMsg,
		Level:   level,
		Err:     be,
	}
}
