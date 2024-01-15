package router

import (
	"encoding/json"
	"fmt"

	"github.com/skkuding/codedang/iris/src/handler"
	"github.com/skkuding/codedang/iris/src/service/logger"
)

const (
	Judge        = "judge"
	SpecialJudge = "specialJudge"
	Run          = "run"
	Interactive  = "interactive"
	Cache        = "cache"
)

type Router interface {
	Route(path string, id string, data []byte) []byte
}

type router struct {
	judgeHandler *handler.JudgeHandler
	logger       logger.Logger
}

func NewRouter(
	judgeHandler *handler.JudgeHandler,
	logger logger.Logger,
) *router {
	return &router{judgeHandler, logger}
}

func (r *router) Route(path string, id string, data []byte) []byte {
	var handlerResult json.RawMessage
	var err error

	switch path {
	case Judge:
		handlerResult, err = r.judgeHandler.Handle(id, data)
	case Cache:
		// cache handler
	case SpecialJudge:
		// special-judge handler
	case Run:
		// custom-testcase handler
	default:
		err = fmt.Errorf("invalid request type: %s", path)
	}

	if err != nil {
		if u, ok := err.(*handler.HandlerError); ok {
			r.logger.Log(u.Level(), err.Error())
		} else {
			r.logger.Log(logger.ERROR, fmt.Sprintf("router: %s", err.Error()))
		}
	}
	return NewResponse(id, handlerResult, err).Marshal()
}
