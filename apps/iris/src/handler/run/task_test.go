package run

import (
	"context"
	"encoding/json"
	"errors"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"github.com/skkuding/codedang/apps/iris/src/common/constants"
	"github.com/skkuding/codedang/apps/iris/src/handler"
	"github.com/skkuding/codedang/apps/iris/src/loader"
	"github.com/skkuding/codedang/apps/iris/src/router/response"
	"github.com/skkuding/codedang/apps/iris/src/service/build"
	"github.com/skkuding/codedang/apps/iris/src/service/logger"
	"github.com/skkuding/codedang/apps/iris/src/service/sandbox"
	"github.com/skkuding/codedang/apps/iris/src/service/sandbox/judger"
	"github.com/skkuding/codedang/apps/iris/src/service/testcase"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"go.opentelemetry.io/otel/trace/noop"
)

type taskTestcaseReaderStub struct {
	tc        testcase.Testcase
	err       error
	calls     int
	problemId string
	filter    testcase.TestcaseFilterCode
}

func (s *taskTestcaseReaderStub) GetTestcase(_ context.Context, problemId string, filter testcase.TestcaseFilterCode) (testcase.Testcase, error) {
	s.calls++
	s.problemId = problemId
	s.filter = filter
	return s.tc, s.err
}

type taskRunResult struct {
	res sandbox.RunResult
	err error
}

type taskSandboxStub struct {
	sandbox.Sandbox[judger.JudgerConfig, judger.ExecArgs]
	results  []taskRunResult
	requests []sandbox.RunRequest
	inputs   []string
	onRun    func(call int)
}

func (s *taskSandboxStub) Run(req sandbox.RunRequest, input []byte) (sandbox.RunResult, error) {
	s.requests = append(s.requests, req)
	s.inputs = append(s.inputs, string(input))
	call := len(s.requests)
	if s.onRun != nil {
		s.onRun(call)
	}
	r := s.results[call-1]
	return r.res, r.err
}

type taskLoggerSpy struct {
	logger.Logger
	levels   []logger.Level
	messages []string
}

func (l *taskLoggerSpy) Log(level logger.Level, msg string) {
	l.levels = append(l.levels, level)
	l.messages = append(l.messages, msg)
}

type taskSentMessage struct {
	msg   handler.ResultMessage
	types []constants.MessageType
}

func newRunTestTask(req *RunRequest, reader testcase.TestcaseReader, sb *taskSandboxStub, lg logger.Logger) *Task {
	return &Task{
		req:        req,
		tcFilter:   testcase.PUBLIC_ONLY,
		buildUnits: []*build.BuildUnit{{Name: "default", Dir: "unit-dir", ParsedLang: sandbox.Language("C")}},
		tcManager:  reader,
		sandbox:    sb,
		logger:     lg,
		tracer:     noop.NewTracerProvider().Tracer("run"),
	}
}

func newRunTestRequest() *RunRequest {
	return &RunRequest{Code: "code", Language: "C", ProblemId: 7, TimeLimit: 1000, MemoryLimit: 256}
}

func decodeRunActionMessages(t *testing.T, sent []taskSentMessage) []*response.JudgeResponse {
	t.Helper()
	require.NotEmpty(t, sent)

	judges := make([]*response.JudgeResponse, 0, len(sent)-1)
	for _, m := range sent[:len(sent)-1] {
		assert.Empty(t, m.types)
		var judge response.JudgeResponse
		require.NoError(t, json.Unmarshal(m.msg.EncodedResponse, &judge))
		judges = append(judges, &judge)
	}

	last := sent[len(sent)-1]
	assert.Equal(t, []constants.MessageType{constants.RunSubmission}, last.types)
	var final response.SubmissionResponse
	require.NoError(t, json.Unmarshal(last.msg.EncodedResponse, &final))
	assert.Equal(t, 42, final.SubmissionId)
	require.Len(t, final.JudgeResults, len(judges))
	for i := range judges {
		assert.Equal(t, judges[i].SubmissionId, final.JudgeResults[i].SubmissionId)
		assert.Equal(t, judges[i].JudgeResultCode, final.JudgeResults[i].JudgeResultCode)
		assert.JSONEq(t, string(judges[i].JudgeResult), string(final.JudgeResults[i].JudgeResult))
		assert.Equal(t, judges[i].Error, final.JudgeResults[i].Error)
	}
	return judges
}

