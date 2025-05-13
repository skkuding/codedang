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
		err1 := fmt.Errorf("GetTestcase: %w", err) // REMOVE ME
		data, err = t.database.Get(problemId)
		if err != nil {
			err2 := fmt.Errorf("GetTestcase: %w", err) // REMOVE ME
			// Log the error            // REMOVE ME
			fmt.Println("Error:", err1) // REMOVE ME
			fmt.Println("Error:", err2) // REMOVE ME
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
