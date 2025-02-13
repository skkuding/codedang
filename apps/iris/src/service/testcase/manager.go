package testcase

import (
	"fmt"

	"github.com/skkuding/codedang/apps/iris/src/loader"
)

type TestcaseManager interface {
	GetTestcase(problemId string, hidden bool) (Testcase, error)
}

type testcaseManager struct {
	source loader.Read
}

func NewTestcaseManager(source loader.Read) *testcaseManager {
	return &testcaseManager{source: source}
}

func (t *testcaseManager) GetTestcase(problemId string, hidden bool) (Testcase, error) {
	data, err := t.source.Get(problemId)
	if err != nil {
		return Testcase{}, fmt.Errorf("GetTestcase: %w", err)
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
