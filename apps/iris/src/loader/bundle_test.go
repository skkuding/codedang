package loader

import (
	"archive/tar"
	"bytes"
	"context"
	"crypto/sha256"
	"errors"
	"fmt"
	"io"
	"io/fs"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"testing"

	"github.com/klauspost/compress/zstd"
)

type bundleSourceFunc func(context.Context, string) (io.ReadCloser, error)

func (f bundleSourceFunc) OpenObject(ctx context.Context, key string) (io.ReadCloser, error) {
	return f(ctx, key)
}

type bundleEntry struct {
	name, data string
	kind       byte
}

func makeBundle(t *testing.T, entries []bundleEntry) []byte {
	t.Helper()
	var buf bytes.Buffer
	encoder, err := zstd.NewWriter(&buf, zstd.WithEncoderConcurrency(1))
	if err != nil {
		t.Fatal(err)
	}
	writer := tar.NewWriter(encoder)
	for _, entry := range entries {
		header := &tar.Header{Name: entry.name, Typeflag: entry.kind, Mode: 0644}
		if entry.kind == tar.TypeReg {
			header.Size = int64(len(entry.data))
		}
		if entry.kind == tar.TypeSymlink || entry.kind == tar.TypeLink {
			header.Linkname = "../outside"
		}
		if err := writer.WriteHeader(header); err != nil {
			t.Fatal(err)
		}
		if _, err := writer.Write([]byte(entry.data)); err != nil {
			t.Fatal(err)
		}
	}
	if err := errors.Join(writer.Close(), encoder.Close()); err != nil {
		t.Fatal(err)
	}
	return buf.Bytes()
}

func manifestForBundle(data []byte) Manifest {
	manifest := sampleManifest()
	digest := fmt.Sprintf("%x", sha256.Sum256(data))
	manifest.Bundles[0].Checksum = "sha256:" + digest
	manifest.Bundles[0].ObjectKey = "testcases/tcset-42/" + digest + ".tar.zst"
	return manifest
}

func TestInstallBundle(t *testing.T) {
	data := makeBundle(t, []bundleEntry{
		{"./", "", tar.TypeDir},
		{"./nested/", "", tar.TypeDir},
		{"./nested/1001.in", "1 2\n", tar.TypeReg},
		{"./nested/1001.out", "3\n", tar.TypeReg},
	})
	manifest := manifestForBundle(data)
	manifest.Testcases[0].Input = "nested/1001.in"
	manifest.Testcases[0].Output = "nested/1001.out"
	root := t.TempDir()
	calls := 0
	body := &trackedBundleBody{Reader: bytes.NewReader(data)}
	source := bundleSourceFunc(func(ctx context.Context, key string) (io.ReadCloser, error) {
		calls++
		if key != manifest.Bundles[0].ObjectKey {
			t.Fatalf("requested %q instead of selected public bundle", key)
		}
		return body, nil
	})
	installed, err := InstallBundle(context.Background(), root, source, manifest, "public")
	if err != nil {
		t.Fatal(err)
	}
	digest := strings.TrimPrefix(manifest.Bundles[0].Checksum, "sha256:")
	if want := filepath.Join(root, "sha256", digest[:2], digest); installed != want {
		t.Fatalf("installed at %q, want %q", installed, want)
	}
	for name, want := range map[string]string{"1001.in": "1 2\n", "1001.out": "3\n"} {
		got, err := os.ReadFile(filepath.Join(installed, "nested", name))
		if err != nil || string(got) != want {
			t.Fatalf("read %s: %q, %v", name, got, err)
		}
	}
	if !body.closed || calls != 1 {
		t.Fatalf("body closed=%t, downloads=%d", body.closed, calls)
	}
	assertNoBundleStaging(t, root)
	// Installing an existing bundle returns it without downloading again.
	again, err := InstallBundle(context.Background(), root, source, manifest, "public")
	if err != nil || again != installed || calls != 1 {
		t.Fatalf("existing cache: path=%q err=%v downloads=%d", again, err, calls)
	}
}

func validBundle(t *testing.T) ([]byte, Manifest) {
	t.Helper()
	data := makeBundle(t, []bundleEntry{
		{"1001.in", "1 2\n", tar.TypeReg},
		{"1001.out", "3\n", tar.TypeReg},
	})
	return data, manifestForBundle(data)
}

func bundleDestination(root string, manifest Manifest) string {
	digest := strings.TrimPrefix(manifest.Bundles[0].Checksum, "sha256:")
	return filepath.Join(root, "sha256", digest[:2], digest)
}

