package router

import (
	"context"
	"fmt"

	instrumentation "github.com/skkuding/codedang/apps/plag/src"
	"github.com/skkuding/codedang/apps/plag/src/handler"
	"github.com/skkuding/codedang/apps/plag/src/service/logger"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/trace"
)

const (
	Check = "check"
)

type Router interface {
	// Route(path string, id string, data []byte, resultChan chan []byte) []byte
	Route(path string, id string, data []byte, resultChan chan []byte, ctx context.Context)
}

type router struct {
	checkHandler *handler.CheckHandler
	logger       logger.Logger
	tracer       trace.Tracer
}

func NewRouter(
	checkHandler *handler.CheckHandler,
	logger logger.Logger,
	tracer trace.Tracer,
) *router {
	return &router{checkHandler, logger, tracer}
}

func (r *router) Route(path string, id string, data []byte, out chan []byte, ctx context.Context) {
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

	checkChan := make(chan handler.CheckResultMessage)
	switch path { // 나중에 추가 작업을 지정할 수 있도록 각 메시지 타입을 구분
	case Check:
		go r.checkHandler.Handle(id, data, checkChan, newCtx)
	default:
		err := fmt.Errorf("invalid request type: %s", path)
		r.errHandle(err)
		out <- NewResponse(id, nil, err).Marshal()
	}

	for result := range checkChan {
		r.errHandle(result.Err)
		out <- NewResponse(id, result.Result, result.Err).Marshal()
		// break
	}
	// return NewResponse(id, handlerResult, err).Marshal()
	close(out)
	r.logger.Log(logger.DEBUG, "Router done...")
}

func (r *router) errHandle(err error) {
	if err != nil && err != handler.ErrCheckEnd {
		if u, ok := err.(*handler.HandlerError); ok {
			r.logger.Log(u.Level(), err.Error())
		} else {
			r.logger.Log(logger.ERROR, fmt.Sprintf("router: %s", err.Error()))
		}
	}
}
