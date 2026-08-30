package generate

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
	req        *GenerateRequest
	buildUnits []*build.BuildUnit
	tcManager  testcase.TestcaseWriter
	sandbox    sandbox.Sandbox[judger.JudgerConfig, judger.ExecArgs]
	logger     logger.Logger
}

func (t *Task) GetDebugString() string {
	if t == nil {
		return "generate.Task<nil>"
	}
	if t.req == nil {
		return "generate.Task{req:nil}"
	}
	return fmt.Sprintf(
		"generate.Task{problemId:%d,language:%s,testcaseCount:%d}",
		t.req.ProblemId,
		t.req.GeneratorLanguage,
		t.req.TestcaseCount,
	)
}

func (t *Task) GetBuildUnits() []*build.BuildUnit {
	return t.buildUnits
}

func (t *Task) RunAction(ctx context.Context, _ string, sendResult handler.ResultSender) {
	validReq := t.req
	var generatorUnit *build.BuildUnit
	var solutionUnit *build.BuildUnit

	for _, u := range t.buildUnits {
		switch u.Name {
		case GeneratorUnitName:
			generatorUnit = u
		case SolutionUnitName:
			solutionUnit = u
		}
	}

	if generatorUnit == nil || generatorUnit.Dir == "" {
		sendResult(handler.ResultMessage{
			Result: nil,
			Err: handler.NewTaskError(
				"generate",
				handler.SERVER_ERROR,
				logger.ERROR,
				fmt.Errorf("generator build unit not found"),
			),
		})
		return
	}

	count := validReq.TestcaseCount
	limits, err := handler.ToolLimitsFromEnv()
	if err != nil {
		sendResult(handler.ResultMessage{
			Result: nil,
			Err:    handler.NewTaskError("generate", handler.SERVER_ERROR, logger.ERROR, err),
		})
		return
	}

	collected, generateErrors, runErr := t.runGenerations(ctx, count, generatorUnit, solutionUnit, limits)
	if runErr != nil {
		sendResult(handler.ResultMessage{
			Result: nil,
			Err:    handler.NewTaskError("generate", handler.SERVER_ERROR, logger.ERROR, runErr),
		})
		return
	}

	if len(collected) == 0 {
		// all failed
		res := GenerateToolResult{
			GeneratedCount: 0,
			RequestedCount: count,
			Errors:         generateErrors,
		}
		marshaledRes, _ := json.Marshal(res)
		sendResult(handler.ResultMessage{
			Result: marshaledRes,
			Err:    handler.NewTaskError("generate", handler.SERVER_ERROR, logger.ERROR, fmt.Errorf("all testcase generations failed")),
		})
		return
	}

	testcaseIds, err := t.tcManager.SaveTestcase(
		ctx,
		strconv.Itoa(validReq.ProblemId),
		false,
		collected,
	)
	if err != nil {
		t.logger.Log(
			logger.ERROR,
			fmt.Sprintf(
				"Failed to save %d testcases for problemId %d: %s",
				len(collected),
				validReq.ProblemId,
				err.Error(),
			),
		)
		sendResult(handler.ResultMessage{
			Result: nil,
			Err:    handler.NewTaskError("generate", handler.SERVER_ERROR, logger.ERROR, fmt.Errorf("save testcase failed: %w", err)),
		})
		return
	}

	res := GenerateToolResult{
		GeneratedCount: len(collected),
		RequestedCount: count,
		Errors:         generateErrors,
		TestcaseIds:    testcaseIds,
	}
	marshaledRes, err := json.Marshal(res)
	if err != nil {
		sendResult(handler.ResultMessage{
			Result: nil,
			Err:    handler.NewTaskError("generate", handler.SERVER_ERROR, logger.ERROR, fmt.Errorf("marshal failed")),
		})
	} else {
		sendResult(handler.ResultMessage{Result: marshaledRes, Err: nil})
	}
}

