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
	// ...
	case Generate:
		task, taskErr = r.generateTaskFactory.Create(path, data)
	case Validate:
		task, taskErr = r.validateTaskFactory.Create(path, data)
	case Check:
		// task, taskErr = r.checkTaskFactory.Create(path, data) // TODO: implement check factory
		taskErr = fmt.Errorf("check handler not implemented yet")
	default:
		taskErr = fmt.Errorf("invalid request type: %s", path)
	}

	var problemId int
	if isPolygonPath(path) {
		var p struct {
			ProblemId int `json:"problemId"`
		}
		if err := json.Unmarshal(data, &p); err != nil {
			r.logger.Log(logger.WARN, fmt.Sprintf("failed to extract problemId for path %s with id %s: %v", path, id, err))
		}
		problemId = p.ProblemId
	}

	if taskErr != nil {
		r.logger.Log(logger.ERROR, fmt.Sprintf("Error creating task for path %s: %v", path, taskErr))
		r.errHandle(taskErr)
		if isPolygonPath(path) {
			r.sendPolygonResponse(out, id, problemId, path, nil, taskErr)
		} else {
			out <- response.NewJudgeResponse(id, nil, taskErr).Marshal()
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
		r.runner.Run(newCtx, id, task, func(result handler.ResultMessage) {
			taskResultChan <- result
		})
	}()

	judgeResults := make([]*response.JudgeResponse, 0)
	for result := range taskResultChan {
		r.errHandle(result.Err)
		if isPolygonPath(path) {
			r.sendPolygonResponse(out, id, problemId, path, result.Result, result.Err)
		} else {
			judgeResponse := response.NewJudgeResponse(id, result.Result, result.Err)
			out <- judgeResponse.Marshal()
			judgeResults = append(judgeResults, judgeResponse)
		}
	}

	if !isPolygonPath(path) {
		out <- response.NewSubmissionResponse(id, judgeResults).Marshal()
	}
	r.logger.Log(logger.DEBUG, "Router done...")
}

func isPolygonPath(path string) bool {
	return path == Generate || path == Validate || path == Check
}

func (r *router) sendPolygonResponse(out chan<- []byte, id string, problemID int, path string, result json.RawMessage, taskErr error) {
	res, err := response.NewPolygonToolResponse(id, problemID, getToolType(path), result, taskErr).Marshal()
	if err == nil {
		out <- res
		return
	}

	r.logger.Log(logger.ERROR, fmt.Sprintf("failed to marshal Polygon response for path %s with id %s: %v", path, id, err))
	fallback, fallbackErr := response.NewPolygonToolResponse(
		id,
		problemID,
		getToolType(path),
		nil,
		handler.NewTaskError("router", handler.SERVER_ERROR, logger.ERROR, fmt.Errorf("marshal Polygon response: %w", err)),
	).Marshal()
	if fallbackErr != nil {
		r.logger.Log(logger.ERROR, fmt.Sprintf("failed to marshal fallback Polygon response for id %s: %v", id, fallbackErr))
		return
	}
	out <- fallback
}

func getToolType(path string) string {
	switch path {
	case Generate:
		return "generator"
	case Validate:
		return "validator"
	case Check:
		return "checker"
	default:
		return "unknown"
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
