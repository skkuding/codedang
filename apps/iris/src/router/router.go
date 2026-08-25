package router

import (
	"context"
	"errors"
	"fmt"

	instrumentation "github.com/skkuding/codedang/apps/iris/src"
	"github.com/skkuding/codedang/apps/iris/src/common/constants"
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

type Router interface {
	Route(path constants.MessageType, id string, data []byte, resultChan chan<- response.Response, ctx context.Context)
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

type taskResult struct {
	message     handler.ResultMessage
	messageType []constants.MessageType
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

func (r *router) Route(path constants.MessageType, id string, data []byte, out chan<- response.Response, ctx context.Context) {
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

	taskResultChan := make(chan taskResult)
	var task handler.Task
	var taskErr error

	r.logger.Log(logger.INFO, fmt.Sprintf("%s message received", path))
	switch path {
	case constants.Judge, constants.SpecialJudge:
		task, taskErr = r.judgeTaskFactory.Create(string(path), data)
	case constants.Run, constants.UserTestCase:
		task, taskErr = r.runTaskFactory.Create(string(path), data)
	case constants.Generate:
		task, taskErr = r.generateTaskFactory.Create(string(path), data)
	case constants.Validate:
		task, taskErr = r.validateTaskFactory.Create(string(path), data)
	case constants.Check:
		// task, taskErr = r.checkTaskFactory.Create(path, data)
		// TODO: implement check factory
		taskErr = fmt.Errorf("check handler not implemented yet")
	default:
		taskErr = fmt.Errorf("invalid request type: %s", path)
	}

	sender, responseErr := response.NewSender(ctx, out, path, id, data, r.logger)
	if responseErr != nil {
		if sender == nil {
			r.logger.Log(logger.ERROR, fmt.Sprintf("unsupported response path %s with id %s: %v", path, id, responseErr))
			return
		}
		r.logger.Log(logger.WARN, fmt.Sprintf("failed to decode response metadata for path %s with id %s: %v", path, id, responseErr))
	}

	if taskErr != nil {
		r.logger.Log(logger.ERROR, fmt.Sprintf("Error creating task for path %s: %v", path, taskErr))
		r.errHandle(taskErr)
		if !sender.Send(handler.ResultMessage{Err: taskErr}) {
			return
		}
		if isSubmissionTask(path) {
			judgeResponse := response.NewJudgeResponse(id, nil, taskErr)
			sender.Send(handler.ResultMessage{
				EncodedResponse: response.NewSubmissionResponse(id, []*response.JudgeResponse{judgeResponse}).Marshal(),
			}, constants.Submission)
		}
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
		r.runner.Run(newCtx, id, task, func(result handler.ResultMessage, messageType ...constants.MessageType) {
			select {
			case taskResultChan <- taskResult{message: result, messageType: messageType}:
			case <-newCtx.Done():
			}
		})
	}()

	for result := range taskResultChan {
		r.errHandle(result.message.Err)
		if !sender.Send(result.message, result.messageType...) {
			return
		}
	}
	r.logger.Log(logger.DEBUG, "Router done...")
}

func isSubmissionTask(path constants.MessageType) bool {
	switch path {
	case constants.Judge, constants.SpecialJudge, constants.Run, constants.UserTestCase:
		return true
	default:
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
