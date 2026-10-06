package handler_test

import (
	"context"
	"encoding/json"
	"errors"
	"reflect"
	"testing"

	"github.com/skkuding/codedang/apps/iris/src/common/constants"
	"github.com/skkuding/codedang/apps/iris/src/handler"
	"github.com/skkuding/codedang/apps/iris/src/handler/judge"
	"github.com/skkuding/codedang/apps/iris/src/handler/run"
	"github.com/skkuding/codedang/apps/iris/src/loader"
	"github.com/skkuding/codedang/apps/iris/src/router/response"
	"github.com/skkuding/codedang/apps/iris/src/service/sandbox"
	"github.com/skkuding/codedang/apps/iris/src/service/sandbox/judger"
	"github.com/skkuding/codedang/apps/iris/src/service/testcase"
	"go.opentelemetry.io/otel/trace/noop"
)

type requestTCReader struct {
	legacy, versioned     int
	problemID, setID, key string
	filter                testcase.TestcaseFilterCode
	err                   error
}

func (r *requestTCReader) GetTestcase(_ context.Context, problemID string, filter testcase.TestcaseFilterCode) (testcase.Testcase, error) {
	r.legacy++
	r.problemID, r.filter = problemID, filter
	return r.result()
}

func (r *requestTCReader) GetVersionedTestcase(_ context.Context, setID, key string, filter testcase.TestcaseFilterCode) (testcase.Testcase, error) {
	r.versioned++
	r.setID, r.key, r.filter = setID, key, filter
	return r.result()
}

func (r *requestTCReader) result() (testcase.Testcase, error) {
	if r.err != nil {
		return testcase.Testcase{}, r.err
	}
	return testcase.Testcase{Elements: []loader.ElementOut{{Id: 1001, In: "1 2\n", Out: "3\n"}}}, nil
}

// RunAction exercises the normal grading path; only actual sandbox execution is replaced.
type requestSandbox struct {
	sandbox.Sandbox[judger.JudgerConfig, judger.ExecArgs]
	inputs []string
}

func (s *requestSandbox) Run(_ sandbox.RunRequest, input []byte) (sandbox.RunResult, error) {
	s.inputs = append(s.inputs, string(input))
	return sandbox.RunResult{Output: []byte("3\n"), ExecResult: sandbox.ExecResult{StatusCode: sandbox.RUN_SUCCESS}}, nil
}

type requestFactory interface {
	Create(string, []byte) (handler.Task, error)
}

func makeRequestFactory(kind string, reader testcase.TestcaseReader, sb *requestSandbox) requestFactory {
	tracer := noop.NewTracerProvider().Tracer("test")
	if kind == "judge" {
		return judge.NewFactory(reader, sb, nil, tracer)
	}
	return run.NewFactory(reader, sb, nil, tracer)
}

func requestJSON(t *testing.T, fields map[string]any) []byte {
	t.Helper()
	data := map[string]any{"code": "print(3)", "language": "C", "problemId": 100, "timeLimit": 1000, "memoryLimit": 128}
	for key, value := range fields {
		data[key] = value
	}
	encoded, err := json.Marshal(data)
	if err != nil {
		t.Fatal(err)
	}
	return encoded
}

