// Command tc-artifact creates local fixtures for the TAS-3060 PV PoC.
// Run from apps/iris: go run ./example/tools/tc-artifact
// Only objects/ contains upload candidates; requests/ contains RabbitMQ examples.
// This command does not upload objects, send requests, or modify Kubernetes.
package main

import (
	"archive/tar"
	"bytes"
	"crypto/rand"
	"crypto/sha256"
	"encoding/json"
	"flag"
	"fmt"
	"os"
	"path"
	"path/filepath"
	"regexp"

	"github.com/klauspost/compress/zstd"
	"github.com/skkuding/codedang/apps/iris/src/handler/judge"
	"github.com/skkuding/codedang/apps/iris/src/handler/run"
	"github.com/skkuding/codedang/apps/iris/src/loader"
)

const solution = "#include <stdio.h>\nint main(void) { long long a, b; if (scanf(\"%lld %lld\", &a, &b) != 2) return 1; printf(\"%lld\\n\", a + b); return 0; }\n"

type sample struct {
	id                    int
	bundle, input, output string
}

var samples = []sample{
	{1001, "public", "1 2\n", "3\n"},
	{1002, "hidden", "-10 7\n", "-3\n"},
}

func main() {
	out := flag.String("out", "", "new output directory (default: a temporary directory)")
	setID := flag.String("testcase-set-id", "poc-"+rand.Text(), "unique immutable testcase set ID")
	flag.Parse()
	dir, err := generate(*out, *setID)
	if err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
	fmt.Printf("Fixtures: %s\nObject root: %s\nManifest key: testcases/%s/manifest.json\n", dir, filepath.Join(dir, "objects"), *setID)
}

func generate(out, setID string) (string, error) {
	// A single safe path component; never derive the object key from problemId.
	if !regexp.MustCompile(`^[A-Za-z0-9][A-Za-z0-9_-]*$`).MatchString(setID) {
		return "", fmt.Errorf("testcase-set-id must contain only letters, digits, '_' or '-' and start with a letter or digit")
	}
	var err error
	if out == "" {
		out, err = os.MkdirTemp("", "iris-tc-artifact-*")
	} else {
		// Refuse reuse so a previous fixture set cannot be overwritten accidentally.
		err = os.Mkdir(out, 0750)
	}
	if err != nil {
		return "", err
	}
	manifest := loader.Manifest{TestcaseSetID: setID}
	prefix := path.Join("testcases", setID)
	for _, tc := range samples {
		data, err := makeBundle(tc)
		if err != nil {
			return "", err
		}
		digest := fmt.Sprintf("%x", sha256.Sum256(data))
		key := path.Join(prefix, digest+".tar.zst")
		if err := writeFile(filepath.Join(out, "objects", filepath.FromSlash(key)), data); err != nil {
			return "", err
		}
		manifest.Bundles = append(manifest.Bundles, loader.ManifestBundle{
			ID: tc.bundle, ObjectKey: key, Checksum: "sha256:" + digest,
		})
		manifest.Testcases = append(manifest.Testcases, loader.ManifestTestcase{
			ID: tc.id, BundleID: tc.bundle, Input: fmt.Sprintf("%d.in", tc.id),
			Output: fmt.Sprintf("%d.out", tc.id), Hidden: tc.bundle == "hidden", ScoreWeight: 1,
		})
	}
	if err := manifest.Validate(); err != nil {
		return "", err
	}
	key := path.Join(prefix, "manifest.json")
	if err := writeJSON(filepath.Join(out, "objects", filepath.FromSlash(key)), manifest); err != nil {
		return "", err
	}
	// problemId satisfies the legacy request contract, but is not used for TC lookup.
	// Iris passes memory limits to Judger in bytes.
	judgeReq := judge.JudgeRequest{Code: solution, Language: "C", ProblemId: 100,
		TestcaseSetID: setID, ManifestKey: key, TimeLimit: 1000, MemoryLimit: 128 * 1024 * 1024}
	runReq := run.RunRequest{Code: solution, Language: "C", ProblemId: 100,
		TestcaseSetID: setID, ManifestKey: key, TimeLimit: 1000, MemoryLimit: 128 * 1024 * 1024}
	if _, err := judgeReq.Validate(); err != nil {
		return "", err
	}
	if _, err := runReq.Validate(); err != nil {
		return "", err
	}
	// Defaults exercise all TCs for judge and public TCs only for run.
	for _, req := range []struct {
		kind string
		body any
	}{{"judge", judgeReq}, {"run", runReq}} {
		envelope := map[string]any{
			"properties": map[string]string{"messageId": rand.Text(), "type": req.kind},
			"body":       req.body,
		}
		if err := writeJSON(filepath.Join(out, "requests", req.kind+".json"), envelope); err != nil {
			return "", err
		}
	}
	return out, nil
}

func makeBundle(tc sample) ([]byte, error) {
	var archive bytes.Buffer
	tw := tar.NewWriter(&archive)
	// Fixed order and zero timestamps make compressed bytes reproducible.
	for _, file := range []struct{ suffix, content string }{{"in", tc.input}, {"out", tc.output}} {
		if err := tw.WriteHeader(&tar.Header{Name: fmt.Sprintf("%d.%s", tc.id, file.suffix), Mode: 0440, Size: int64(len(file.content)), Typeflag: tar.TypeReg}); err != nil {
			return nil, err
		}
		if _, err := tw.Write([]byte(file.content)); err != nil {
			return nil, err
		}
	}
	if err := tw.Close(); err != nil {
		return nil, err
	}
	encoder, err := zstd.NewWriter(nil, zstd.WithEncoderConcurrency(1))
	if err != nil {
		return nil, err
	}
	defer encoder.Close()
	return encoder.EncodeAll(archive.Bytes(), nil), nil
}

func writeJSON(name string, value any) error {
	data, err := json.MarshalIndent(value, "", "  ")
	if err != nil {
		return err
	}
	return writeFile(name, append(data, '\n'))
}

func writeFile(name string, data []byte) error {
	if err := os.MkdirAll(filepath.Dir(name), 0750); err != nil {
		return err
	}
	return os.WriteFile(name, data, 0640)
}
