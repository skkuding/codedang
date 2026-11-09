package handler

import (
	"context"
	"encoding/json"
	"errors"
	"testing"

	"github.com/skkuding/codedang/apps/plag/src/common/result"
	"github.com/skkuding/codedang/apps/plag/src/loader"
	"github.com/skkuding/codedang/apps/plag/src/service/check"
	"github.com/stretchr/testify/require"
	"go.opentelemetry.io/otel/trace/noop"
)

type checkInputCall struct {
	method    string
	ids       []string
	problemID string
	language  string
}

type checkInputManagerStub struct {
	check.CheckManager
	calls []checkInputCall
	input check.CheckInput
	err   error
}

func (s *checkInputManagerStub) getInput(method string, ids []string, problemID, language string) (check.CheckInput, error) {
	s.calls = append(s.calls, checkInputCall{method, ids, problemID, language})
	return s.input, s.err
}

func (s *checkInputManagerStub) GetAssignmentsCheckInput(ids []string, problemID, language string) (check.CheckInput, error) {
	return s.getInput("assignments", ids, problemID, language)
}

func (s *checkInputManagerStub) GetContestCheckInput(id, problemID, language string) (check.CheckInput, error) {
	return s.getInput("contest", []string{id}, problemID, language)
}

func (s *checkInputManagerStub) GetWorkbookCheckInput(id, problemID, language string) (check.CheckInput, error) {
	return s.getInput("workbook", []string{id}, problemID, language)
}

func runGetCheckInput(t *testing.T, manager check.CheckManager, req Request) result.ChResult {
	t.Helper()
	handler := &CheckHandler{
		check:  manager,
		tracer: noop.NewTracerProvider().Tracer("test"),
	}
	out := make(chan result.ChResult, 2)
	handler.getCheckInput(context.Background(), out, req)
	require.Len(t, out, 1, "getCheckInput must send exactly one result")
	return <-out
}

func TestCheckHandlerGetCheckInput(t *testing.T) {
	contestID, workbookID := 34, 56
	assignmentIDs := []int{12, 3, 45}
	singleAssignmentIDs := []int{12}
	wantInput := check.CheckInput{
		BaseCode: "# base\n",
		HasBase:  true,
		Elements: []loader.Element{
			{Id: 1, UserId: 10, Code: "print(1)\n", CreateTime: "2026-11-01 12:00:00"},
			{Id: 2, UserId: 20, Code: "print(2)\n", CreateTime: "2026-11-02 12:00:00"},
		},
	}
	tests := []struct {
		name   string
		method string
		req    Request
		ids    []string
	}{
		{name: "single assignment", method: "assignments", req: Request{AssignmentIds: &singleAssignmentIDs}, ids: []string{"12"}},
		{name: "assignments", method: "assignments", req: Request{AssignmentIds: &assignmentIDs}, ids: []string{"12", "3", "45"}},
		{name: "contest", method: "contest", req: Request{ContestId: &contestID}, ids: []string{"34"}},
		{name: "workbook", method: "workbook", req: Request{WorkbookId: &workbookID}, ids: []string{"56"}},
	}
	managerErr := errors.New("failed to load check input")
	outcomes := []struct {
		name string
		err  error
	}{
		{name: "success"},
		{name: "manager error", err: managerErr},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			for _, outcome := range outcomes {
				t.Run(outcome.name, func(t *testing.T) {
					manager := &checkInputManagerStub{input: wantInput, err: outcome.err}
					req := tt.req
					req.ProblemId = 42
					req.Language = "Python3"

					got := runGetCheckInput(t, manager, req)

					require.Equal(t, []checkInputCall{{
						method: tt.method, ids: tt.ids, problemID: "42", language: "Python3",
					}}, manager.calls)
					if outcome.err != nil {
						require.ErrorIs(t, got.Err, outcome.err)
						require.Nil(t, got.Data)
						return
					}
					require.NoError(t, got.Err)
					require.Equal(t, wantInput, got.Data)
				})
			}
		})
	}
}

func TestCheckHandlerGetCheckInput_InvalidRequest(t *testing.T) {
	contestID, workbookID := 34, 56
	assignmentIDs := []int{12, 3}
	emptyIDs := []int{}
	var nilIDs []int
	const ambiguous = "cannot inference dependent of problem"
	tests := []struct {
		name    string
		req     Request
		wantErr string
	}{
		{name: "no source", wantErr: ambiguous},
		{name: "empty assignments", req: Request{AssignmentIds: &emptyIDs}, wantErr: "assignmentIds must not be empty"},
		{name: "nil assignments slice", req: Request{AssignmentIds: &nilIDs}, wantErr: "assignmentIds must not be empty"},
		{name: "assignments and contest", req: Request{AssignmentIds: &assignmentIDs, ContestId: &contestID}, wantErr: ambiguous},
		{name: "assignments and workbook", req: Request{AssignmentIds: &assignmentIDs, WorkbookId: &workbookID}, wantErr: ambiguous},
		{name: "contest and workbook", req: Request{ContestId: &contestID, WorkbookId: &workbookID}, wantErr: ambiguous},
		{name: "all sources", req: Request{AssignmentIds: &assignmentIDs, ContestId: &contestID, WorkbookId: &workbookID}, wantErr: ambiguous},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			manager := &checkInputManagerStub{}
			req := tt.req
			req.ProblemId = 42
			req.Language = "Python3"

			got := runGetCheckInput(t, manager, req)

			require.EqualError(t, got.Err, tt.wantErr)
			require.Nil(t, got.Data)
			require.Empty(t, manager.calls, "invalid requests must not call the check manager")
		})
	}
}

func TestCheckHandlerGetCheckInput_ArrayMessages(t *testing.T) {
	tests := []struct {
		name    string
		payload string
		method  string
		ids     []string
	}{
		{"single assignment", `{"assignmentIds":[12]}`, "assignments", []string{"12"}},
		{"multiple assignments", `{"assignmentIds":[12,34]}`, "assignments", []string{"12", "34"}},
		{"contest with empty array", `{"assignmentIds":[],"contestId":34}`, "contest", []string{"34"}},
		{"workbook with empty array", `{"assignmentIds":[],"workbookId":56}`, "workbook", []string{"56"}},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			var req Request
			require.NoError(t, json.Unmarshal([]byte(tt.payload), &req))
			manager := &checkInputManagerStub{}
			got := runGetCheckInput(t, manager, req)
			require.NoError(t, got.Err)
			require.Len(t, manager.calls, 1)
			require.Equal(t, tt.method, manager.calls[0].method)
			require.Equal(t, tt.ids, manager.calls[0].ids)
		})
	}
}
