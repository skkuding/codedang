package testcase

import (
	"archive/tar"
	"bytes"
	"context"
	"crypto/sha256"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"reflect"
	"strings"
	"testing"

	"github.com/klauspost/compress/zstd"
	"github.com/skkuding/codedang/apps/iris/src/loader"
)

type cacheSource struct {
	objects map[string][]byte
	calls   []string
}

func TestGetVersionedTestcase(t *testing.T) {
	manifest, source := cacheFixture(t, "public input")
	key := "testcases/tcset-42/manifest.json"
	data, err := json.Marshal(manifest)
	if err != nil {
		t.Fatal(err)
	}
	source.objects[key] = data
	root := t.TempDir()
	first, err := GetVersionedTestcase(context.Background(), root, source, "tcset-42", key, PUBLIC_ONLY)
	if err != nil || len(first.Elements) != 1 || first.Elements[0].In != "public input" {
		t.Fatalf("first request: %+v %v", first, err)
	}
	second, err := GetVersionedTestcase(context.Background(), root, source, "tcset-42", key, PUBLIC_ONLY)
	wantCalls := []string{key, manifest.Bundles[0].ObjectKey, key}
	if err != nil || !reflect.DeepEqual(first, second) || !reflect.DeepEqual(source.calls, wantCalls) {
		t.Fatalf("repeat request: %+v %v downloads=%v", second, err, source.calls)
	}
	// Even a warm cache cannot bypass manifest version checks.
	source.calls = nil
	got, err := GetVersionedTestcase(context.Background(), root, source, "tcset-43", key, PUBLIC_ONLY)
	if err == nil || len(got.Elements) != 0 || !reflect.DeepEqual(source.calls, []string{key}) {
		t.Fatalf("version mismatch: %+v %v downloads=%v", got, err, source.calls)
	}
	delete(source.objects, key)
	if _, err := GetVersionedTestcase(context.Background(), root, source, "tcset-42", key, PUBLIC_ONLY); err == nil {
		t.Fatal("missing manifest must fail even with cached bundles")
	}
}

func (s *cacheSource) OpenObject(_ context.Context, key string) (io.ReadCloser, error) {
	s.calls = append(s.calls, key)
	data, ok := s.objects[key]
	if !ok {
		return nil, fmt.Errorf("unexpected download %q", key)
	}
	return io.NopCloser(bytes.NewReader(data)), nil
}

// Create compressed fixtures in memory; no live S3 or Kubernetes is required.
func cacheFixture(t *testing.T, publicInput string) (loader.Manifest, *cacheSource) {
	t.Helper()
	m := loader.Manifest{TestcaseSetID: "tcset-42"}
	source := &cacheSource{objects: make(map[string][]byte)}
	for i, id := range []string{"public", "hidden"} {
		var compressed bytes.Buffer
		encoder, err := zstd.NewWriter(&compressed, zstd.WithEncoderConcurrency(1))
		if err != nil {
			t.Fatal(err)
		}
		writer := tar.NewWriter(encoder)
		input := publicInput
		if id == "hidden" {
			input = "hidden input\n"
		}
		for j, name := range []string{"nested/1.in", "nested/1.out"} {
			data := input
			if j == 1 {
				data = "expected output\n"
			}
			if err := writer.WriteHeader(&tar.Header{Name: name, Mode: 0644, Size: int64(len(data))}); err != nil {
				t.Fatal(err)
			}
			if _, err := writer.Write([]byte(data)); err != nil {
				t.Fatal(err)
			}
		}
		if err := errors.Join(writer.Close(), encoder.Close()); err != nil {
			t.Fatal(err)
		}
		data := compressed.Bytes()
		digest := fmt.Sprintf("%x", sha256.Sum256(data))
		key := "testcases/" + m.TestcaseSetID + "/" + digest + ".tar.zst"
		source.objects[key] = data
		m.Bundles = append(m.Bundles, loader.ManifestBundle{ID: id, ObjectKey: key, Checksum: "sha256:" + digest})
		m.Testcases = append(m.Testcases, loader.ManifestTestcase{
			ID: 1001 + i, BundleID: id, Input: "nested/1.in", Output: "nested/1.out", Hidden: id == "hidden", ScoreWeight: 1,
		})
	}
	return m, source
}

