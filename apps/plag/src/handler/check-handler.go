package handler

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"strconv"
	"time"

	instrumentation "github.com/skkuding/codedang/apps/plag/src"
	"github.com/skkuding/codedang/apps/plag/src/common/constants"
	"github.com/skkuding/codedang/apps/plag/src/common/result"
	"github.com/skkuding/codedang/apps/plag/src/service/check"
	"github.com/skkuding/codedang/apps/plag/src/service/file"
	"github.com/skkuding/codedang/apps/plag/src/service/logger"
	"github.com/skkuding/codedang/apps/plag/src/service/sandbox"
	"github.com/skkuding/codedang/apps/plag/src/utils"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/trace"
)

type Request struct {
	ProblemId               int    `json:"problemId"`
	Language                string `json:"language"`
	MinimumTokens           int    `json:"minTokens"`
	EnableMerging           bool   `json:"enableMerging"`
	UseJplagClustering      bool   `json:"useJplagClustering"`
	AssignmentId            *int   `json:"assignmentId,omitempty"`
	ContestId               *int   `json:"contestId,omitempty"`
	WorkbookId              *int   `json:"workbookId,omitempty"`
}

type CheckResult struct {
	JplagOut                string `json:"jplagOutput"`
}

type CheckResultMessage struct {
	Result json.RawMessage
	Err    error
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

var ErrCheckEnd = errors.New("check handle end")

type CheckHandler struct {
	check  check.CheckManager
	file   file.FileManager
	logger logger.Logger
	tracer trace.Tracer
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
	handleCtx, childSpan := c.tracer.Start( //handleCtx is unused until now...
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

	err := json.Unmarshal(data, &req) // json 파싱

	if err != nil {
		out <- CheckResultMessage{nil, &HandlerError{
        caller:  "handle",
        err:     fmt.Errorf("%w: %s", ErrMarshalJson, err),
        level:   logger.ERROR,
        Message: err.Error(),
      },
    }
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
      },
    }
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
      },
    }
		return
	}

	subDir := dir + "/submission"
	if err := c.file.CreateDir(subDir); err != nil { // 작업용 임시 제출물 디렉토리 생성
		out <- CheckResultMessage{nil, &HandlerError{
        caller:  "handle",
        err:     fmt.Errorf("creating submission directory: %w", err),
        level:   logger.ERROR,
        Message: err.Error(),
      },
    }
		return
	}

	resDir := dir + "/result"
	if err := c.file.CreateDir(resDir); err != nil { // 작업용 임시 결과물 디렉토리 생성
		out <- CheckResultMessage{nil, &HandlerError{
        caller:  "handle",
        err:     fmt.Errorf("creating result directory: %w", err),
        level:   logger.ERROR,
        Message: err.Error(),
      },
    }
		return
	}

	checkInputCh := make(chan result.ChResult)
	go c.getCheckInput(handleCtx, checkInputCh, req)

	checkInput := <-checkInputCh
	if checkInput.Err != nil {
		out <- CheckResultMessage{nil, &HandlerError{
        caller:  "handle",
        err:     fmt.Errorf("getCheckInput error: %s", checkInput.Err),
        level:   logger.ERROR,
        Message: checkInput.Err.Error(),
      },
    }
		return
	}

	chIn, ok := checkInput.Data.(check.CheckInput) // 검사 입력 데이터
	if !ok {
		out <- CheckResultMessage{nil, &HandlerError{
        caller: "handle",
        err:    fmt.Errorf("%w: CheckInput", ErrTypeAssertionFail),
        level:  logger.ERROR,
      },
    }
		return
	}

	langExt := sandbox.Language(req.Language).GetLangExt() // 언어 확장자

	for _, sub := range chIn.Elements { // 제출물 코드 파일 생성
		fileName := getSubmissionFileName(fmt.Sprint(sub.Id), langExt)
		srcPath := c.file.MakeFilePath(subDir, fileName).String() //submission 저장

		if err != nil {
			out <- CheckResultMessage{nil, &HandlerError{
          caller:  "handle",
          err:     fmt.Errorf("parsing code: %w", err),
          level:   logger.ERROR,
          Message: err.Error(),
        },
      }
			return
		}

		if err := c.file.CreateFile(srcPath, sub.Code); err != nil {
			out <- CheckResultMessage{nil, &HandlerError{
          caller:  "handle",
          err:     fmt.Errorf("creating submission file: %w", err),
          level:   logger.ERROR,
          Message: err.Error(),
        },
      }
			return
		}
	}

	fileName := getSubmissionFileName("baseCode", langExt)
	var baseCodePath *string
	if chIn.HasBase {
		path := c.file.MakeFilePath(dir, fileName).String() // base code 저장

		baseCodePath = &path

		if err := c.file.CreateFile(path, chIn.BaseCode); err != nil {
			out <- CheckResultMessage{nil, &HandlerError{
          caller:  "handle",
          err:     fmt.Errorf("creating base code file: %w", err),
          level:   logger.ERROR,
          Message: err.Error(),
        },
      }
			return
		}
	}

	checkSetting := check.CheckSettings{
		MinTokens:               req.MinimumTokens,
		EnableMerging:           req.EnableMerging,
		UseJplagClustering:      req.UseJplagClustering,
	}

	jplagOut, err := c.check.CheckPlagiarismRate( // 표절 검사
		c.file.GetBasePath(subDir),
		baseCodePath,
		c.file.GetBasePath(resDir),
		sandbox.Language(req.Language).GetLangExt(),
		checkSetting,
	)

  if err != nil {
		out <- CheckResultMessage{nil, &HandlerError{
        caller:  "handle",
        err:     fmt.Errorf("%w: %s", ErrRunJPlag, err),
        level:   logger.ERROR,
        Message: err.Error(),
      },
    }
		return
	}

  if err := c.check.AnalyzeJplagOut(jplagOut); err != nil {
    out <- CheckResultMessage{nil, &HandlerError{
        caller:  "handle",
        err:     fmt.Errorf("%w: %s", ErrSmallTokens, err),
        level:   logger.ERROR,
        Message: err.Error(),
      },
    }
		return
  }

	if err := c.file.Unzip( // 검사 결과물 압축 해제
		c.file.MakeFilePath(dir, "result.jplag").String(),
		c.file.GetBasePath(resDir),
	); err != nil { // 파일 압축 해제 실패 시
		out <- CheckResultMessage{nil, &HandlerError{
        caller:  "handle",
        err:     fmt.Errorf("unzip jplag file: %w", err),
        level:   logger.ERROR,
        Message: err.Error(),
      },
    }
		return
	}

	comparisonCh := make(chan result.ChResult)
	go c.readComparisons(handleCtx, comparisonCh, resDir)

	comparison := <-comparisonCh
	if comparison.Err != nil {
		out <- CheckResultMessage{nil, &HandlerError{
        caller:  "handle",
        err:     fmt.Errorf("readComparisons error: %s", comparison.Err),
        level:   logger.ERROR,
        Message: comparison.Err.Error(),
      },
    }
		return
	}

  comps, ok := comparison.Data.([]check.ComparisonWithID)
	if !ok {
		out <- CheckResultMessage{nil, &HandlerError{
        caller: "handle",
        err:    fmt.Errorf("%w: ComparisonWithID", ErrTypeAssertionFail),
        level:  logger.ERROR,
      },
    }
		return
	}

  var clus []check.ClusterWithID = nil
  if req.UseJplagClustering {
    clustersCh := make(chan result.ChResult)
    go c.readClusters(handleCtx, clustersCh, resDir)

    clusters := <-clustersCh
    if clusters.Err != nil {
      out <- CheckResultMessage{nil, &HandlerError{
        caller:  "handle",
        err:     fmt.Errorf("readClusters error: %s", clusters.Err),
        level:   logger.ERROR,
        Message: clusters.Err.Error(),
      },
    }
      return
    }

    clus, ok = clusters.Data.([]check.ClusterWithID)
    if !ok {
      out <- CheckResultMessage{nil, &HandlerError{
          caller: "handle",
          err:    fmt.Errorf("%w: Cluster", ErrTypeAssertionFail),
          level:  logger.ERROR,
        },
      }
      return
    }
  }

	if err := c.check.SaveResult(
    id,
		comps,
		clus,
	); err != nil {
		out <- CheckResultMessage{nil, &HandlerError{
        caller:  "handle",
        err:     fmt.Errorf("save check result in bucket: %w", err),
        level:   logger.ERROR,
        Message: err.Error(),
      },
    }
		return
	}

  result := CheckResult{string(jplagOut)}
  r, err := json.Marshal(result)

  if err != nil {
		out <- CheckResultMessage{nil, &HandlerError{
        caller:  "handle",
        err:     fmt.Errorf("%w: %s", ErrMarshalJson, err),
        level:   logger.ERROR,
        Message: err.Error(),
      },
    }
		return
	}

  out <- CheckResultMessage{r, nil}
}

