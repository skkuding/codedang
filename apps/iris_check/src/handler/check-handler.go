package handler

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"strconv"
	"time"

	instrumentation "github.com/skkuding/codedang/apps/iris_check/src"
	"github.com/skkuding/codedang/apps/iris_check/src/common/constants"
	"github.com/skkuding/codedang/apps/iris_check/src/service/file"
  "github.com/skkuding/codedang/apps/iris_check/src/service/sandbox"
	"github.com/skkuding/codedang/apps/iris_check/src/service/logger"
  "github.com/skkuding/codedang/apps/iris_check/src/service/check"
	"github.com/skkuding/codedang/apps/iris_check/src/utils"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/trace"
)

type Request struct {
	CheckId                  string            `json:"checkId"`
	ProblemId                int               `json:"problemId"`
  Language                 string            `json:"language"`
	MinimumTokens            int               `json:"minTokens"`
	CheckPreviousSubmission  bool              `json:"checkPreviousSubmission"`
	EnableMerging            bool              `json:"enableMerging"`
	UseJplagClustering       bool              `json:"useJplagClustering"`
	AssignmentId             *int               `json:"assignmentId,omitempty"`
	ContestId                *int               `json:"contestId,omitempty"`
	WorkbookId               *int               `json:"workbookId,omitempty"`
}

func (r Request) Validate() (*Request, error) {
	if r.ProblemId == 0 {
		return nil, fmt.Errorf("problemId must not be empty or zero")
	}
  if r.Language == "" {
		return nil, fmt.Errorf("language must not be empty")
	}
  if !sandbox.Language(r.Language).IsValid() {
		return nil, fmt.Errorf("unsupported language: %s", r.Language)
	}
  if r.MinimumTokens < 1 {
		return nil, fmt.Errorf("minTokens must be bigger than 0")
	}
	return &r, nil
}

type CheckResult struct {
	Signal     int    `json:"signal"`
	ExitCode   int    `json:"exitCode"`
	ErrorCode  int    `json:"errorCode"`
	Error      string `json:"error"`
}

type CheckResultMessage struct {
	Result json.RawMessage
	Err    error
}

var ErrCheckEnd = errors.New("check handle end")

type CheckHandler struct {
  check           check.CheckManager
  file            file.FileManager
	logger          logger.Logger
	tracer          trace.Tracer
}

func NewCheckHandler(
  check check.CheckManager,
  file file.FileManager,
	logger logger.Logger,
	tracer trace.Tracer,
) *CheckHandler {
	return &CheckHandler{
    check,
		file,
		logger,
		tracer,
	}
}

// handle top layer logical flow
func (c *CheckHandler) Handle(id string, data []byte, out chan CheckResultMessage, ctx context.Context) {
	startedAt := time.Now()
	_, childSpan := c.tracer.Start( //handleCtx is unused until now...
		ctx,
		instrumentation.GetSemanticSpanName("check-handler", "handle"),
		trace.WithAttributes(attribute.Int("checkId", func() int {
			checkId, _ := strconv.Atoi(id)
			return checkId
		}()),
		),
	)
	defer childSpan.End()

	//TODO: validation logic here
	req := Request{}

	err := json.Unmarshal(data, &req) // json 파싱...?

  // <Test Code>
  err = nil
  assignmentId := 1
  req = Request{
    CheckId: "202503321020",
    ProblemId: 1,
    Language: "C",
    MinimumTokens: 12,
    CheckPreviousSubmission: true,
    EnableMerging: false,
    UseJplagClustering: true,
    AssignmentId: &assignmentId,
  }

	if err != nil {
		out <- CheckResultMessage{nil, &HandlerError{
			caller:  "handle",
			err:     fmt.Errorf("%w: %s", ErrValidate, err),
			level:   logger.ERROR,
			Message: err.Error(),
		}}
		close(out)
		return
	}

	_, err = req.Validate() // 요청 검증
  //validReq is unused util now...
	if err != nil {
		out <- CheckResultMessage{nil, &HandlerError{
			caller:  "request validate",
			err:     fmt.Errorf("%w: %s", ErrValidate, err),
			level:   logger.ERROR,
			Message: err.Error(),
		}}
		close(out)
		return
	}

	dir := utils.RandString(constants.DIR_NAME_LEN) + id // 작업용 임시 디렉토리 이름 생성
	defer func() {
		c.file.RemoveDir(dir)
		close(out)
		c.logger.Log(logger.DEBUG, fmt.Sprintf("task %s done: total time: %s", dir, time.Since(startedAt)))
	}()

	if err := c.file.CreateDir(dir); err != nil { // 작업용 임시 디렉토리 생성
		out <- CheckResultMessage{nil, &HandlerError{
			caller:  "handle",
			err:     fmt.Errorf("creating base directory: %w", err),
			level:   logger.ERROR,
			Message: err.Error(),
		}}
		return
	}

  if err := c.check.CheckPlagiarismRate(
    fmt.Sprint(req.ProblemId),
    req.Language,
    check.CheckSettings{
      MinTokens: req.MinimumTokens,
      CheckPreviousSubmission: req.CheckPreviousSubmission,
      EnableMerging: req.EnableMerging,
      UseJplagClustering: req.UseJplagClustering,
    },
  ); err != nil { // 작업용 임시 디렉토리 생성
		out <- CheckResultMessage{nil, &HandlerError{
			caller:  "handle",
			err:     fmt.Errorf("creating base directory: %w", err),
			level:   logger.ERROR,
			Message: err.Error(),
		}}
		return
	}

  /*
  * 표절 검사 서버에 맞춰서 handler 구성 예정
  *
  */
}
