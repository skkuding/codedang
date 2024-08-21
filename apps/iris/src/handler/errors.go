package handler

import (
	"errors"
	"fmt"

	"github.com/skkuding/codedang/apps/iris/src/service/logger"
)

type HandlerError struct {
	err     error        `json:"-"`
	level   logger.Level `json:"-"`
	caller  string       `json:"-"`
	Message string       `json:"data"`
}

func (h *HandlerError) Error() string {
	return fmt.Sprintf("%s: %s", h.caller, h.err.Error())
}

func (h *HandlerError) Wrap(err error) *HandlerError {
	if h.err != nil {
		h.err = fmt.Errorf("%w: %s", err, h.err.Error())
	} else {
		h.err = err
	}
	return h
}

func (h *HandlerError) Unwrap() error {
	return h.err
}

func (h *HandlerError) Level() logger.Level {
	return h.level
}

// func (h *HandlerError) Err() error {
// 	return h.err
// }

var (
	ErrTypeAssertionFail   = errors.New("type assertion failed")
	ErrMarshalJson         = errors.New("json marshal error")
	ErrValidate            = errors.New("validation error")
	ErrSandbox             = errors.New("sandbox error")
	ErrTestcaseGet         = errors.New("testcase get error")
	ErrCompile             = errors.New("compile error")
	ErrWrongAnswer         = errors.New("wrong answer")
	ErrCpuTimeLimitExceed  = errors.New("cputime limit exceeded")
	ErrRealTimeLimitExceed = errors.New("realtime limit exceeded")
	ErrMemoryLimitExceed   = errors.New("memory limit exceeded")
	ErrRuntime             = errors.New("runtime error")
	ErrSegFault            = errors.New("segmentation fault")
)