func (c *CheckHandler) getCheckInput(ctx context.Context, out chan<- result.ChResult, req Request) {
	_, childSpan := c.tracer.Start(
		ctx,
		instrumentation.GetSemanticSpanName("check-handler", "getCheckInput"),
	)
	defer childSpan.End()

	isAssignmentRequest := req.AssignmentId != nil
	isContestRequest := req.ContestId != nil
	isWorkbookRequest := req.WorkbookId != nil

	var res check.CheckInput
	var err error
	if isAssignmentRequest && !isContestRequest && !isWorkbookRequest {
		res, err = c.check.GetAssignmentCheckInput(
			fmt.Sprint(*req.AssignmentId),
			fmt.Sprint(req.ProblemId),
			req.Language,
		)
	} else if !isAssignmentRequest && isContestRequest && !isWorkbookRequest {
		res, err = c.check.GetContestCheckInput(
			fmt.Sprint(*req.ContestId),
			fmt.Sprint(req.ProblemId),
			req.Language,
		)
	} else if !isAssignmentRequest && !isContestRequest && isWorkbookRequest {
		res, err = c.check.GetWorkbookCheckInput(
			fmt.Sprint(*req.WorkbookId),
			fmt.Sprint(req.ProblemId),
			req.Language,
		)
	} else {
		out <- result.ChResult{Err: fmt.Errorf("cannot inference dependent of problem")}
		return
	}

	if err != nil {
		out <- result.ChResult{Err: err}
		return
	}

	out <- result.ChResult{Data: res}
}

