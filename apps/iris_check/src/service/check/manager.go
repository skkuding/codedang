package check

import (
	"fmt"

	"github.com/skkuding/codedang/apps/iris_check/src/loader"
)

type CheckManager interface {
	CheckPlagiarismRate(
    problemId string,
    dependentId string,
    language string,
    settings CheckSettings,
  ) (error)
}

type checkManager struct {
	database *loader.Postgres
	s3reader *loader.S3reader
}

type CheckSettings struct {
  MinTokens int
  CheckPreviousSubmission bool
  EnableMerging bool
  UseJplagClustering bool
}

func NewCheckManager(s3reader *loader.S3reader, database *loader.Postgres) *checkManager {
	return &checkManager{s3reader: s3reader, database: database}
}

func (c *checkManager) PrepareSubmissions(){ // 문제 아이디, 과제 아이디를 바탕으로 submission을 가져와 jplag 실행을 준비합니다.

}

func (c *checkManager) CheckPlagiarismRate( // 요청된 설정에 맞춰 실제 jplag 작업을 실행합니다.
  problemId string,
  dependentId string,
  language string,
  settings CheckSettings,
  ) (error){
  submissions, err := c.database.GetAllCodes(problemId, language)


  return nil
}
