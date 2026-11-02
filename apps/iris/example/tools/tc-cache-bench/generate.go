package main

import (
	"archive/tar"
	"context"
	"crypto/rand"
	"crypto/sha256"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	mathrand "math/rand"
	"os"
	"path"
	"path/filepath"
	"strings"

	"github.com/klauspost/compress/zstd"
	"github.com/skkuding/codedang/apps/iris/src/loader"
)

func generate(ctx context.Context, out string, sizes []int64) error {
	if len(sizes) == 0 {
		return fmt.Errorf("sizes must not be empty")
	}
	for _, size := range sizes {
		if size < 8 || size%2 != 0 {
			return fmt.Errorf("size must be even and >= 8")
		}
	}
	// Refuse overwrite. Failed generation may leave partial fixtures for inspection.
	if err := os.Mkdir(out, 0750); err != nil {
		return err
	}
	var suite []dataset
	runID := rand.Text()
	for _, size := range sizes {
		for _, pattern := range []string{"repeat", "random"} {
			name := fmt.Sprintf("%s-%d", pattern, size)
			setID := "bench-" + runID + "-" + name
			prefix := path.Join("testcases", setID)
			dir := filepath.Join(out, "objects", filepath.FromSlash(prefix))
			if err := os.MkdirAll(dir, 0750); err != nil {
				return err
			}
			manifest := loader.Manifest{TestcaseSetID: setID}
			item := dataset{Name: name, SetID: setID, ManifestKey: path.Join(prefix, "manifest.json"), RawBytes: size}
			for i, visibility := range []string{"public", "hidden"} {
				digest, compressed, err := writeBundle(ctx, dir, pattern, i+1, size/2)
				if err != nil {
					return err
				}
				item.BundleBytes += compressed
				manifest.Bundles = append(manifest.Bundles, loader.ManifestBundle{ID: visibility, ObjectKey: path.Join(prefix, digest+".tar.zst"), Checksum: "sha256:" + digest})
				manifest.Testcases = append(manifest.Testcases, loader.ManifestTestcase{ID: i + 1, BundleID: visibility, Input: fmt.Sprintf("%d.in", i+1), Output: fmt.Sprintf("%d.out", i+1), Hidden: i == 1, ScoreWeight: 1})
			}
			if err := manifest.Validate(); err != nil {
				return err
			}
			if err := writeJSON(filepath.Join(dir, "manifest.json"), manifest); err != nil {
				return err
			}
			suite = append(suite, item)
		}
	}
	return writeJSON(filepath.Join(out, "suite.json"), suite)
}

// rawBytes includes both input and output, excluding tar metadata. Each dataset
// is split evenly across public/hidden; fixed seeds/tar metadata reproduce bytes.
func writeBundle(ctx context.Context, dir, pattern string, id int, rawBytes int64) (string, int64, error) {
	f, err := os.CreateTemp(dir, ".bundle-*")
	if err != nil {
		return "", 0, err
	}
	defer os.Remove(f.Name())
	defer f.Close()
	hash := sha256.New()
	zw, err := zstd.NewWriter(io.MultiWriter(f, hash), zstd.WithEncoderConcurrency(1))
	if err != nil {
		return "", 0, err
	}
	defer zw.Close()
	tw := tar.NewWriter(zw)
	defer tw.Close()
	if err := tw.WriteHeader(&tar.Header{Name: fmt.Sprintf("%d.in", id), Mode: 0440, Size: rawBytes - 2, Typeflag: tar.TypeReg}); err != nil {
		return "", 0, err
	}
	rng := mathrand.New(mathrand.NewSource(int64(3060 + id)))
	buffer := make([]byte, 64*1024)
	for remaining := rawBytes - 2; remaining > 0; {
		if err := ctx.Err(); err != nil {
			return "", 0, err
		}
		chunk := buffer[:min(int64(len(buffer)), remaining)]
		if pattern == "random" {
			if _, err := rng.Read(chunk); err != nil {
				return "", 0, err
			}
		} else {
			for i := range chunk {
				chunk[i] = 'a'
			}
		}
		if _, err := tw.Write(chunk); err != nil {
			return "", 0, err
		}
		remaining -= int64(len(chunk))
	}
	if err := tw.WriteHeader(&tar.Header{Name: fmt.Sprintf("%d.out", id), Mode: 0440, Size: 2, Typeflag: tar.TypeReg}); err != nil {
		return "", 0, err
	}
	if _, err := io.Copy(tw, strings.NewReader("0\n")); err != nil {
		return "", 0, err
	}
	if err := tw.Close(); err != nil {
		return "", 0, err
	}
	if err := zw.Close(); err != nil {
		return "", 0, err
	}
	info, statErr := f.Stat()
	if err := errors.Join(statErr, f.Close()); err != nil {
		return "", 0, err
	}
	digest := fmt.Sprintf("%x", hash.Sum(nil))
	if err := os.Rename(f.Name(), filepath.Join(dir, digest+".tar.zst")); err != nil {
		return "", 0, err
	}
	return digest, info.Size(), nil
}

func writeJSON(name string, value any) error {
	data, err := json.MarshalIndent(value, "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile(name, append(data, '\n'), 0640)
}
