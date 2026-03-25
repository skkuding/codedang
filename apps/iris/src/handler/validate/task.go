package validate

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"strconv"
	"sync"

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

type validateTcResult struct {
	id       int
	isValid  bool
	infraErr error
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

	sem := make(chan struct{}, concurrencyLimit)
	var wg sync.WaitGroup
	resultsCh := make(chan validateTcResult, len(elements))

	for i, tElement := range elements {
		wg.Add(1)
		go func(idx int, element loader.ElementOut) {
			defer wg.Done()
			t.validateTestcase(ctx, idx, element, validatorUnit, sem, resultsCh)
		}(i, tElement)
	}

	go func() {
		wg.Wait()
		close(resultsCh)
	}()

	allValid := true
	results := make([]ValidateTestcaseResult, len(elements))
	var firstInfraErr error

	for r := range resultsCh {
		if r.infraErr != nil {
			if firstInfraErr == nil {
				firstInfraErr = r.infraErr
			}
			continue
		}
		results[r.id] = ValidateTestcaseResult{
			Id:      elements[r.id].Id,
			IsValid: r.isValid,
		}
		if !r.isValid {
			allValid = false
		}
	}

	return allValid, results, firstInfraErr
}

func (t *Task) validateTestcase(
	ctx context.Context,
	idx int,
	element loader.ElementOut,
	validatorUnit *build.BuildUnit,
	sem chan struct{},
	resultsCh chan<- validateTcResult,
) {
	defer func() {
		if r := recover(); r != nil {
			resultsCh <- validateTcResult{
				id:       idx,
				infraErr: fmt.Errorf("panic in validate TC %d: %v", idx, r),
			}
		}
	}()

	select {
	case sem <- struct{}{}:
	case <-ctx.Done():
		resultsCh <- validateTcResult{
			id:       idx,
			infraErr: fmt.Errorf("context canceled before validation: %w", ctx.Err()),
		}
		return
	}
	defer func() { <-sem }()

	runResult, err := validatorUnit.Run(t.sandbox, sandbox.RunRequest{
		Order:       idx,
		TimeLimit:   2000,
		MemoryLimit: 512 * 1024 * 1024,
		ExtraArgs:   []string{},
	}, []byte(element.In))

	if err != nil {
		t.logger.Log(logger.ERROR, fmt.Sprintf("Error while validating testcase: %s", err.Error()))
		resultsCh <- validateTcResult{id: idx, infraErr: err}
		return
	}

	if runResult.ExecResult.StatusCode != sandbox.RUN_SUCCESS {
		t.logger.Log(logger.ERROR, fmt.Sprintf("Validator execution failed at testcase %d", idx))
		resultsCh <- validateTcResult{id: idx, infraErr: fmt.Errorf("validator execution failed")}
		return
	}

	isValid := runResult.ExecResult.ExitCode == 0
	if !isValid {
		t.logger.Log(logger.INFO, fmt.Sprintf("Validation failed at testcase %d", idx))
	}

	resultsCh <- validateTcResult{id: idx, isValid: isValid}
}


