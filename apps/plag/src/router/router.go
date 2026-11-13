package router

import (
	"context"
	"fmt"

	instrumentation "github.com/skkuding/codedang/apps/plag/src"
	"github.com/skkuding/codedang/apps/plag/src/handler"
	"github.com/skkuding/codedang/apps/plag/src/router/response"
	"github.com/skkuding/codedang/apps/plag/src/service/logger"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/trace"
)

const (
	Check = "check"
)

type Router interface {
	Route(path string, id string, data []byte, resultChan chan<- response.Response, ctx context.Context)
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

func (r *router) Route(path string, id string, data []byte, out chan<- response.Response, ctx context.Context) {
	send := func(result *response.CheckResponse) {
		select {
		case out <- response.Response{Message: result.Marshal(), Type: path}:
		case <-ctx.Done():
		}
	}
	if path == "" {
		send(response.NewCheckResponse("", nil, fmt.Errorf("type(message property) must not be empty")))
		return
	}
	if id == "" {
		send(response.NewCheckResponse("", nil, fmt.Errorf("message_id(message property) must not be empty")))
		return
	}
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

	// Handle emits one result; buffering lets it finish after the connector times out.
	checkChan := make(chan handler.CheckResultMessage, 1)
	switch path { // 나중에 추가 작업을 지정할 수 있도록 각 메시지 타입을 구분
	case Check:
		go r.checkHandler.Handle(id, data, checkChan, newCtx)
	default:
		err := fmt.Errorf("invalid request type: %s", path)
		r.errHandle(err)
		send(response.NewCheckResponse(id, nil, err))
		return
	}

	for {
		select {
		case result, open := <-checkChan:
			if !open {
				r.logger.Log(logger.DEBUG, "Router done...")
				return
			}
			r.errHandle(result.Err)
			send(response.NewCheckResponse(id, result.Result, result.Err))
		case <-newCtx.Done():
			return
		}
	}
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
