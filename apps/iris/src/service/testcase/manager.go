package testcase

import (
	"fmt"

	"github.com/skkuding/codedang/apps/iris/src/loader"
)

type TestcaseManager interface {
	GetTestcase(problemId string, hidden bool) (Testcase, error)
}

type testcaseManager struct {
	database *loader.Postgres
	s3reader *loader.S3reader
}

func NewTestcaseManager(s3reader *loader.S3reader, database *loader.Postgres) *testcaseManager {
	return &testcaseManager{s3reader: s3reader, database: database}
}

func (t *testcaseManager) GetTestcase(problemId string, hidden bool) (Testcase, error) {
	data, err := t.s3reader.Get(problemId)
	if err != nil {
		data, err = t.database.Get(problemId)
		if err != nil {
			return Testcase{}, fmt.Errorf("GetTestcase: %w", err)
		}
	}

	if !hidden {
		var openTestcases []loader.Element

		for _, testcase := range data {
			if !testcase.Hidden {
				openTestcases = append(openTestcases, testcase)
			}
		}

		data = openTestcases
	}

	testcase := Testcase{
		Elements: data,
	}

	return testcase, nil
}