func TestVersionedRequestRoutingAndGrading(t *testing.T) {
	for _, tt := range []struct {
		name, kind                    string
		versioned, hidden, user, fail bool
		filter                        testcase.TestcaseFilterCode
	}{
		{"judge legacy", "judge", false, false, false, false, testcase.ALL},
		{"judge versioned all", "judge", true, false, false, false, testcase.ALL},
		{"judge versioned hidden", "judge", true, true, false, false, testcase.HIDDEN_ONLY},
		{"run legacy", "run", false, false, false, false, testcase.PUBLIC_ONLY},
		{"run versioned public", "run", true, false, false, false, testcase.PUBLIC_ONLY},
		{"run versioned all", "run", true, true, false, false, testcase.ALL},
		{"judge versioned failure", "judge", true, false, false, true, testcase.ALL},
		{"run versioned failure", "run", true, false, false, true, testcase.PUBLIC_ONLY},
		{"judge custom TC", "judge", true, false, true, false, testcase.ALL},
		{"run custom TC", "userTestCase", true, false, true, false, testcase.PUBLIC_ONLY},
	} {
		t.Run(tt.name, func(t *testing.T) {
			reader := &requestTCReader{}
			if tt.fail {
				reader.err = errors.New("version lookup failed")
			}
			sb := &requestSandbox{}
			fields := map[string]any{"judgeOnlyHiddenTestcases": tt.hidden, "containHiddenTestcases": tt.hidden}
			if tt.versioned {
				fields["testcaseSetId"], fields["manifestKey"] = "tcset-42", "testcases/tcset-42/manifest.json"
			}
			if tt.user {
				fields["userTestcases"] = []loader.ElementOut{{Id: 7, In: "custom input", Out: "3\n"}}
			}
			task, err := makeRequestFactory(tt.kind, reader, sb).Create(tt.kind, requestJSON(t, fields))
			if err != nil {
				t.Fatal(err)
			}
			var messages []handler.ResultMessage
			task.RunAction(context.Background(), "1", func(msg handler.ResultMessage, _ ...constants.MessageType) { messages = append(messages, msg) })
			if tt.user {
				if reader.legacy != 0 || reader.versioned != 0 {
					t.Fatal("custom TC must bypass storage")
				}
			} else {
				if reader.filter != tt.filter {
					t.Fatalf("filter=%v want=%v", reader.filter, tt.filter)
				}
				if tt.versioned {
					if reader.versioned != 1 || reader.legacy != 0 || reader.setID != "tcset-42" || reader.key != fields["manifestKey"] {
						t.Fatalf("wrong versioned route or legacy fallback: %+v", reader)
					}
				} else if reader.legacy != 1 || reader.versioned != 0 || reader.problemID != "100" {
					t.Fatalf("wrong legacy route: %+v", reader)
				}
			}
			if len(messages) != 2 {
				t.Fatalf("expected TC response and final response, got %d", len(messages))
			}
			var result response.JudgeResponse
			if err := json.Unmarshal(messages[0].EncodedResponse, &result); err != nil {
				t.Fatal(err)
			}
			if tt.fail {
				if result.JudgeResultCode != handler.TESTCASE_ERROR || len(sb.inputs) != 0 {
					t.Fatalf("lookup failure reached sandbox: %+v", result)
				}
			} else {
				wantInput := "1 2\n"
				if tt.user {
					wantInput = "custom input"
				}
				if result.JudgeResultCode != handler.ACCEPTED || !reflect.DeepEqual(sb.inputs, []string{wantInput}) {
					t.Fatalf("grading result=%+v inputs=%v", result, sb.inputs)
				}
			}
		})
	}
}

func TestIncompleteVersionReferenceRejected(t *testing.T) {
	for _, kind := range []string{"judge", "run"} {
		for _, fields := range []map[string]any{
			{"testcaseSetId": "tcset-42"}, {"manifestKey": "manifest.json"},
			{"testcaseSetId": " ", "manifestKey": "manifest.json"},
			{"testcaseSetId": "tcset-42", "manifestKey": " "},
		} {
			if _, err := makeRequestFactory(kind, &requestTCReader{}, &requestSandbox{}).Create(kind, requestJSON(t, fields)); err == nil {
				t.Fatalf("%s accepted incomplete reference: %v", kind, fields)
			}
		}
	}
}

// Deliberately exposes only the old reader interface.
type legacyOnlyReader struct{ calls int }

func (r *legacyOnlyReader) GetTestcase(context.Context, string, testcase.TestcaseFilterCode) (testcase.Testcase, error) {
	r.calls++
	return testcase.Testcase{}, nil
}

func TestMissingVersionedReaderDoesNotFallback(t *testing.T) {
	reader := &legacyOnlyReader{}
	_, err := testcase.ReadRequestedTestcase(context.Background(), reader, "100", "tcset-42", "manifest.json", testcase.ALL)
	if err == nil || reader.calls != 0 {
		t.Fatalf("missing reader fell back: err=%v calls=%d", err, reader.calls)
	}
}