func TestGetCachedTestcaseFiltersAndReuse(t *testing.T) {
	for _, filter := range []TestcaseFilterCode{ALL, PUBLIC_ONLY, HIDDEN_ONLY} {
		t.Run(fmt.Sprint(filter), func(t *testing.T) {
			manifest, source := cacheFixture(t, "public input\n")
			// Deliberately differ from bundle order and testcase ID order.
			manifest.Testcases[0], manifest.Testcases[1] = manifest.Testcases[1], manifest.Testcases[0]
			root := t.TempDir()
			got, err := GetCachedTestcase(context.Background(), root, source, manifest, filter)
			if err != nil {
				t.Fatal(err)
			}
			want := []loader.ElementOut{}
			keys := []string{}
			if filter != PUBLIC_ONLY {
				want = append(want, loader.ElementOut{Id: 1002, In: "hidden input\n", Out: "expected output\n", Hidden: true})
				keys = append(keys, manifest.Bundles[1].ObjectKey)
			}
			if filter != HIDDEN_ONLY {
				want = append(want, loader.ElementOut{Id: 1001, In: "public input\n", Out: "expected output\n"})
				keys = append(keys, manifest.Bundles[0].ObjectKey)
			}
			if !reflect.DeepEqual(got.Elements, want) || !reflect.DeepEqual(source.calls, keys) {
				t.Fatalf("elements=%+v downloads=%v", got.Elements, source.calls)
			}
			// A new source with no objects simulates reuse with the remote unavailable.
			offline := &cacheSource{}
			again, err := GetCachedTestcase(context.Background(), root, offline, manifest, filter)
			if err != nil || !reflect.DeepEqual(got, again) || len(offline.calls) != 0 {
				t.Fatalf("cache reuse: result=%+v err=%v downloads=%v", again, err, offline.calls)
			}
		})
	}
}

func TestGetCachedTestcasePartialHitAndVersionChange(t *testing.T) {
	manifest, source := cacheFixture(t, "old input")
	root := t.TempDir()
	if _, err := GetCachedTestcase(context.Background(), root, source, manifest, PUBLIC_ONLY); err != nil {
		t.Fatal(err)
	}
	if _, err := GetCachedTestcase(context.Background(), root, source, manifest, ALL); err != nil {
		t.Fatal(err)
	}
	if len(source.calls) != 2 {
		t.Fatalf("partial hit downloaded %d bundles, want 2 total", len(source.calls))
	}
	updated, newerSource := cacheFixture(t, "new input")
	updated.TestcaseSetID = "tcset-43"
	for i := range updated.Bundles {
		bundle := &updated.Bundles[i]
		oldKey := bundle.ObjectKey
		bundle.ObjectKey = strings.Replace(oldKey, "tcset-42", "tcset-43", 1)
		newerSource.objects[bundle.ObjectKey] = newerSource.objects[oldKey]
		delete(newerSource.objects, oldKey)
	}
	// Object keys are exact references; only the changed bundle needs installing.
	got, err := GetCachedTestcase(context.Background(), root, newerSource, updated, ALL)
	if err != nil || got.Elements[0].In != "new input" || len(newerSource.calls) != 1 {
		t.Fatalf("version change: result=%+v err=%v downloads=%v", got, err, newerSource.calls)
	}
	old, err := GetCachedTestcase(context.Background(), root, &cacheSource{}, manifest, ALL)
	if err != nil || old.Elements[0].In != "old input" {
		t.Fatalf("old version lost: %+v %v", old, err)
	}
}

