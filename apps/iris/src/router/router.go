package router

import (
	"context"
	"fmt"

	instrumentation "github.com/skkuding/codedang/apps/iris/src"
	"github.com/skkuding/codedang/apps/iris/src/handler"
	"github.com/skkuding/codedang/apps/iris/src/service/logger"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/trace"
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
	Route(path string, id string, data []byte, resultChan chan []byte, ctx context.Context)
}

type router[C any, E any] struct {
	judgeHandler *handler.JudgeHandler[C, E]
	logger       logger.Logger
	tracer       trace.Tracer
}

func NewRouter[C any, E any](
	judgeHandler *handler.JudgeHandler[C, E],
	logger logger.Logger,
	tracer trace.Tracer,
) *router[C, E] {
	return &router[C, E]{judgeHandler, logger, tracer}
}

func (r *router[C, E]) Route(path string, id string, data []byte, out chan []byte, ctx context.Context) {
	span := trace.SpanFromContext(ctx)
	tracer := otel.GetTracerProvider().Tracer("Router Tracer")
	newCtx, childSpan := tracer.Start(
		ctx,
		instrumentation.GetSemanticSpanName("router", "route"),
		trace.WithLinks(
			trace.Link{
				SpanContext: span.SpanContext(),
			}),
		trace.WithSpanKind(trace.SpanKindServer),
	)
	defer childSpan.End()

	// var handlerResult json.RawMessage
	// var err error

	judgeChan := make(chan handler.JudgeResultMessage)
	switch path {
	case Judge:
		go r.judgeHandler.Handle(id, data, true, judgeChan, newCtx)
	case Run, UserTestCase:
		go r.judgeHandler.Handle(id, data, false, judgeChan, newCtx)
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
