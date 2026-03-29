package handler

import (
	"fmt"

	"github.com/skkuding/codedang/apps/iris/src/service/logger"
)

type TaskError struct {
	Handler string
	Code    ResultCode
	UserMsg string
	Level   logger.Level
	Err     error
}

func (e *TaskError) Error() string {
	return fmt.Sprintf("[%s] %s", e.Handler, e.Err)
}

func (e *TaskError) Unwrap() error {
	return e.Err
}

func NewTaskError(handler string, code ResultCode, level logger.Level, err error) *TaskError {
	return &TaskError{
		Handler: handler,
		Code:    code,
		Level:   level,
		Err:     err,
	}
}
