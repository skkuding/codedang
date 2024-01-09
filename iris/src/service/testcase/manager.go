package testcase

import (
	"encoding/json"
	"fmt"

	"github.com/skkuding/codedang/iris/src/loader"
	"github.com/skkuding/codedang/iris/src/loader/cache"
)

type TestcaseManager interface {
	GetTestcase(problemId string, testcaseId int) (Testcase, error)
}

type testcaseManager struct {
	source loader.Read
	cache  cache.Cache
}

func NewTestcaseManager(source loader.Read, cache cache.Cache) *testcaseManager {
	return &testcaseManager{source: source, cache: cache}
}

func (t *testcaseManager) GetTestcase(problemId string, testcaseId int) (Testcase, error) {
	isExist, err := t.cache.IsExist(problemId)
	if err != nil {
		return Testcase{}, fmt.Errorf("GetTestcase: %w", err)
	}

	if !isExist {
		bytes, err := t.source.Get(problemId)
		if err != nil {
			return Testcase{}, fmt.Errorf("get testcase: %w", err)
		}

		elements := []Element{}
		err = json.Unmarshal(bytes, &elements) // validate
		if err != nil {
			return Testcase{}, fmt.Errorf("invalid testcase data: %w", err)
		}

		var testcase Testcase
		if testcaseId == 0 {
			testcase = Testcase{Elements: elements}
		} else {
			testcase = Testcase{Elements: elements[testcaseId : testcaseId+1]}
		}

		err = t.cache.Set(problemId, Testcase{Elements: elements})
		if err != nil {
			return Testcase{}, fmt.Errorf("cache set: %w", err)
		}

		return testcase, nil
	}

	data, err := t.cache.Get(problemId)
	if err != nil {
		return Testcase{}, fmt.Errorf("testcase: %s: %w", problemId, err)
	}

	testcase := Testcase{}
	err = testcase.UnmarshalBinary(data)
	if err != nil {
		return Testcase{}, fmt.Errorf("testcase: %w", err)
	}

	if testcaseId != 0 {
		testcase.Elements = testcase.Elements[testcaseId : testcaseId+1]
	}

	return testcase, nil
}
