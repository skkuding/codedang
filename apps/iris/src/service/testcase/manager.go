package testcase

import (
	"context"
	"fmt"
	"strconv"

	"github.com/skkuding/codedang/apps/iris/src/loader"
	"github.com/skkuding/codedang/apps/iris/src/service/logger"
)

type TestcaseReader interface {
	GetTestcase(ctx context.Context, problemId string, testcaseFilter TestcaseFilterCode) (Testcase, error)
}

type TestcaseWriter interface {
	SaveTestcase(ctx context.Context, problemId string, hidden bool, data []loader.ElementIn) ([]int, error)
}

type TestcaseManager interface {
	TestcaseReader
	TestcaseWriter
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
) TestcaseManager {
	return &testcaseManager{
		s3reader: s3reader,
		database: database,
		logger:   logProvider,
	}
}

// SaveTestcase takes ownership of data and overwrites each element's ProblemId and Hidden fields.
// It first persists metadata to Postgres to obtain ids, then uploads each testcase's .in/.out
// pair to S3 using those ids. The returned []int is indexed the same way as data.
func (t *testcaseManager) SaveTestcase(ctx context.Context, problemId string, hidden bool, data []loader.ElementIn) ([]int, error) {
	parsedProblemID, err := strconv.Atoi(problemId)
	if err != nil {
		return nil, fmt.Errorf("invalid problemId %q: %w", problemId, err)
	}
	t.logger.Log(
		logger.INFO,
		fmt.Sprintf("testcase.save.start problem_id=%s hidden=%t count=%d", problemId, hidden, len(data)),
	)
	for i := range data {
		data[i].ProblemId = parsedProblemID
		data[i].Hidden = hidden
	}

	// 1) Persist metadata, obtaining the ids assigned by Postgres.
	ids, err := t.database.Save(ctx, data)
	if err != nil {
		t.logger.Log(
			logger.ERROR,
			fmt.Sprintf(
				"testcase.save.failed stage=metadata problem_id=%s hidden=%t count=%d err=%v",
				problemId,
				hidden,
				len(data),
				err,
			),
		)
		return nil, fmt.Errorf("SaveTestcase: %w", err)
	}

	// 2) Upload each testcase's .in/.out to S3 using the id it was just assigned, in parallel.
	errChan := make(chan error, len(data))
	for i, element := range data {
		go func(id int, element loader.ElementIn) {
			errChan <- t.s3reader.Put(ctx, parsedProblemID, id, element)
		}(ids[i], element)
	}
	var errs []error
	for range data {
		if err := <-errChan; err != nil {
			errs = append(errs, err)
		}
	}
	if len(errs) > 0 {
		t.logger.Log(
			logger.ERROR,
			fmt.Sprintf(
				"testcase.save.failed stage=s3 problem_id=%s hidden=%t count=%d errs=%v",
				problemId,
				hidden,
				len(data),
				errs,
			),
		)
		return nil, fmt.Errorf("SaveTestcase: s3 upload failed: %v", errs)
	}

	t.logger.Log(
		logger.INFO,
		fmt.Sprintf("testcase.save.done problem_id=%s hidden=%t count=%d", problemId, hidden, len(data)),
	)
	return ids, nil
}

func (t *testcaseManager) GetTestcase(ctx context.Context, problemId string, testcaseFilter TestcaseFilterCode) (Testcase, error) {
	data, err := t.s3reader.Get(problemId)
	if err != nil {
		data, err = t.database.Get(ctx, problemId)
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
