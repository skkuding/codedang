package main

import (
	"context"
	"encoding/json"
	"io"
	"os"
	"path/filepath"
	"reflect"
	"strconv"
	"testing"

	"github.com/skkuding/codedang/apps/iris/src/handler/judge"
	"github.com/skkuding/codedang/apps/iris/src/handler/run"
	"github.com/skkuding/codedang/apps/iris/src/router/response"
	"github.com/skkuding/codedang/apps/iris/src/service/testcase"
)

// Use generated files through the real versioned loader, without S3 or Kubernetes.
type localSource struct {
	root string
	keys []string
}

func (s *localSource) OpenObject(_ context.Context, key string) (io.ReadCloser, error) {
	s.keys = append(s.keys, key)
	return os.Open(filepath.Join(s.root, filepath.FromSlash(key)))
}

func TestGeneratedFixturesLoadAndReuseCache(t *testing.T) {
	dir, err := generate(filepath.Join(t.TempDir(), "fixtures"), "poc-test")
	if err != nil {
		t.Fatal(err)
	}
	source := &localSource{root: filepath.Join(dir, "objects")}
	cache := t.TempDir()
	key := "testcases/poc-test/manifest.json"
	for _, step := range []struct {
		filter testcase.TestcaseFilterCode
		ids    []int
		reads  int
	}{
		// Only the first request fetches the manifest; later ones read it locally.
		{testcase.PUBLIC_ONLY, []int{1001}, 2},
		{testcase.ALL, []int{1001, 1002}, 3},
		{testcase.HIDDEN_ONLY, []int{1002}, 3},
		{testcase.ALL, []int{1001, 1002}, 3},
	} {
		got, err := testcase.GetVersionedTestcase(context.Background(), cache, source, "poc-test", key, step.filter)
		if err != nil {
			t.Fatal(err)
		}
		var ids []int
		for _, tc := range got.Elements {
			ids = append(ids, tc.Id)
			want := samples[tc.Id-1001]
			if tc.In != want.input || tc.Out != want.output || tc.Hidden != (want.bundle == "hidden") {
				t.Fatalf("unexpected testcase: %+v", tc)
			}
		}
		if !reflect.DeepEqual(ids, step.ids) || len(source.keys) != step.reads {
			t.Fatalf("ids=%v reads=%v", ids, source.keys)
		}
	}
	seenIDs := make(map[int]bool)
	for _, kind := range []string{"judge", "run"} {
		data, err := os.ReadFile(filepath.Join(dir, "requests", kind+".json"))
		if err != nil {
			t.Fatal(err)
		}
		var envelope struct {
			Properties struct {
				MessageID string `json:"messageId"`
				Type      string `json:"type"`
			} `json:"properties"`
			Body json.RawMessage `json:"body"`
		}
		if err := json.Unmarshal(data, &envelope); err != nil {
			t.Fatal(err)
		}
		if envelope.Properties.Type != kind || envelope.Properties.MessageID == "" {
			t.Fatal("invalid message properties")
		}
		id, err := strconv.Atoi(envelope.Properties.MessageID)
		if err != nil || id <= 0 || seenIDs[id] {
			t.Fatalf("invalid or duplicate numeric messageId: %q", envelope.Properties.MessageID)
		}
		seenIDs[id] = true
		// Exercise the actual response conversion that previously returned zero.
		result := response.NewJudgeResponse(envelope.Properties.MessageID, nil, nil)
		if result.SubmissionId != id {
			t.Fatalf("response lost messageId: got %d, want %d", result.SubmissionId, id)
		}
		if kind == "judge" {
			var req judge.JudgeRequest
			if err := json.Unmarshal(envelope.Body, &req); err != nil {
				t.Fatal(err)
			}
			if _, err := req.Validate(); err != nil {
				t.Fatal(err)
			}
			if req.TestcaseSetID != "poc-test" || req.ManifestKey != key || req.JudgeOnlyHiddenTestcases {
				t.Fatal("invalid judge reference/filter")
			}
		} else {
			var req run.RunRequest
			if err := json.Unmarshal(envelope.Body, &req); err != nil {
				t.Fatal(err)
			}
			if _, err := req.Validate(); err != nil {
				t.Fatal(err)
			}
			if req.TestcaseSetID != "poc-test" || req.ManifestKey != key || req.ContainHiddenTestcases {
				t.Fatal("invalid run reference/filter")
			}
		}
	}
}

func TestFixturesAreReproducibleAndDoNotOverwrite(t *testing.T) {
	parent := t.TempDir()
	first, err := generate(filepath.Join(parent, "first"), "poc-same")
	if err != nil {
		t.Fatal(err)
	}
	second, err := generate(filepath.Join(parent, "second"), "poc-same")
	if err != nil {
		t.Fatal(err)
	}
	if err := filepath.WalkDir(filepath.Join(first, "objects"), func(name string, entry os.DirEntry, err error) error {
		if err != nil {
			return err
		}
		if entry.IsDir() {
			return nil
		}
		rel, err := filepath.Rel(first, name)
		if err != nil {
			return err
		}
		a, err := os.ReadFile(name)
		if err != nil {
			return err
		}
		b, err := os.ReadFile(filepath.Join(second, rel))
		if err != nil {
			return err
		}
		if string(a) != string(b) {
			t.Errorf("non-reproducible object: %s", rel)
		}
		return nil
	}); err != nil {
		t.Fatal(err)
	}
	if _, err := generate(first, "poc-other"); err == nil {
		t.Fatal("existing output accepted")
	}
	for _, id := range []string{"", "../escape", "a/b", "."} {
		if _, err := generate(filepath.Join(parent, "invalid"), id); err == nil {
			t.Fatalf("invalid ID accepted: %q", id)
		}
	}
}