func decodeRunResult(t *testing.T, raw json.RawMessage) RunResult {
	t.Helper()
	var res RunResult
	require.NoError(t, json.Unmarshal(raw, &res))
	return res
}

func TestGetDebugString(t *testing.T) {
	t.Run("nil task", func(t *testing.T) {
		t.Parallel()
		var task *Task

		assert.Equal(t, "run.Task<nil>", task.GetDebugString())
	})

	t.Run("nil request", func(t *testing.T) {
		t.Parallel()
		task := &Task{}

		assert.Equal(t, "run.Task{req:nil}", task.GetDebugString())
	})

	t.Run("valid task", func(t *testing.T) {
		t.Parallel()
		task := &Task{req: newRunTestRequest(), tcFilter: testcase.ALL}

		assert.Equal(t, "run.Task{problemId:7,language:C,tcFilter:0}", task.GetDebugString())
	})
}

func TestGetBuildUnits(t *testing.T) {
	t.Run("returns build units", func(t *testing.T) {
		t.Parallel()
		units := []*build.BuildUnit{{Name: "default"}}
		task := &Task{buildUnits: units}

		got := task.GetBuildUnits()

		require.Len(t, got, 1)
		assert.Same(t, units[0], got[0])
	})

	t.Run("nil build units", func(t *testing.T) {
		t.Parallel()
		task := &Task{}

		assert.Nil(t, task.GetBuildUnits())
	})
}

func TestSendSetupFailure(t *testing.T) {
	taskErr := handler.NewTaskError("build", handler.COMPILE_ERROR, logger.INFO, errors.New("compile failed"))
	taskErr.UserMsg = "main.c: error"
	var sent []taskSentMessage
	send := func(m handler.ResultMessage, types ...constants.MessageType) {
		sent = append(sent, taskSentMessage{m, types})
	}

	(&Task{}).SendSetupFailure("42", taskErr, send)

	require.Len(t, sent, 2)
	judges := decodeRunActionMessages(t, sent)
	require.Len(t, judges, 1)
	assert.Equal(t, 42, judges[0].SubmissionId)
	assert.Equal(t, handler.COMPILE_ERROR, judges[0].JudgeResultCode)
	assert.Equal(t, "null", string(judges[0].JudgeResult))
	assert.Equal(t, "main.c: error", judges[0].Error)
}

