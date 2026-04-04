package generate

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
	req        *GenerateRequest
	buildUnits []*build.BuildUnit
	tcManager  testcase.TestcaseManager
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

func (t *Task) RunAction(ctx context.Context, sendResult handler.ResultSender2Runner) {
	validReq := t.req
	var generatorUnit *build.BuildUnit
	var solutionUnit *build.BuildUnit

	for _, u := range t.buildUnits {
		switch u.Name {
    case "generator":
			generatorUnit = u
		case "solution":
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

	collected, _ := t.runGenerations(ctx, count, generatorUnit, solutionUnit)

	if len(collected) == 0 {
		sendResult(handler.ResultMessage{
			Result: nil,
			Err:    handler.NewTaskError("generate", handler.SERVER_ERROR, logger.ERROR, fmt.Errorf("all testcase generations failed")),
		})
		return
	}

	if err := t.tcManager.SaveTestcase(
		strconv.Itoa(validReq.ProblemId),
		false,
		collected,
	); err != nil {
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

	res := GenerateResult{
		GeneratedTestcases: len(collected),
		TotalTestcases:     count,
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
	ctx           context.Context,
	count         int,
	generatorUnit *build.BuildUnit,
	solutionUnit  *build.BuildUnit,
) ([]loader.ElementIn, error) {
	limit, _ := strconv.Atoi(os.Getenv("GENERATE_CONCURRENCY"))
	if limit <= 0 {
		limit = 4
	}

	g, gCtx := errgroup.WithContext(ctx)
	sem := make(chan struct{}, limit)
	pairs := make([]loader.ElementIn, count)
	pairOk := make([]bool, count)

	for i := 0; i < count; i++ {
		i := i
		g.Go(func() error {
			defer func() {
				if r := recover(); r != nil {
					t.logger.Log(logger.ERROR, fmt.Sprintf("panic at index %d: %v", i, r))
				}
			}()
			select {
			case sem <- struct{}{}:
			case <-gCtx.Done():
				return nil
			}
			defer func() { <-sem }()
			pair, err := t.generateOne(i, generatorUnit, solutionUnit)
			if err != nil {
				t.logger.Log(logger.ERROR, fmt.Sprintf(
					"Error generating testcase %d for problemId %d: %s",
					i, t.req.ProblemId, err.Error(),
				))
				return nil
			}
			pairs[i] = pair
			pairOk[i] = true
			return nil
		})
	}
	g.Wait() //nolint:errcheck // goroutines always return nil

	var collected []loader.ElementIn
	for i, ok := range pairOk {
		if ok {
			collected = append(collected, pairs[i])
		}
	}
	return collected, nil
}

func (t *Task) generateOne(
	index int,
	generatorUnit *build.BuildUnit,
	solutionUnit *build.BuildUnit,
) (loader.ElementIn, error) {
	runResult, err := generatorUnit.Run(t.sandbox, sandbox.RunRequest{
		Order:       index,
		TimeLimit:   2000,
		MemoryLimit: 512 * 1024 * 1024,
		ExtraArgs:   t.req.GeneratorArgs,
	}, []byte{})
	if err != nil {
		return loader.ElementIn{}, fmt.Errorf("generator run failed: %w", err)
	}
	if runResult.ExecResult.StatusCode != sandbox.RUN_SUCCESS {
		return loader.ElementIn{}, fmt.Errorf(
			"generator execution failed at index %d, status: %v, stderr: %s",
			index,
			runResult.ExecResult.StatusCode,
			string(runResult.ErrOutput),
		)
	}

	out := []byte{}
	if t.req.SolutionCode != "" {
		solutionRunResult, solutionErr := solutionUnit.Run(t.sandbox, sandbox.RunRequest{
			Order:       index,
			TimeLimit:   2000,
			MemoryLimit: 512 * 1024 * 1024,
			ExtraArgs:   []string{},
		}, runResult.Output)
		if solutionErr != nil {
			return loader.ElementIn{}, fmt.Errorf("solution run failed: %w", solutionErr)
		}
		if solutionRunResult.ExecResult.StatusCode != sandbox.RUN_SUCCESS {
			return loader.ElementIn{}, fmt.Errorf(
				"solution execution failed at index %d, status: %v, stderr: %s",
				index,
				solutionRunResult.ExecResult.StatusCode,
				string(solutionRunResult.ErrOutput),
			)
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
