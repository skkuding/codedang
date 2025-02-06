package router

import (
	"fmt"

	"github.com/skkuding/codedang/apps/iris/src/handler"
	"github.com/skkuding/codedang/apps/iris/src/service/logger"
)

const (
	Judge        = "judge"
	SpecialJudge = "specialJudge"
	Run          = "run"
	Interactive  = "interactive"
	UserTestCase = "userTestCase"
)

type Router interface {
	// Route(path string, id string, data []byte, resultChan chan []byte) []byte
	Route(path string, id string, data []byte, resultChan chan []byte)
}

type router[C any, E any] struct {
	judgeHandler *handler.JudgeHandler[C, E]
	logger       logger.Logger
}

func NewRouter[C any, E any](
	judgeHandler *handler.JudgeHandler[C, E],
	logger logger.Logger,
) *router[C, E] {
	return &router[C, E]{judgeHandler, logger}
}

func (r *router[C, E]) Route(path string, id string, data []byte, out chan []byte) {
	// var handlerResult json.RawMessage
	// var err error

	judgeChan := make(chan handler.JudgeResultMessage)
	switch path {
	case Judge:
		go r.judgeHandler.Handle(id, data, true, judgeChan)
	case Run, UserTestCase:
		go r.judgeHandler.Handle(id, data, false, judgeChan)
	case SpecialJudge:
	default:
		err := fmt.Errorf("invalid request type: %s", path)
		r.errHandle(err)
		out <- NewResponse(id, nil, err).Marshal()
	}

	for result := range judgeChan {
		r.errHandle(result.Err)
		out <- NewResponse(id, result.Result, result.Err).Marshal()
		// break
	}
	// return NewResponse(id, handlerResult, err).Marshal()
	close(out)
	r.logger.Log(logger.DEBUG, "Router done...")
}

func (r *router[C, E]) errHandle(err error) {
	if err != nil && err != handler.ErrJudgeEnd {
		if u, ok := err.(*handler.HandlerError); ok {
			r.logger.Log(u.Level(), err.Error())
		} else {
			r.logger.Log(logger.ERROR, fmt.Sprintf("router: %s", err.Error()))
		}
	}
}
