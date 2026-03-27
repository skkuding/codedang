package validate

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"strconv"
	"golang.org/x/sync/errgroup"

	"github.com/skkuding/codedang/apps/iris/src/handler"
	"github.com/skkuding/codedang/apps/iris/src/loader"
	"github.com/skkuding/codedang/apps/iris/src/service/build"
	"github.com/skkuding/codedang/apps/iris/src/service/logger"
	"github.com/skkuding/codedang/apps/iris/src/service/sandbox"
	"github.com/skkuding/codedang/apps/iris/src/service/sandbox/judger"
	"github.com/skkuding/codedang/apps/iris/src/service/testcase"
)

type Task struct {
	req        *ValidateRequest
	buildUnits []*build.BuildUnit
	tcManager  testcase.TestcaseManager
	sandbox    sandbox.Sandbox[judger.JudgerConfig, judger.ExecArgs]
	logger     logger.Logger
}

func (t *Task) GetDebugString() string {
	if t == nil {
		return "validate.Task<nil>"
	}
	if t.req == nil {
		return "validate.Task{req:nil}"
	}
	return fmt.Sprintf("validate.Task{problemId:%d,language:%s}", t.req.ProblemId, t.req.Language)
}

func (t *Task) GetBuildUnits() []*build.BuildUnit {
	return t.buildUnits
}

func (t *Task) RunAction(ctx context.Context, resultSender handler.ResultSender2Runner) {
	validReq := t.req

	var validatorUnit *build.BuildUnit
	for _, u := range t.buildUnits {
		if u.Name == "validator" {
			validatorUnit = u
			break
		}
	}
	if validatorUnit == nil || validatorUnit.Dir == "" {
		resultSender(handler.ResultMessage{
			Result: nil,
			Err:    handler.NewTaskError("validate", handler.SERVER_ERROR, logger.ERROR, fmt.Errorf("validator build unit not found")),
		})
		return
	}

	tc, err := t.tcManager.GetTestcase(strconv.Itoa(validReq.ProblemId), false)
	if err != nil {
		resultSender(handler.ResultMessage{Result: nil, Err: handler.NewTaskError("validate", handler.TESTCASE_ERROR, logger.ERROR, fmt.Errorf("get testcase failed: %w", err))})
		return
	}

	allValid, results, err := t.runValidations(ctx, validatorUnit, tc.Elements)
	if err != nil {
		resultSender(handler.ResultMessage{
			Result: nil,
			Err:    handler.NewTaskError("validate", handler.SERVER_ERROR, logger.ERROR, err),
		})
		return
	}

	res := ValidateResult{
		IsValid:       allValid,
		TestcaseCount: len(tc.Elements),
		Results:       results,
	}
	marshaledRes, err := json.Marshal(res)
	if err != nil {
		resultSender(handler.ResultMessage{Result: nil, Err: handler.NewTaskError("validate", handler.SERVER_ERROR, logger.ERROR, fmt.Errorf("marshal failed"))})
	} else {
		resultSender(handler.ResultMessage{Result: marshaledRes, Err: nil})
	}
}

func (t *Task) runValidations(
	ctx context.Context,
	validatorUnit *build.BuildUnit,
	elements []loader.ElementOut,
) (bool, []ValidateTestcaseResult, error) {
	limitStr := os.Getenv("VALIDATE_CONCURRENCY")
	concurrencyLimit, err := strconv.Atoi(limitStr)
	if err != nil || concurrencyLimit <= 0 {
		concurrencyLimit = 4
	}

	g, gCtx := errgroup.WithContext(ctx)
	sem := make(chan struct{}, concurrencyLimit)
	results := make([]ValidateTestcaseResult, len(elements))
	errs := make([]error, len(elements))

	for i, el := range elements {
		g.Go(func() error {
			select {
			case sem <- struct{}{}:
			case <-gCtx.Done():
				return nil
			}
			defer func() { <-sem }()
			isValid, err := t.validateTestcase(gCtx, i, el, validatorUnit)
			if err != nil {
				errs[i] = err
				return nil
			}
			results[i] = ValidateTestcaseResult{Id: el.Id, IsValid: isValid}
			return nil
		})
	}
	g.Wait() //nolint:errcheck // goroutines always return nil

	var firstInfraErr error
	for _, e := range errs {
		if e != nil {
			firstInfraErr = e
			break
		}
	}

	allValid := true
	for _, r := range results {
		if r.Id != 0 && !r.IsValid {
			allValid = false
			break
		}
	}

	return allValid, results, firstInfraErr
}

func (t *Task) validateTestcase(
	ctx context.Context,
	idx int,
	element loader.ElementOut,
	validatorUnit *build.BuildUnit,
) (isValid bool, err error) {
	defer func() {
		if r := recover(); r != nil {
			err = fmt.Errorf("panic in validate TC %d: %v", idx, r)
		}
	}()

	runResult, runErr := validatorUnit.Run(t.sandbox, sandbox.RunRequest{
		Order:       idx,
		TimeLimit:   2000,
		MemoryLimit: 512 * 1024 * 1024,
		ExtraArgs:   []string{},
	}, []byte(element.In))

	if runErr != nil {
		t.logger.Log(logger.ERROR, fmt.Sprintf("Error while validating testcase: %s", runErr.Error()))
		return false, runErr
	}

	if runResult.ExecResult.StatusCode != sandbox.RUN_SUCCESS {
		t.logger.Log(logger.ERROR, fmt.Sprintf("Validator execution failed at testcase %d", idx))
		return false, fmt.Errorf("validator execution failed")
	}

	isValid = runResult.ExecResult.ExitCode == 0
	if !isValid {
		t.logger.Log(logger.INFO, fmt.Sprintf("Validation failed at testcase %d", idx))
	}
	return isValid, nil
}