func TestRunAction(t *testing.T) {
	accepted := taskRunResult{res: sandbox.RunResult{Output: []byte("ok")}}
	wrong := taskRunResult{res: sandbox.RunResult{Output: []byte("no")}}
	stored := []loader.ElementOut{
		{Id: 11, In: "in-1", Out: "ok"},
		{Id: 12, In: "in-2", Out: "ok"},
		{Id: 13, In: "in-3", Out: "ok"},
	}
	userTestcases := []loader.ElementOut{{Id: 21, In: "user-in", Out: "ok"}}

	tests := []struct {
		name              string
		buildUnits        func() []*build.BuildUnit
		userTestcases     *[]loader.ElementOut
		tcFilter          testcase.TestcaseFilterCode
		stored            []loader.ElementOut
		readerErr         error
		stopOnNotAccepted bool
		runs              []taskRunResult
		cancelBefore      bool
		cancelOnRun       int
		wantReaderCalls   int
		wantInputs        []string
		wantCodes         []handler.ResultCode
		wantIDs           []int
	}{
		{
			name:       "empty_build_units",
			buildUnits: func() []*build.BuildUnit { return nil },
			wantCodes:  []handler.ResultCode{handler.SERVER_ERROR}, wantIDs: []int{0},
		},
		{
			name:       "nil_build_unit",
			buildUnits: func() []*build.BuildUnit { return []*build.BuildUnit{nil} },
			wantCodes:  []handler.ResultCode{handler.SERVER_ERROR}, wantIDs: []int{0},
		},
		{
			name:          "user_testcases_skip_reader",
			userTestcases: &userTestcases, runs: []taskRunResult{accepted},
			wantInputs: []string{"user-in"},
			wantCodes:  []handler.ResultCode{handler.ACCEPTED}, wantIDs: []int{21},
		},
		{
			name:     "stored_public_testcases",
			tcFilter: testcase.PUBLIC_ONLY, stored: stored[:1], runs: []taskRunResult{accepted},
			wantReaderCalls: 1, wantInputs: []string{"in-1"},
			wantCodes: []handler.ResultCode{handler.ACCEPTED}, wantIDs: []int{11},
		},
		{
			name:     "stored_all_testcases",
			tcFilter: testcase.ALL, stored: stored[:1], runs: []taskRunResult{accepted},
			wantReaderCalls: 1, wantInputs: []string{"in-1"},
			wantCodes: []handler.ResultCode{handler.ACCEPTED}, wantIDs: []int{11},
		},
		{
			name:     "no_testcases",
			tcFilter: testcase.PUBLIC_ONLY, wantReaderCalls: 1,
		},
		{
			name:     "reader_error",
			tcFilter: testcase.PUBLIC_ONLY, readerErr: errors.New("s3 down"), wantReaderCalls: 1,
			wantCodes: []handler.ResultCode{handler.TESTCASE_ERROR}, wantIDs: []int{0},
		},
		{
			name:     "runs_all_without_stop",
			tcFilter: testcase.PUBLIC_ONLY, stored: stored, runs: []taskRunResult{accepted, wrong, accepted},
			wantReaderCalls: 1, wantInputs: []string{"in-1", "in-2", "in-3"},
			wantCodes: []handler.ResultCode{handler.ACCEPTED, handler.WRONG_ANSWER, handler.ACCEPTED},
			wantIDs:   []int{11, 12, 13},
		},
		{
			name:     "stop_on_not_accepted_cancels_rest",
			tcFilter: testcase.PUBLIC_ONLY, stored: stored, stopOnNotAccepted: true,
			runs:            []taskRunResult{wrong, accepted, accepted},
			wantReaderCalls: 1, wantInputs: []string{"in-1"},
			wantCodes: []handler.ResultCode{handler.WRONG_ANSWER, handler.CANCELED, handler.CANCELED},
			wantIDs:   []int{11, 12, 13},
		},
		{
			name:     "stop_on_not_accepted_last_testcase",
			tcFilter: testcase.PUBLIC_ONLY, stored: stored[:2], stopOnNotAccepted: true,
			runs:            []taskRunResult{accepted, wrong},
			wantReaderCalls: 1, wantInputs: []string{"in-1", "in-2"},
			wantCodes: []handler.ResultCode{handler.ACCEPTED, handler.WRONG_ANSWER},
			wantIDs:   []int{11, 12},
		},
		{
			name:     "stop_on_not_accepted_all_accepted",
			tcFilter: testcase.PUBLIC_ONLY, stored: stored[:2], stopOnNotAccepted: true,
			runs:            []taskRunResult{accepted, accepted},
			wantReaderCalls: 1, wantInputs: []string{"in-1", "in-2"},
			wantCodes: []handler.ResultCode{handler.ACCEPTED, handler.ACCEPTED},
			wantIDs:   []int{11, 12},
		},
		{
			name:          "canceled_before_first_testcase",
			userTestcases: &userTestcases, cancelBefore: true,
			wantCodes: []handler.ResultCode{handler.CANCELED}, wantIDs: []int{0},
		},
		{
			name:     "canceled_during_run_stops_rest",
			tcFilter: testcase.PUBLIC_ONLY, stored: stored, cancelOnRun: 1,
			runs:              []taskRunResult{wrong, accepted, accepted},
			stopOnNotAccepted: true,
			wantReaderCalls:   1, wantInputs: []string{"in-1"},
			wantCodes: []handler.ResultCode{handler.WRONG_ANSWER}, wantIDs: []int{11},
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			ctx, cancel := context.WithCancel(context.Background())
			defer cancel()
			if tt.cancelBefore {
				cancel()
			}

			req := newRunTestRequest()
			req.UserTestcases = tt.userTestcases
			req.StopOnNotAccepted = tt.stopOnNotAccepted
			reader := &taskTestcaseReaderStub{tc: testcase.Testcase{Elements: tt.stored}, err: tt.readerErr}
			sb := &taskSandboxStub{
				results: tt.runs,
				onRun: func(call int) {
					if call == tt.cancelOnRun {
						cancel()
					}
				},
			}
			task := newRunTestTask(req, reader, sb, &taskLoggerSpy{})
			task.tcFilter = tt.tcFilter
			if tt.buildUnits != nil {
				task.buildUnits = tt.buildUnits()
			}
			var sent []taskSentMessage
			send := func(m handler.ResultMessage, types ...constants.MessageType) {
				sent = append(sent, taskSentMessage{m, types})
			}

			task.RunAction(ctx, "42", send)

			judges := decodeRunActionMessages(t, sent)
			assert.Equal(t, tt.wantReaderCalls, reader.calls)
			if tt.wantReaderCalls > 0 {
				assert.Equal(t, "7", reader.problemId)
				assert.Equal(t, tt.tcFilter, reader.filter)
			}
			assert.Equal(t, tt.wantInputs, sb.inputs)
			require.Len(t, judges, len(tt.wantCodes))
			for i, judge := range judges {
				assert.Equal(t, 42, judge.SubmissionId)
				assert.Equal(t, tt.wantCodes[i], judge.JudgeResultCode)
				res := decodeRunResult(t, judge.JudgeResult)
				assert.Equal(t, tt.wantIDs[i], res.TestcaseId)
				if tt.stopOnNotAccepted && judge.JudgeResultCode == handler.CANCELED {
					assert.Equal(t, "Execution canceled due to previous test case failure", res.Error)
				}
			}
		})
	}
}

