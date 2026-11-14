package testcase

import (
	"context"
	"fmt"
	"strconv"
	"time"

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

// cleanupTimeout bounds compensation work, which runs even if the caller's ctx is canceled.
const cleanupTimeout = 30 * time.Second

// SaveTestcase takes ownership of data and overwrites each element's ProblemId and Hidden fields.
// It replaces the problem's active testcases in three steps:
//  1. insert metadata as pending rows to obtain ids (the active set stays untouched),
//  2. upload each testcase's .in/.out pair to S3 under those ids,
//  3. atomically retire the old rows and activate the new ones.
//
// If step 2 or 3 fails, the pending rows and their uploaded objects are removed and the
// previous active testcases remain in effect. The returned []int is indexed the same way as data.
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

	// 1) Persist metadata as pending rows, obtaining the ids assigned by Postgres.
	ids, err := t.database.SavePending(ctx, data)
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
		t.discardPending(ctx, parsedProblemID, ids)
		return nil, fmt.Errorf("SaveTestcase: s3 upload failed: %v", errs)
	}

	// 3) Swap the active set: retire the old rows and activate the new ones in one transaction.
	if err := t.database.Activate(ctx, parsedProblemID, ids); err != nil {
		t.logger.Log(
			logger.ERROR,
			fmt.Sprintf(
				"testcase.save.failed stage=activate problem_id=%s hidden=%t count=%d err=%v",
				problemId,
				hidden,
				len(data),
				err,
			),
		)
		t.discardPending(ctx, parsedProblemID, ids)
		return nil, fmt.Errorf("SaveTestcase: %w", err)
	}

	t.logger.Log(
		logger.INFO,
		fmt.Sprintf("testcase.save.done problem_id=%s hidden=%t count=%d", problemId, hidden, len(data)),
	)
	return ids, nil
}

// discardPending deletes the rows that are still pending first and then removes S3 objects only for those ids.
func (t *testcaseManager) discardPending(ctx context.Context, problemID int, ids []int) {
	cleanupCtx, cancel := context.WithTimeout(context.WithoutCancel(ctx), cleanupTimeout)
	defer cancel()

	deleted, err := t.database.DeletePending(cleanupCtx, ids)
	if err != nil {
		t.logger.Log(
			logger.ERROR,
			fmt.Sprintf("testcase.cleanup.failed stage=metadata problem_id=%d ids=%v err=%v", problemID, ids, err),
		)
		return
	}
	if len(deleted) != len(ids) {
		t.logger.Log(
			logger.WARN,
			fmt.Sprintf(
				"testcase.cleanup.partial problem_id=%d requested=%d deleted=%d",
				problemID,
				len(ids),
				len(deleted),
			),
		)
	}
	if len(deleted) == 0 {
		return
	}
	if err := t.s3reader.Delete(cleanupCtx, problemID, deleted); err != nil {
		t.logger.Log(
			logger.ERROR,
			fmt.Sprintf("testcase.cleanup.failed stage=s3 problem_id=%d ids=%v err=%v", problemID, deleted, err),
		)
	}
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
