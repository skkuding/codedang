package router

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"

	instrumentation "github.com/skkuding/codedang/apps/iris/src"
	"github.com/skkuding/codedang/apps/iris/src/handler"
	"github.com/skkuding/codedang/apps/iris/src/handler/generate"
	"github.com/skkuding/codedang/apps/iris/src/handler/judge"
	"github.com/skkuding/codedang/apps/iris/src/handler/run"
	"github.com/skkuding/codedang/apps/iris/src/handler/validate"
	"github.com/skkuding/codedang/apps/iris/src/router/response"
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
	Check        = "check"
)

type Router interface {
	Route(path string, id string, data []byte, resultChan chan<- []byte, ctx context.Context)
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

func (r *router) Route(path string, id string, data []byte, out chan<- []byte, ctx context.Context) {
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

	r.logger.Log(logger.INFO, fmt.Sprintf("%s message received", path))
	switch path {
	case Judge, SpecialJudge:
		task, taskErr = r.judgeTaskFactory.Create(path, data)
	case Run, UserTestCase:
		task, taskErr = r.runTaskFactory.Create(path, data)
	case Generate:
		task, taskErr = r.generateTaskFactory.Create(path, data)
	case Validate:
		task, taskErr = r.validateTaskFactory.Create(path, data)
	case Check:
		// task, taskErr = r.checkTaskFactory.Create(path, data)
		// TODO: implement check factory
		taskErr = fmt.Errorf("check handler not implemented yet")
	default:
		taskErr = fmt.Errorf("invalid request type: %s", path)
	}

	preparedSender, prepareErr := response.PrepareSender(path, id, data)
	if prepareErr != nil {
		r.logger.Log(logger.WARN, fmt.Sprintf("failed to prepare response for path %s with id %s: %v", path, id, prepareErr))
	}
	sendPreparedResponse := func(result json.RawMessage, taskErr error) bool {
		data, marshalErr := preparedSender.Marshal(result, taskErr)
		if marshalErr == nil {
			return sendResponse(ctx, out, data)
		}

		r.logger.Log(logger.ERROR, fmt.Sprintf("failed to marshal response for path %s with id %s: %v", path, id, marshalErr))
		fallback, fallbackErr := response.MarshalFallback(preparedSender, marshalErr)
		if fallbackErr != nil {
			r.logger.Log(logger.ERROR, fmt.Sprintf("failed to marshal fallback response for path %s with id %s: %v", path, id, fallbackErr))
			return false
		}
		return sendResponse(ctx, out, fallback)
	}

	if taskErr != nil {
		r.logger.Log(logger.ERROR, fmt.Sprintf("Error creating task for path %s: %v", path, taskErr))
		r.errHandle(taskErr)
		sendPreparedResponse(nil, taskErr)
		return
	}

	if task == nil {
		r.logger.Log(logger.WARN, fmt.Sprintf("Task factory returned nil for path %s with id %s", path, id))
	} else {
		r.logger.Log(logger.INFO, fmt.Sprintf("Task successfully created for path %s with id %s: %s", path, id, task.GetDebugString()))
	}

	r.logger.Log(logger.INFO, fmt.Sprintf("Running task for path %s with id %s", path, id))
	go func() {
		defer close(taskResultChan)
		r.runner.Run(newCtx, id, task, func(result handler.ResultMessage) {
			select {
			case taskResultChan <- result:
			case <-newCtx.Done():
			}
		})
	}()

	for result := range taskResultChan {
		r.errHandle(result.Err)
		if result.Response != nil {
			if !sendResponse(ctx, out, result.Response) {
				return
			}
			continue
		}
		if !sendPreparedResponse(result.Result, result.Err) {
			return
		}
	}
	r.logger.Log(logger.DEBUG, "Router done...")
}

func sendResponse(ctx context.Context, out chan<- []byte, data []byte) bool {
	select {
	case out <- data:
		return true
	case <-ctx.Done():
		return false
	}
}

func (r *router) errHandle(err error) {
	if err != nil {
		var te *handler.TaskError
		if errors.As(err, &te) {
			r.logger.Log(te.Level, err.Error())
		} else {
			r.logger.Log(logger.ERROR, fmt.Sprintf("router: %s", err.Error()))
		}
	}
}