func TestGetCachedTestcaseMultipleTestcasesPerBundle(t *testing.T) {
	manifest, source := cacheFixture(t, "input")
	second := manifest.Testcases[0]
	second.ID = 1003
	manifest.Testcases = append(manifest.Testcases, second)
	got, err := GetCachedTestcase(context.Background(), t.TempDir(), source, manifest, PUBLIC_ONLY)
	if err != nil || len(got.Elements) != 2 || len(source.calls) != 1 {
		t.Fatalf("shared bundle: result=%+v err=%v downloads=%v", got, err, source.calls)
	}
	if got.Elements[0].Id != 1001 || got.Elements[1].Id != 1003 {
		t.Fatalf("testcase order changed: %+v", got.Elements)
	}
}

func TestGetCachedTestcaseRejectsCacheSymlink(t *testing.T) {
	manifest, source := cacheFixture(t, "input")
	root := t.TempDir()
	if _, err := GetCachedTestcase(context.Background(), root, source, manifest, PUBLIC_ONLY); err != nil {
		t.Fatal(err)
	}
	digest := strings.TrimPrefix(manifest.Bundles[0].Checksum, "sha256:")
	dir := filepath.Join(root, "sha256", digest[:2], digest)
	input := filepath.Join(dir, "nested", "1.in")
	if err := os.Remove(input); err != nil {
		t.Fatal(err)
	}
	if err := os.Symlink(filepath.Join(t.TempDir(), "outside"), input); err != nil {
		t.Fatal(err)
	}
	offline := &cacheSource{}
	if _, err := GetCachedTestcase(context.Background(), root, offline, manifest, PUBLIC_ONLY); err == nil || len(offline.calls) != 0 {
		t.Fatalf("symlink must fail without repair: err=%v downloads=%v", err, offline.calls)
	}
}

func TestGetCachedTestcaseMissingFile(t *testing.T) {
	manifest, source := cacheFixture(t, "input")
	root := t.TempDir()
	if _, err := GetCachedTestcase(context.Background(), root, source, manifest, ALL); err != nil {
		t.Fatal(err)
	}
	digest := strings.TrimPrefix(manifest.Bundles[1].Checksum, "sha256:")
	name := filepath.Join(root, "sha256", digest[:2], digest, "nested", "1.out")
	if err := os.Remove(name); err != nil {
		t.Fatal(err)
	}
	offline := &cacheSource{}
	got, err := GetCachedTestcase(context.Background(), root, offline, manifest, ALL)
	if !errors.Is(err, os.ErrNotExist) || len(got.Elements) != 0 || len(offline.calls) != 0 {
		t.Fatalf("missing file must fail without partial result or repair: %+v %v %v", got, err, offline.calls)
	}
}

func TestGetCachedTestcaseInvalidAndEmptySelection(t *testing.T) {
	manifest, source := cacheFixture(t, "input")
	root := t.TempDir()
	ctx, cancel := context.WithCancel(context.Background())
	cancel()
	if _, err := GetCachedTestcase(ctx, root, source, manifest, ALL); !errors.Is(err, context.Canceled) {
		t.Fatalf("expected cancellation: %v", err)
	}
	if _, err := GetCachedTestcase(context.Background(), root, source, manifest, 99); err == nil {
		t.Fatal("invalid filter accepted")
	}
	if _, err := GetCachedTestcase(context.Background(), root, source, loader.Manifest{}, ALL); err == nil {
		t.Fatal("invalid manifest accepted")
	}
	if _, err := GetCachedTestcase(context.Background(), "", source, manifest, ALL); err == nil {
		t.Fatal("empty cache root accepted")
	}
	manifest.Testcases = manifest.Testcases[:1]
	got, err := GetCachedTestcase(context.Background(), root, source, manifest, HIDDEN_ONLY)
	if err != nil || len(got.Elements) != 0 || len(source.calls) != 0 {
		t.Fatalf("empty selection: %+v %v downloads=%v", got, err, source.calls)
	}
}