func (t *Task) runGenerations(
	ctx context.Context,
	count int,
	generatorUnit *build.BuildUnit,
	solutionUnit *build.BuildUnit,
	limits handler.ToolExecutionLimits,
) ([]loader.ElementIn, []GenerateTestcaseError, error) {
	// Sandbox processes are external to Go's GMP scheduler. Keep the default
	// serial until an operator has measured host CPU/memory headroom, then opt
	// into a higher worker count through GENERATE_CONCURRENCY. A shared BuildUnit
	// serializes its runs, so parallelism requires separate units per worker.
	workerCount, err := handler.WorkerCountFromEnv("GENERATE_CONCURRENCY", count, 1)
	if err != nil {
		return nil, nil, err
	}
	retryCount, err := handler.RetryCountFromEnv(handler.GenerateRetryCountEnv, handler.DefaultGenerateRetries)
	if err != nil {
		return nil, nil, err
	}
	if err := ctx.Err(); err != nil {
		return nil, nil, fmt.Errorf("generation cancelled: %w", err)
	}

	// This function owns jobs: it creates, sends to, and closes the channel.
	jobs := make(chan int)
	pairs := make([]loader.ElementIn, count)
	pairOk := make([]bool, count)
	errs := make([]GenerateTestcaseError, count)
	hasErr := make([]bool, count)
	var wg sync.WaitGroup

	worker := func() {
		defer wg.Done()
		for i := range jobs {
			pair, genErr := t.generateOneWithRetry(i, generatorUnit, solutionUnit, limits, retryCount)
			if genErr != nil {
				t.logger.Log(logger.ERROR, fmt.Sprintf(
					"Error generating testcase %d for problemId %d: %s",
					i, t.req.ProblemId, genErr.Message,
				))
				errs[i] = *genErr
				hasErr[i] = true
				continue
			}
			pairs[i] = pair
			pairOk[i] = true
		}
	}

	wg.Add(workerCount)
	for range workerCount {
		go worker()
	}

schedule:
	for i := range count {
		select {
		case jobs <- i:
		case <-ctx.Done():
			break schedule
		}
	}
	close(jobs)
	wg.Wait()
	if err := ctx.Err(); err != nil {
		return nil, nil, fmt.Errorf("generation cancelled: %w", err)
	}

	var collected []loader.ElementIn
	var collectedErrs []GenerateTestcaseError
	for i := range pairOk {
		if pairOk[i] {
			collected = append(collected, pairs[i])
		}
		if hasErr[i] {
			collectedErrs = append(collectedErrs, errs[i])
		}
	}
	return collected, collectedErrs, nil
}

func (t *Task) generateOneWithRetry(
	index int,
	generatorUnit *build.BuildUnit,
	solutionUnit *build.BuildUnit,
	limits handler.ToolExecutionLimits,
	retryCount int,
) (loader.ElementIn, *GenerateTestcaseError) {
	for attempt := 0; ; attempt++ {
		pair, generateErr := t.generateOneSafely(index, generatorUnit, solutionUnit, limits)
		if generateErr == nil || !isRetryableGenerationError(generateErr) || attempt == retryCount {
			return pair, generateErr
		}
		t.logger.Log(logger.WARN, fmt.Sprintf("Retrying testcase %d after transient sandbox error (%d/%d): %s", index, attempt+1, retryCount, generateErr.Message))
	}
}

func isRetryableGenerationError(generateErr *GenerateTestcaseError) bool {
	return generateErr.retryable
}

func (t *Task) generateOneSafely(
	index int,
	generatorUnit *build.BuildUnit,
	solutionUnit *build.BuildUnit,
	limits handler.ToolExecutionLimits,
) (pair loader.ElementIn, generateErr *GenerateTestcaseError) {
	defer func() {
		if recovered := recover(); recovered != nil {
			generateErr = &GenerateTestcaseError{
				Index:   index,
				Message: fmt.Sprintf("panic while generating testcase: %v", recovered),
			}
		}
	}()
	return t.generateOne(index, generatorUnit, solutionUnit, limits)
}

func (t *Task) generateOne(
	index int,
	generatorUnit *build.BuildUnit,
	solutionUnit *build.BuildUnit,
	limits handler.ToolExecutionLimits,
) (loader.ElementIn, *GenerateTestcaseError) {
	runResult, err := generatorUnit.Run(t.sandbox, sandbox.RunRequest{
		Order:       index,
		TimeLimit:   limits.TimeLimit,
		MemoryLimit: limits.MemoryLimit,
		ExtraArgs:   t.req.GeneratorArgs,
	}, []byte{})
	if err != nil {
		return loader.ElementIn{}, &GenerateTestcaseError{Index: index, Message: fmt.Sprintf("generator run failed: %v", err), retryable: true}
	}
	if runResult.ExecResult.StatusCode != sandbox.RUN_SUCCESS {
		return loader.ElementIn{}, &GenerateTestcaseError{
			Index:   index,
			Message: fmt.Sprintf("generator execution failed at index %d, status: %v", index, runResult.ExecResult.StatusCode),
			Stderr:  string(runResult.ErrOutput),
		}
	}

	out := []byte{}
	if solutionUnit != nil && t.req.SolutionCode != "" {
		solutionRunResult, solutionErr := solutionUnit.Run(t.sandbox, sandbox.RunRequest{
			Order:       index,
			TimeLimit:   limits.TimeLimit,
			MemoryLimit: limits.MemoryLimit,
			ExtraArgs:   []string{},
		}, runResult.Output)
		if solutionErr != nil {
			return loader.ElementIn{}, &GenerateTestcaseError{Index: index, Message: fmt.Sprintf("solution run failed: %v", solutionErr), retryable: true}
		}
		if solutionRunResult.ExecResult.StatusCode != sandbox.RUN_SUCCESS {
			return loader.ElementIn{}, &GenerateTestcaseError{
				Index:   index,
				Message: fmt.Sprintf("solution execution failed at index %d, status: %v", index, solutionRunResult.ExecResult.StatusCode),
				Stderr:  string(solutionRunResult.ErrOutput),
			}
		}
		out = solutionRunResult.Output
	}

	return loader.ElementIn{
		Id:     index + 1,
		In:     string(runResult.Output),
		Out:    string(out),
		Hidden: false,
	}, nil
}
