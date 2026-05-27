package check

import (
	"encoding/json"
	"fmt"
	"os/exec"
	"strings"

	"github.com/skkuding/codedang/apps/plag/src/loader"
)

type CheckManager interface {
	CheckPlagiarismRate(
		subDir string,
		basePath *string,
		resultDir string,
		langExt string,
		settings CheckSettings,
	) ([]byte, error)
	GetAssignmentCheckInput(
		assignmentId string,
		problemId string,
		language string,
	) (CheckInput, error)
	GetContestCheckInput(
		contestId string,
		problemId string,
		language string,
	) (CheckInput, error)
	GetWorkbookCheckInput(
		workbookId string,
		problemId string,
		language string,
	) (CheckInput, error)
	SaveResult(
    checkId string,
		comparisons []ComparisonWithID,
		clusters []ClusterWithID,
	) error
  AnalyzeJplagOut(out []byte) error
}

type checkManager struct {
	database  *loader.Postgres
	s3reader  *loader.S3reader
	jplagPath string
}

type CheckSettings struct {
	MinTokens               int
	EnableMerging           bool
	UseJplagClustering      bool
}

func NewCheckManager(s3reader *loader.S3reader, database *loader.Postgres, jplagPath string) *checkManager {
	return &checkManager{s3reader: s3reader, database: database, jplagPath: jplagPath}
}

func getCheckInput(baseCode string, element []loader.Element, err error) (CheckInput, error) {
	if err != nil {
		return CheckInput{}, fmt.Errorf("error raised in GetAllCodesFrom Somewhere: %w", err)
	}

	return CheckInput{BaseCode: baseCode, Elements: element, HasBase: baseCode != ""}, nil
}

func (c *checkManager) GetAssignmentCheckInput(
	assignmentId string,
	problemId string,
	language string,
) (CheckInput, error) { // 문제 아이디, 과제 아이디를 바탕으로 submission을 가져와 jplag 실행을 준비합니다.
	return getCheckInput(
		c.database.GetAllCodesFromAssignment(problemId, language, assignmentId),
	)
}

func (c *checkManager) GetContestCheckInput(
	contestId string,
	problemId string,
	language string,
) (CheckInput, error) { // 문제 아이디, 과제 아이디를 바탕으로 submission을 가져와 jplag 실행을 준비합니다.
	return getCheckInput(
		c.database.GetAllCodesFromContest(problemId, language, contestId),
	)
}

func (c *checkManager) GetWorkbookCheckInput(
	workbookId string,
	problemId string,
	language string,
) (CheckInput, error) { // 문제 아이디, 과제 아이디를 바탕으로 submission을 가져와 jplag 실행을 준비합니다.
	return getCheckInput(
		c.database.GetAllCodesFromWorkbook(problemId, language, workbookId),
	)
}

func (c *checkManager) CheckPlagiarismRate( // 요청된 설정에 맞춰 실제 jplag 작업을 실행합니다.
	subDir string,
	basePath *string,
	resultDir string,
	langExt string,
	settings CheckSettings,
) ([]byte, error) {
  jplagCommandArgs := []string{
    "-jar", c.jplagPath,
    "--mode", "run",
    "-l", langExt,
    subDir,
    "-r", resultDir,
	"-t", fmt.Sprintf("%d", settings.MinTokens),
  }

  // TODO: 이전 학기 혹은 이전 대회에서 해당 문제에 대해 제출된 코드도 참고해 표절 여부를 검사해야 합니다.
  /*if settings.CheckPreviousSubmission {
    jplagCommandArgs = append(jplagCommandArgs, "-old", previousSubmissionsPath)
	}*/

	if basePath != nil {
    jplagCommandArgs = append(jplagCommandArgs, "-bc", *basePath)
	}

	if settings.EnableMerging {
    jplagCommandArgs = append(jplagCommandArgs, "--match-merging")
	}

	if settings.UseJplagClustering {
    jplagCommandArgs = append(jplagCommandArgs, "--cluster-alg", "spectral")
	}

  cmd := exec.Command("java", jplagCommandArgs...)
	out, err := cmd.CombinedOutput()
	if err != nil {
		return out, fmt.Errorf("running jplag command error: %w, out: %s", err, string(out))
	}
  return out, nil
}

func (c *checkManager) AnalyzeJplagOut(out []byte) error {
  outStr := string(out)
  for _, outLine := range strings.Split(outStr, "\n") {
    if strings.Contains(outLine, "[ERROR]") {
      return fmt.Errorf("error detected in jplag output: %s", outLine)
    }
  }
  return nil
}

func (c *checkManager) SaveResult(
  checkId string,
	comparisons []ComparisonWithID,
	clusters []ClusterWithID,
) error {
  compJson, err := json.Marshal(comparisons)
  if err != nil {
    return fmt.Errorf("json-parsing comparison error: %w", err)
  }
  if err := c.s3reader.Save(
    compJson,
    fmt.Sprintf("comparison%s.json", checkId),
  ); err != nil{
    return fmt.Errorf("comparsion object upload error: %w", err)
  }

  if clusters != nil{
    clusJson, err := json.Marshal(clusters)
    if err != nil {
      return fmt.Errorf("json-parsing clusters error: %w", err)
    }
    if err := c.s3reader.Save(
      clusJson,
      fmt.Sprintf("cluster%s.json", checkId),
    ); err != nil{
      return fmt.Errorf("clusters object upload error: %w", err)
    }
  }
	return nil
}
