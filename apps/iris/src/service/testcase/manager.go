package testcase

import (
	"fmt"

	"github.com/skkuding/codedang/apps/iris/src/loader"
)

type TestcaseManager interface {
	GetTestcase(problemId string, testcaseFilter TestcaseFilterCode) (Testcase, error)
}

type testcaseManager struct {
	database *loader.Postgres
	s3reader *loader.S3reader
}

func NewTestcaseManager(s3reader *loader.S3reader, database *loader.Postgres) *testcaseManager {
	return &testcaseManager{s3reader: s3reader, database: database}
}

func (t *testcaseManager) GetTestcase(problemId string, testcaseFilter TestcaseFilterCode) (Testcase, error) {
	data, err := t.s3reader.Get(problemId)
	if err != nil {
		data, err = t.database.Get(problemId)
		if err != nil {
			return Testcase{}, fmt.Errorf("GetTestcase: %w", err)
		}
	}

	var predicate func(element loader.Element) bool

	switch testcaseFilter {
	case PUBLIC_ONLY:
		predicate = func(element loader.Element) bool { return !element.Hidden }
	case HIDDEN_ONLY:
		predicate = func(element loader.Element) bool { return element.Hidden }
	}

	if predicate != nil {
		var filtered []loader.Element
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
