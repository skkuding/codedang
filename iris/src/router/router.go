package router

import (
	"fmt"

	"github.com/skkuding/codedang/iris/src/handler"
	"github.com/skkuding/codedang/iris/src/service/logger"
)

const (
	Judge        = "judge"
	SpecialJudge = "specialJudge"
	Run          = "run"
	Interactive  = "interactive"
)

type Router interface {
	// Route(path string, id string, data []byte, resultChan chan []byte) []byte
	Route(path string, id string, data []byte, resultChan chan []byte)
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

func (r *router) Route(path string, id string, data []byte, out chan []byte) {
	// var handlerResult json.RawMessage
	// var err error

	judgeChan := make(chan handler.JudgeResultMessage)
	switch path {
	case Judge:
		go r.judgeHandler.Handle(id, data, judgeChan)
	case SpecialJudge:
		// special-judge handler
	case Run:
		// custom-testcase handler
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

func (r *router) errHandle(err error) {
	if err != nil && err != handler.ErrJudgeEnd {
		if u, ok := err.(*handler.HandlerError); ok {
			r.logger.Log(u.Level(), err.Error())
		} else {
			r.logger.Log(logger.ERROR, fmt.Sprintf("router: %s", err.Error()))
		}
	}
}