func (c *CheckHandler) readComparisons(ctx context.Context, out chan<- result.ChResult, resDir string) {
	_, childSpan := c.tracer.Start(
		ctx,
		instrumentation.GetSemanticSpanName("check-handler", "readComparisons"),
	)
	defer childSpan.End()

	comparisonDir := resDir + "/comparisons"
	fileNames, err := c.file.CollectFiles(
    c.file.GetBasePath(comparisonDir),
  )
	if err != nil {
		out <- result.ChResult{Err: err}
		return
	}

	comps := []check.ComparisonWithID{}

	for _, fileName := range fileNames {
		filePath := c.file.MakeFilePath(comparisonDir, fileName).String()
		data, err := c.file.ReadFile(filePath)
		if err != nil {
			out <- result.ChResult{Err: err}
			return
		}

		comparison := check.Comparison{}
		err = json.Unmarshal(data, &comparison)
		if err != nil {
			out <- result.ChResult{Err: err}
			return
		}

		comp, err := comparison.ToComparisonWithID()
		if err != nil {
			out <- result.ChResult{Err: err}
			return
		}

		comps = append(comps, comp)
	}

	out <- result.ChResult{Data: comps}
}

func (c *CheckHandler) readClusters(ctx context.Context, out chan<- result.ChResult, resDir string) {
	_, childSpan := c.tracer.Start(
		ctx,
		instrumentation.GetSemanticSpanName("check-handler", "readClusters"),
	)
	defer childSpan.End()

	filePath := c.file.MakeFilePath(resDir, "cluster.json").String()
	data, err := c.file.ReadFile(filePath)
	if err != nil {
		out <- result.ChResult{Err: err}
		return
	}

	clusters := []check.Cluster{}
	err = json.Unmarshal(data, &clusters)
	if err != nil {
		out <- result.ChResult{Err: err}
		return
	}

  clustersWID := []check.ClusterWithID{}
  for _, cluster := range clusters {
    cwi, err := cluster.ToClusterWithID()
    if err != nil {
      out <- result.ChResult{Err: err}
      return
    }
    clustersWID = append(clustersWID, cwi)
  }

	out <- result.ChResult{Data: clustersWID}
}

func getSubmissionFileName(id string, langExt string) string {
	var b bytes.Buffer
	b.WriteString(id)
	b.WriteString(".")
	b.WriteString(langExt)
	return b.String()
}
