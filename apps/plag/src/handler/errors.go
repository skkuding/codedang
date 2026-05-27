package handler

import (
	"errors"
	"fmt"

	"github.com/skkuding/codedang/apps/plag/src/service/logger"
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
	ErrTypeAssertionFail = errors.New("type assertion failed")
	ErrMarshalJson       = errors.New("json marshal error")
	ErrValidate          = errors.New("validation error")
  ErrRunJPlag          = errors.New("fail to run jplag")
  ErrSmallTokens       = errors.New("small tokens in submissions")
)