func TestInstallBundleRejectsNonDirectoryDestination(t *testing.T) {
	data, manifest := validBundle(t)
	root := t.TempDir()
	destination := bundleDestination(root, manifest)
	if err := os.MkdirAll(filepath.Dir(destination), 0750); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(destination, []byte("not a bundle"), 0600); err != nil {
		t.Fatal(err)
	}
	source := bundleSourceFunc(func(context.Context, string) (io.ReadCloser, error) {
		return io.NopCloser(bytes.NewReader(data)), nil
	})
	if path, err := InstallBundle(context.Background(), root, source, manifest, "public"); err == nil {
		t.Fatalf("non-directory destination accepted at %q", path)
	}
}

// Another installer (e.g. a different Iris Pod on the same PV) publishes the
// bundle after this one checked the destination but before it renames.
func TestInstallBundleUsesInstallationPublishedFirst(t *testing.T) {
	data, manifest := validBundle(t)
	root := t.TempDir()
	destination := bundleDestination(root, manifest)
	source := bundleSourceFunc(func(context.Context, string) (io.ReadCloser, error) {
		if err := os.MkdirAll(destination, 0750); err != nil {
			t.Fatal(err)
		}
		if err := os.WriteFile(filepath.Join(destination, "1001.in"), []byte("winner"), 0440); err != nil {
			t.Fatal(err)
		}
		return io.NopCloser(bytes.NewReader(data)), nil
	})
	installed, err := InstallBundle(context.Background(), root, source, manifest, "public")
	if err != nil || installed != destination {
		t.Fatalf("lost race: path=%q err=%v", installed, err)
	}
	// The existing installation is kept, not replaced by this installer's copy.
	if got, err := os.ReadFile(filepath.Join(destination, "1001.in")); err != nil || string(got) != "winner" {
		t.Fatalf("existing installation replaced: %q, %v", got, err)
	}
	assertNoBundleStaging(t, root)
}

// Installers share no memory, like separate Pods; they only share the cache root.
func TestInstallBundleConcurrentInstallers(t *testing.T) {
	const installers = 8
	data, manifest := validBundle(t)
	root := t.TempDir()
	var opened sync.WaitGroup
	opened.Add(installers)
	ready := make(chan struct{})
	go func() { opened.Wait(); close(ready) }()
	source := bundleSourceFunc(func(context.Context, string) (io.ReadCloser, error) {
		// Hold every installer past the existence check so all of them race to rename.
		opened.Done()
		<-ready
		return io.NopCloser(bytes.NewReader(data)), nil
	})

	type result struct {
		path string
		err  error
	}
	results := make(chan result, installers)
	for range installers {
		go func() {
			path, err := InstallBundle(context.Background(), root, source, manifest, "public")
			results <- result{path, err}
		}()
	}
	destination := bundleDestination(root, manifest)
	for range installers {
		if r := <-results; r.err != nil || r.path != destination {
			t.Fatalf("concurrent install: path=%q err=%v", r.path, r.err)
		}
	}
	for name, want := range map[string]string{"1001.in": "1 2\n", "1001.out": "3\n"} {
		got, err := os.ReadFile(filepath.Join(destination, name))
		if err != nil || string(got) != want {
			t.Fatalf("read %s: %q, %v", name, got, err)
		}
	}
	assertNoBundleStaging(t, root)
}

