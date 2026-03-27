package testcase

import (
	"fmt"

	"github.com/skkuding/codedang/apps/iris/src/loader"
	"github.com/skkuding/codedang/apps/iris/src/service/logger"
)

type TestcaseManager interface {
	GetTestcase(problemId string, testcaseFilter TestcaseFilterCode) (Testcase, error)
	SaveTestcase(problemId string, hidden bool, data []loader.ElementIn) error
}

type testcaseManager struct {
	database *loader.Postgres
	s3reader *loader.S3reader
	logger   logger.Logger
}

func NewTestcaseManager(
	s3reader *loader.S3reader,
	database *loader.Postgres,
	logProvider logger.Logger,
) *testcaseManager {
	return &testcaseManager{
		s3reader: s3reader,
		database: database,
		logger:   logProvider,
	}
}

func (t *testcaseManager) SaveTestcase(problemId string, hidden bool, data []loader.ElementIn) error {
	t.logger.Log(
		logger.INFO,
		fmt.Sprintf("testcase.save.start problem_id=%s hidden=%t count=%d", problemId, hidden, len(data)),
	)
	for i := range data {
		data[i].ProblemId = problemId
		data[i].Hidden = hidden
	}
	if err := t.database.Save(data); err != nil {
		t.logger.Log(
			logger.ERROR,
			fmt.Sprintf(
				"testcase.save.failed problem_id=%s hidden=%t count=%d err=%v",
				problemId,
				hidden,
				len(data),
				err,
			),
		)
		return fmt.Errorf("SaveTestcase: %w", err)
	}
	t.logger.Log(
		logger.INFO,
		fmt.Sprintf("testcase.save.done problem_id=%s hidden=%t count=%d", problemId, hidden, len(data)),
	)
	return nil
}

func (t *testcaseManager) GetTestcase(problemId string, testcaseFilter TestcaseFilterCode) (Testcase, error) {
	data, err := t.s3reader.Get(problemId)
	if err != nil {
		data, err = t.database.Get(problemId)
		if err != nil {
			return Testcase{}, fmt.Errorf("GetTestcase: %w", err)
		}
	}

	var predicate func(element loader.ElementOut) bool

	switch testcaseFilter {
	case PUBLIC_ONLY:
		predicate = func(element loader.ElementOut) bool { return !element.Hidden }
	case HIDDEN_ONLY:
		predicate = func(element loader.ElementOut) bool { return element.Hidden }
	}

	if predicate != nil {
		var filtered []loader.ElementOut
		for _, testcase := range data {
			if predicate(testcase) {
				filtered = append(filtered, testcase)
			}
		}
		data = filtered
	}

	testcase := Testcase{
		Elements: data,
	}

	return testcase, nil
}
