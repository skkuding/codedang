package testcase

import (
	"fmt"

	"github.com/skkuding/codedang/apps/iris/src/loader"
)

type TestcaseManager interface {
	GetTestcase(problemId string) (Testcase, error)
}

type testcaseManager struct {
	database loader.Read
}

func NewTestcaseManager(database loader.Read) *testcaseManager {
	return &testcaseManager{database: database}
}

func (t *testcaseManager) GetTestcase(problemId string) (Testcase, error) {
	data, err := t.database.Get(problemId)
	if err != nil {
		return Testcase{}, fmt.Errorf("GetTestcase: %w", err)
	}

	testcase := Testcase{
		Elements: data,
	}

	return testcase, nil
}
