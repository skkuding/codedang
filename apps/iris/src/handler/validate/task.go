package validate

import (
	"context"
	"encoding/json"
	"fmt"
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
	tcManager  testcase.TestcaseReader
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

func (t *Task) RunAction(ctx context.Context, resultSender handler.ResultSender) {
	validReq := t.req

	var validatorUnit *build.BuildUnit
	for _, u := range t.buildUnits {
		if u.Name == ValidatorUnitName {
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

	tc, err := t.tcManager.GetTestcase(ctx, strconv.Itoa(validReq.ProblemId), testcase.PUBLIC_ONLY)
	if err != nil {
		resultSender(handler.ResultMessage{Result: nil, Err: handler.NewTaskError("validate", handler.TESTCASE_ERROR, logger.ERROR, fmt.Errorf("get testcase failed: %w", err))})
		return
	}

	limits, err := handler.ToolLimitsFromEnv()
	if err != nil {
		resultSender(handler.ResultMessage{
			Result: nil,
			Err:    handler.NewTaskError("validate", handler.SERVER_ERROR, logger.ERROR, err),
		})
		return
	}

	allValid, results, err := t.runValidations(ctx, validatorUnit, tc.Elements, limits)
	if err != nil {
		resultSender(handler.ResultMessage{
			Result: nil,
			Err:    handler.NewTaskError("validate", handler.SERVER_ERROR, logger.ERROR, err),
		})
		return
	}

	res := ValidateToolResult{
		IsAllValid:    allValid,
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
	limits handler.ToolExecutionLimits,
) (bool, []ValidateTestcaseToolResult, error) {
	workerCount, err := handler.WorkerCountFromEnv("VALIDATE_CONCURRENCY", len(elements), 1)
	if err != nil {
		return false, nil, err
	}
	if err := ctx.Err(); err != nil {
		return false, nil, fmt.Errorf("validation cancelled: %w", err)
	}

	// This function owns jobs: it creates, sends to, and closes the channel.
	jobs := make(chan int)
	results := make([]ValidateTestcaseToolResult, len(elements))
	filled := make([]bool, len(elements))
	errs := make([]error, len(elements))
	var wg sync.WaitGroup

	worker := func() {
		defer wg.Done()
		for i := range jobs {
			tcRes, tcErr := t.validateTestcase(ctx, i, elements[i], validatorUnit, limits)
			if tcErr != nil {
				errs[i] = tcErr
				filled[i] = true
				continue
			}
			results[i] = tcRes
			filled[i] = true
		}
	}

	wg.Add(workerCount)
	for range workerCount {
		go worker()
	}

schedule:
	for i := range elements {
		select {
		case jobs <- i:
		case <-ctx.Done():
			break schedule
		}
	}
	close(jobs)
	wg.Wait()
	if err := ctx.Err(); err != nil {
		return false, nil, fmt.Errorf("validation cancelled: %w", err)
	}

	var firstInfraErr error
	for _, e := range errs {
		if e != nil {
			firstInfraErr = e
			break
		}
	}

	allValid := true
	for i, r := range results {
		if filled[i] && !r.IsValid {
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
	limits handler.ToolExecutionLimits,
) (res ValidateTestcaseToolResult, err error) {
	defer func() {
		if r := recover(); r != nil {
			err = fmt.Errorf("panic in validate TC %d: %v", idx, r)
		}
	}()

	runResult, runErr := validatorUnit.Run(t.sandbox, sandbox.RunRequest{
		Order:       idx,
		TimeLimit:   limits.TimeLimit,
		MemoryLimit: limits.MemoryLimit,
		ExtraArgs:   []string{},
	}, []byte(element.In))

	if runErr != nil {
		t.logger.Log(logger.ERROR, fmt.Sprintf("Error while validating testcase: %s", runErr.Error()))
		return ValidateTestcaseToolResult{TestcaseId: element.Id}, runErr
	}

	if runResult.ExecResult.StatusCode != sandbox.RUN_SUCCESS {
		t.logger.Log(logger.ERROR, fmt.Sprintf("Validator execution failed at testcase %d", idx))
		return ValidateTestcaseToolResult{
			TestcaseId: element.Id,
			IsValid:    false,
			Message:    "Execution failed",
			Stderr:     string(runResult.ErrOutput),
		}, nil
	}

	isValid := runResult.ExecResult.ExitCode == 0
	if !isValid {
		t.logger.Log(logger.INFO, fmt.Sprintf("Validation failed at testcase %d", idx))
	}
	return ValidateTestcaseToolResult{
		TestcaseId: element.Id,
		IsValid:    isValid,
		Message:    string(runResult.Output),
		Stderr:     string(runResult.ErrOutput),
	}, nil
}