func TestRunTestcase(t *testing.T) {
	tc := loader.ElementOut{Id: 11, In: "input", Out: "answer"}

	t.Run("accepted fills result and sandbox request", func(t *testing.T) {
		t.Parallel()
		sb := &taskSandboxStub{results: []taskRunResult{{res: sandbox.RunResult{
			Output: []byte("answer  \n"),
			ExecResult: sandbox.ExecResult{
				CpuTime: 10, RealTime: 20, Memory: 30, Signal: 0, ExitCode: 0, ErrorCode: 0,
				StatusCode: sandbox.RUN_SUCCESS,
			},
		}}}}
		req := newRunTestRequest()
		task := newRunTestTask(req, nil, sb, &taskLoggerSpy{})

		got := task.runTestcase(context.Background(), 3, req, tc)

		assert.Equal(t, handler.ACCEPTED, got.code)
		assert.NoError(t, got.message.Err)
		assert.Equal(t, RunResult{
			TestcaseId: 11, Output: "answer  \n", CpuTime: 10, RealTime: 20, Memory: 30,
		}, decodeRunResult(t, got.message.Result))
		assert.Equal(t, []sandbox.RunRequest{{
			Order: 3, Dir: "unit-dir", Language: sandbox.Language("C"), TimeLimit: 1000, MemoryLimit: 256,
		}}, sb.requests)
		assert.Equal(t, []string{"input"}, sb.inputs)
	})

	t.Run("wrong answer", func(t *testing.T) {
		t.Parallel()
		sb := &taskSandboxStub{results: []taskRunResult{{res: sandbox.RunResult{Output: []byte("other")}}}}
		req := newRunTestRequest()
		task := newRunTestTask(req, nil, sb, &taskLoggerSpy{})

		got := task.runTestcase(context.Background(), 0, req, tc)

		assert.Equal(t, handler.WRONG_ANSWER, got.code)
		assert.Equal(t, handler.WRONG_ANSWER, handler.ExtractResultCode(got.message.Err))
		assert.Equal(t, "other", decodeRunResult(t, got.message.Result).Output)
	})

	t.Run("non success status skips grading", func(t *testing.T) {
		t.Parallel()
		sb := &taskSandboxStub{results: []taskRunResult{{res: sandbox.RunResult{
			Output:     []byte("answer"),
			ExecResult: sandbox.ExecResult{StatusCode: sandbox.CPU_TIME_LIMIT_EXCEEDED, CpuTime: 1001},
		}}}}
		req := newRunTestRequest()
		task := newRunTestTask(req, nil, sb, &taskLoggerSpy{})

		got := task.runTestcase(context.Background(), 0, req, tc)

		assert.Equal(t, handler.CPU_TIME_LIMIT_EXCEEDED, got.code)
		assert.Equal(t, handler.CPU_TIME_LIMIT_EXCEEDED, handler.ExtractResultCode(got.message.Err))
		res := decodeRunResult(t, got.message.Result)
		assert.Equal(t, "answer", res.Output)
		assert.Equal(t, 1001, res.CpuTime)
	})

	t.Run("truncates output after grading", func(t *testing.T) {
		t.Parallel()
		output := strings.Repeat("a", constants.MAX_OUTPUT+10)
		sb := &taskSandboxStub{results: []taskRunResult{{res: sandbox.RunResult{Output: []byte(output)}}}}
		req := newRunTestRequest()
		task := newRunTestTask(req, nil, sb, &taskLoggerSpy{})

		got := task.runTestcase(context.Background(), 0, req, loader.ElementOut{Id: 11, Out: output})

		assert.Equal(t, handler.ACCEPTED, got.code)
		assert.Equal(t, output[:constants.MAX_OUTPUT], decodeRunResult(t, got.message.Result).Output)
	})

	t.Run("sandbox error", func(t *testing.T) {
		t.Parallel()
		sb := &taskSandboxStub{results: []taskRunResult{{
			res: sandbox.RunResult{Output: []byte("answer"), ErrOutput: []byte("sandbox failed"), ExecResult: sandbox.ExecResult{CpuTime: 10}},
			err: errors.New("exec failed"),
		}}}
		req := newRunTestRequest()
		lg := &taskLoggerSpy{}
		task := newRunTestTask(req, nil, sb, lg)

		got := task.runTestcase(context.Background(), 0, req, tc)

		assert.Equal(t, handler.ACCEPTED, got.code)
		assert.NoError(t, got.message.Err)
		assert.Equal(t, RunResult{TestcaseId: 11, Error: "sandbox failed"}, decodeRunResult(t, got.message.Result))
		assert.Equal(t, []logger.Level{logger.ERROR}, lg.levels)
		assert.Contains(t, lg.messages[0], "exec failed")
	})

	t.Run("removes cgroup path", func(t *testing.T) {
		t.Parallel()
		cgroupPath := filepath.Join(t.TempDir(), "cgroup")
		require.NoError(t, os.MkdirAll(filepath.Join(cgroupPath, "child"), 0o755))
		sb := &taskSandboxStub{results: []taskRunResult{{res: sandbox.RunResult{
			Output:     []byte("answer"),
			ExecResult: sandbox.ExecResult{CgroupPath: cgroupPath},
		}}}}
		req := newRunTestRequest()
		lg := &taskLoggerSpy{}
		task := newRunTestTask(req, nil, sb, lg)

		got := task.runTestcase(context.Background(), 0, req, tc)

		assert.Equal(t, handler.ACCEPTED, got.code)
		assert.NoDirExists(t, cgroupPath)
		assert.Empty(t, lg.levels)
	})

	t.Run("cgroup cleanup failure only warns", func(t *testing.T) {
		t.Parallel()
		if os.Geteuid() == 0 {
			t.Skip("root can remove read-only directories")
		}
		parent := filepath.Join(t.TempDir(), "readonly")
		cgroupPath := filepath.Join(parent, "cgroup")
		require.NoError(t, os.MkdirAll(cgroupPath, 0o755))
		require.NoError(t, os.Chmod(parent, 0o555))
		t.Cleanup(func() { _ = os.Chmod(parent, 0o755) })
		sb := &taskSandboxStub{results: []taskRunResult{{res: sandbox.RunResult{
			Output:     []byte("answer"),
			ExecResult: sandbox.ExecResult{CgroupPath: cgroupPath},
		}}}}
		req := newRunTestRequest()
		lg := &taskLoggerSpy{}
		task := newRunTestTask(req, nil, sb, lg)

		got := task.runTestcase(context.Background(), 0, req, tc)

		assert.Equal(t, handler.ACCEPTED, got.code)
		assert.DirExists(t, cgroupPath)
		assert.Equal(t, []logger.Level{logger.WARN}, lg.levels)
		assert.Contains(t, lg.messages[0], cgroupPath)
	})

	t.Run("canceled context skips sandbox", func(t *testing.T) {
		t.Parallel()
		ctx, cancel := context.WithCancel(context.Background())
		cancel()
		sb := &taskSandboxStub{}
		req := newRunTestRequest()
		task := newRunTestTask(req, nil, sb, &taskLoggerSpy{})

		got := task.runTestcase(ctx, 0, req, tc)

		assert.Equal(t, handler.CANCELED, got.code)
		assert.Nil(t, got.message.Result)
		assert.Equal(t, handler.CANCELED, handler.ExtractResultCode(got.message.Err))
		assert.ErrorIs(t, got.message.Err, context.Canceled)
		assert.Empty(t, sb.requests)
	})
}