func TestInstallBundleRejectsInvalidArtifacts(t *testing.T) {
	valid := []bundleEntry{{"1001.in", "1 2\n", tar.TypeReg}, {"1001.out", "3\n", tar.TypeReg}}
	tests := []struct {
		name  string
		extra bundleEntry
		mode  string
	}{
		{name: "checksum mismatch", mode: "checksum"},
		{name: "invalid zstd", mode: "zstd"},
		{name: "truncated zstd", mode: "truncated"},
		{name: "missing expected output", mode: "missing"},
		{name: "directory instead of output", mode: "directory"},
		{name: "traversal", extra: bundleEntry{"../escape", "bad", tar.TypeReg}},
		{name: "absolute path", extra: bundleEntry{"/escape", "bad", tar.TypeReg}},
		{name: "absolute directory", extra: bundleEntry{"/", "", tar.TypeDir}},
		{name: "backslash", extra: bundleEntry{`..\escape`, "bad", tar.TypeReg}},
		{name: "symlink", extra: bundleEntry{"link", "", tar.TypeSymlink}},
		{name: "hard link", extra: bundleEntry{"link", "", tar.TypeLink}},
		{name: "fifo", extra: bundleEntry{"pipe", "", tar.TypeFifo}},
		{name: "duplicate file", extra: valid[0]},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			entries := append([]bundleEntry{}, valid...)
			if tt.mode == "missing" || tt.mode == "directory" {
				entries = entries[:1]
			}
			if tt.mode == "directory" {
				entries = append(entries, bundleEntry{"1001.out/", "", tar.TypeDir})
			}
			if tt.extra.name != "" {
				entries = append(entries, tt.extra)
			}
			data := makeBundle(t, entries)
			if tt.mode == "zstd" {
				data = []byte("not a compressed bundle")
			}
			if tt.mode == "truncated" {
				data = data[:len(data)-1]
			}
			manifest := manifestForBundle(data)
			if tt.mode == "checksum" {
				manifest.Bundles[0].Checksum = "sha256:" + strings.Repeat("0", 64)
			}
			source := bundleSourceFunc(func(context.Context, string) (io.ReadCloser, error) {
				return io.NopCloser(bytes.NewReader(data)), nil
			})
			root := t.TempDir()
			path, err := InstallBundle(context.Background(), root, source, manifest, "public")
			if err == nil || path != "" {
				t.Fatalf("invalid bundle installed at %q: %v", path, err)
			}
			assertNoBundleStaging(t, root)
			digest := strings.TrimPrefix(manifest.Bundles[0].Checksum, "sha256:")
			if _, err := os.Stat(filepath.Join(root, "sha256", digest[:2], digest)); !errors.Is(err, fs.ErrNotExist) {
				t.Fatalf("failed installation was published: %v", err)
			}
		})
	}
}

type trackedBundleBody struct {
	io.Reader
	closed bool
}

func (b *trackedBundleBody) Close() error { b.closed = true; return nil }

type failedBundleReader struct{ err error }

func (r failedBundleReader) Read([]byte) (int, error) { return 0, r.err }

func TestInstallBundleDownloadFailure(t *testing.T) {
	for _, duringRead := range []bool{false, true} {
		t.Run(fmt.Sprintf("duringRead=%t", duringRead), func(t *testing.T) {
			failure := errors.New("download failed")
			body := &trackedBundleBody{Reader: failedBundleReader{failure}}
			source := bundleSourceFunc(func(context.Context, string) (io.ReadCloser, error) {
				if !duringRead {
					return nil, failure
				}
				return body, nil
			})
			root := t.TempDir()
			_, err := InstallBundle(context.Background(), root, source, sampleManifest(), "public")
			if !errors.Is(err, failure) || (duringRead && !body.closed) {
				t.Fatalf("download failure: err=%v, closed=%t", err, body.closed)
			}
			assertNoBundleStaging(t, root)
		})
	}
}

func TestInstallBundleCanceledDownload(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()
	body := &trackedBundleBody{Reader: strings.NewReader("unused")}
	source := bundleSourceFunc(func(context.Context, string) (io.ReadCloser, error) {
		cancel()
		return body, nil
	})
	root := t.TempDir()
	_, err := InstallBundle(ctx, root, source, sampleManifest(), "public")
	if !errors.Is(err, context.Canceled) || !body.closed {
		t.Fatalf("canceled download: err=%v, closed=%t", err, body.closed)
	}
	assertNoBundleStaging(t, root)
}

func TestInstallBundleInvalidRequest(t *testing.T) {
	source := bundleSourceFunc(func(context.Context, string) (io.ReadCloser, error) {
		t.Fatal("invalid request must not download")
		return nil, nil
	})
	ctx, cancel := context.WithCancel(context.Background())
	cancel()
	if _, err := InstallBundle(ctx, t.TempDir(), source, sampleManifest(), "public"); !errors.Is(err, context.Canceled) {
		t.Fatalf("expected cancellation: %v", err)
	}
	if _, err := InstallBundle(context.Background(), t.TempDir(), source, sampleManifest(), "missing"); err == nil {
		t.Fatal("unknown bundle accepted")
	}
	if _, err := InstallBundle(context.Background(), t.TempDir(), source, Manifest{}, "public"); err == nil {
		t.Fatal("invalid manifest accepted")
	}
	if _, err := InstallBundle(context.Background(), "", source, sampleManifest(), "public"); err == nil {
		t.Fatal("empty root accepted")
	}
}

func assertNoBundleStaging(t *testing.T, root string) {
	t.Helper()
	matches, err := filepath.Glob(filepath.Join(root, "sha256", "*", ".install-*"))
	if err != nil || len(matches) != 0 {
		t.Fatalf("staging directories remain: %v, %v", matches, err)
	}
}
