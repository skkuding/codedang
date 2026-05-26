# Reviewer Memory

## 2026-05-26 — t2571-iris-polygon-tools: generate/validate/run/judge handler refactor + TaskRunner

### What changed
- Added `src/handler/generate/`, `src/handler/validate/` as new handler packages
- Refactored `src/handler/run/` and `src/handler/judge/` to new factory+task pattern
- Added `src/handler/runner.go` (TaskRunner with WaitGroup+errCh for parallel BuildUnit.Setup)
- Added `src/handler/task.go`, `taskError.go`, `runnerError.go`, `result.go`, `extract.go`, `parseError.go`
- Added `src/service/build/unit.go` (BuildUnit abstraction extracted from old judge-handler)
- Updated `src/router/router.go` (now routes to 4 factories)
- Minor changes to `src/connector/rabbitmq/connector.go`

### Gotchas found
- `runner.go` uses `sync.WaitGroup` + buffered `errCh` (not errgroup) for parallel builds — works correctly; only first error sent, others silently dropped
- `generate/task.go` and `validate/task.go`: import `golang.org/x/sync/errgroup` merged into stdlib import group (STYLE violation)
- `generate/task.go:54` — misaligned `case "generator":` (tab/space mix in switch)
- `generate/task.go:200-201` — guards `solutionUnit.Run` on `t.req.SolutionCode != ""` instead of `solutionUnit != nil`; fragile if buildUnits modified
- `validate/task.go:131-137` — `allValid` check uses `r.Id != 0` guard; zero-value entries (from ctx-cancelled goroutines) pass through as "valid"
- `run/task.go:66-71` and `judge/task.go:66-78` — when `tc.Elements[i].In == ""`, zero-value `runTestcaseResult` is sent (nil Result, nil Err, code=ACCEPTED); this silently skips testcase while still notifying caller
- `runner.go:21-27` — `testcaseManager` stored in `TaskRunner` but never accessed; dead field
- `generate/task.go:76` — `runGenerations` error return always nil, caller discards with `_`; misleading API signature
- `validate/task.go:142` — `ctx` param accepted but never used (passed to sandbox.Run which doesn't take context); pre-existing BuildUnit design gap

### Patterns in this codebase
- All 4 handler packages follow Factory.Create → Task.GetBuildUnits/RunAction pattern
- errgroup used for concurrency within RunAction (generate, validate); WaitGroup used in TaskRunner for BuildUnit.Setup
- Each goroutine in errgroup writes to its own index — no mutex needed
- `TaskRunner.Run` closes `out` (taskResultChan) via defer; router then closes the outer `out` chan — no double close because they are different channels
