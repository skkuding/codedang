package check

import (
	"fmt"
	"os/exec"

	"github.com/skkuding/codedang/apps/iris_check/src/loader"
	"github.com/skkuding/codedang/apps/iris_check/src/utils"
)

type CheckManager interface {
	CheckPlagiarismRate(
    subDir string,
    basePath *string,
    resultDir string,
    langExt string,
    settings CheckSettings,
  ) (error)
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
    comparisons []ComparisonWithID,
    clusters []Cluster,
    checkSettings CheckSettings,
  ) (error)
}

type checkManager struct {
	database *loader.Postgres
	s3reader *loader.S3reader
  jplagPath string
}

type CheckSettings struct {
  MinTokens int
  CheckPreviousSubmission bool
  EnableMerging bool
  UseJplagClustering bool
}

func NewCheckManager(s3reader *loader.S3reader, database *loader.Postgres, jplagPath string) *checkManager {
	return &checkManager{s3reader: s3reader, database: database, jplagPath: jplagPath}
}

func getCheckInput(rawBaseCode string, element []loader.Element, err error) (CheckInput, error) {
  if err != nil {
    return CheckInput{}, fmt.Errorf("GetAllCodesFromAssignment: %w", err)
  }
  if rawBaseCode == "" || rawBaseCode == "{}" {
    return CheckInput{BaseCode: "", Elements: element, HasBase: false}, nil
  }
  baseCode, err := utils.ParseRawCode(rawBaseCode)
  if err != nil {
    return CheckInput{}, fmt.Errorf("ParseRawCode: %w", err)
  }
  return CheckInput{BaseCode: baseCode, Elements: element, HasBase: true}, nil
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
  ) (error){
  jplagCmd := fmt.Sprintf(
    `java -jar "%s" -l --mode run %s "%s" -r "%s"`,
    c.jplagPath,
    langExt,
    subDir,
    resultDir,
  )
  jplagCmd += fmt.Sprintf(` -t %d`, settings.MinTokens);

  /*if settings.CheckPreviousSubmission {
    //jplagCmd += ` -old "${previousSubmissionsPath}"`;
    // not prepared
  }*/

  if basePath != nil {
    jplagCmd += fmt.Sprintf(` -bc "%s"`, *basePath);
  }

  if settings.EnableMerging {
    jplagCmd += ` --match-merging`;
  }

  if settings.UseJplagClustering {
    jplagCmd += ` --cluster-alg spectral`;
  }

  println("Command:", jplagCmd)

  cmd := exec.Command(jplagCmd)
  err := cmd.Start()
  if err != nil {
    return fmt.Errorf("running jplag command error: %w", err)
  }

  return nil
}

func (c *checkManager) SaveResult(
  comparisons []ComparisonWithID,
  clusters []Cluster,
  checkSettings CheckSettings,
  ) (error) {
  return nil
}
