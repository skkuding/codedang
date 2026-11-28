package run

import (
	"encoding/json"
	"errors"
	"testing"

	"github.com/skkuding/codedang/apps/iris/src/handler"
	"github.com/skkuding/codedang/apps/iris/src/service/logger"
	"github.com/skkuding/codedang/apps/iris/src/service/sandbox"
	"github.com/skkuding/codedang/apps/iris/src/service/sandbox/judger"
	"github.com/skkuding/codedang/apps/iris/src/service/testcase"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"go.opentelemetry.io/otel/trace/noop"
)

type factoryTestcaseReaderFake struct{ testcase.TestcaseReader }
type factorySandboxFake struct {
	sandbox.Sandbox[judger.JudgerConfig, judger.ExecArgs]
}
type factoryLoggerFake struct{ logger.Logger }

func TestNewFactory(t *testing.T) {
	tcManager := &factoryTestcaseReaderFake{}
	sb := &factorySandboxFake{}
	lg := &factoryLoggerFake{}
	tracer := noop.NewTracerProvider().Tracer("run")

	f := NewFactory(tcManager, sb, lg, tracer)

	require.NotNil(t, f)
	assert.Same(t, tcManager, f.tcManager)
	assert.Same(t, sb, f.sandbox)
	assert.Same(t, lg, f.logger)
	assert.Equal(t, tracer, f.tracer)
}

func TestFactoryCreate(t *testing.T) {
	validReq := RunRequest{
		Code:        "print(1)",
		Language:    "Python3",
		ProblemId:   7,
		TimeLimit:   1000,
		MemoryLimit: 256,
	}
	marshal := func(t *testing.T, req RunRequest) []byte {
		t.Helper()
		data, err := json.Marshal(req)
		require.NoError(t, err)
		return data
	}
	withHidden := validReq
	withHidden.ContainHiddenTestcases = true

	tests := []struct {
		name         string
		taskType     string
		data         func(t *testing.T) []byte
		wantReq      RunRequest
		wantFilter   testcase.TestcaseFilterCode
		wantErrorMsg string
	}{
		{
			name: "run_public_only", taskType: "run",
			data:    func(t *testing.T) []byte { return marshal(t, validReq) },
			wantReq: validReq, wantFilter: testcase.PUBLIC_ONLY,
		},
		{
			name: "run_contain_hidden", taskType: "run",
			data:    func(t *testing.T) []byte { return marshal(t, withHidden) },
			wantReq: withHidden, wantFilter: testcase.ALL,
		},
		{
			name: "user_testcase_ignores_contain_hidden", taskType: "userTestCase",
			data:    func(t *testing.T) []byte { return marshal(t, withHidden) },
			wantReq: withHidden, wantFilter: testcase.PUBLIC_ONLY,
		},
		{
			name: "invalid_json", taskType: "run",
			data:         func(*testing.T) []byte { return []byte("{") },
			wantErrorMsg: "unmarshal failed",
		},
		{
			name: "invalid_request", taskType: "run",
			data:         func(t *testing.T) []byte { return marshal(t, RunRequest{}) },
			wantErrorMsg: "validation failed: code must not be empty",
		},
		{
			name: "unknown_task_type", taskType: "judge",
			data:         func(t *testing.T) []byte { return marshal(t, validReq) },
			wantErrorMsg: "unknown taskType: judge",
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			tcManager := &factoryTestcaseReaderFake{}
			sb := &factorySandboxFake{}
			lg := &factoryLoggerFake{}
			tracer := noop.NewTracerProvider().Tracer("run")
			f := NewFactory(tcManager, sb, lg, tracer)

			got, err := f.Create(tt.taskType, tt.data(t))

			if tt.wantErrorMsg != "" {
				assert.Nil(t, got)
				var taskErr *handler.TaskError
				require.True(t, errors.As(err, &taskErr))
				assert.Equal(t, "run", taskErr.Handler)
				assert.Equal(t, handler.SERVER_ERROR, taskErr.Code)
				assert.Equal(t, logger.ERROR, taskErr.Level)
				assert.ErrorContains(t, err, tt.wantErrorMsg)
				return
			}

			require.NoError(t, err)
			task, ok := got.(*Task)
			require.True(t, ok)
			assert.Equal(t, tt.wantReq, *task.req)
			assert.Equal(t, tt.wantFilter, task.tcFilter)
			require.Len(t, task.buildUnits, 1)
			assert.Equal(t, "default", task.buildUnits[0].Name)
			assert.Equal(t, tt.wantReq.Code, task.buildUnits[0].Code)
			assert.Equal(t, tt.wantReq.Language, task.buildUnits[0].Language)
			assert.Same(t, tcManager, task.tcManager)
			assert.Same(t, sb, task.sandbox)
			assert.Same(t, lg, task.logger)
			assert.Equal(t, tracer, task.tracer)
		})
	}
}
