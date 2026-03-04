package router

import (
	"context"
	"fmt"

	instrumentation "github.com/skkuding/codedang/apps/iris/src"
	"github.com/skkuding/codedang/apps/iris/src/handler"
	"github.com/skkuding/codedang/apps/iris/src/handler/generate"
	"github.com/skkuding/codedang/apps/iris/src/handler/judge"
	"github.com/skkuding/codedang/apps/iris/src/handler/run"
	"github.com/skkuding/codedang/apps/iris/src/handler/validate"
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
	Generate     = "generate"
	Validate     = "validate"
)

type Router interface {
	// Route(path string, id string, data []byte, resultChan chan []byte) []byte
	Route(path string, id string, data []byte, resultChan chan []byte, ctx context.Context)
}

type router struct {
	runner              *handler.TaskRunner
	judgeTaskFactory    *judge.Factory
	runTaskFactory      *run.Factory
	generateTaskFactory *generate.Factory
	validateTaskFactory *validate.Factory
	logger              logger.Logger
	tracer              trace.Tracer
}

func NewRouter(
	runner *handler.TaskRunner,
	judgeTaskFactory *judge.Factory,
	runTaskFactory *run.Factory,
	generateTaskFactory *generate.Factory,
	validateTaskFactory *validate.Factory,
	logger logger.Logger,
	tracer trace.Tracer,
) Router {
	return &router{
		runner,
		judgeTaskFactory,
		runTaskFactory,
		generateTaskFactory,
		validateTaskFactory,
		logger,
		tracer,
	}
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

	taskResultChan := make(chan handler.ResultMessage)
	var task handler.Task
	var taskErr error

	switch path {
	case Judge:
		task, taskErr = r.judgeTaskFactory.Create(path, data)
	case Run, UserTestCase:
		task, taskErr = r.runTaskFactory.Create(path, data)
	case SpecialJudge:
	case Generate:
		task, taskErr = r.generateTaskFactory.Create(path, data)
	case Validate:
		task, taskErr = r.validateTaskFactory.Create(path, data)
	default:
		taskErr = fmt.Errorf("invalid request type: %s", path)
	}

	if taskErr != nil {
		r.errHandle(taskErr)
		out <- NewResponse(id, nil, taskErr).Marshal()
		close(out)
		return
	}

	if task != nil {
		go r.runner.Run(id, task, taskResultChan, newCtx)
	} else {
		close(taskResultChan)
	}
	for result := range taskResultChan {
		r.errHandle(result.Err)
		out <- NewResponse(id, result.Result, result.Err).Marshal()
		// break
	}
	// return NewResponse(id, handlerResult, err).Marshal()
	close(out)
	r.logger.Log(logger.DEBUG, "Router done...")
}

func (r *router) errHandle(err error) {
	if err != nil {
		if u, ok := err.(*handler.HandlerError); ok {
			r.logger.Log(u.Level(), err.Error())
		} else {
			r.logger.Log(logger.ERROR, fmt.Sprintf("router: %s", err.Error()))
		}
	}
}
