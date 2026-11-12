package testcase

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"io/fs"
	"os"
	"path/filepath"
	"strings"

	"github.com/skkuding/codedang/apps/iris/src/loader"
)

const manifestCacheDir = "manifests"

// loadManifest returns the manifest for manifestKey, reading the local copy
// under cacheRoot before the remote source.
func loadManifest(ctx context.Context, cacheRoot string, source loader.BundleSource, manifestKey, testcaseSetID string) (*loader.Manifest, error) {
	if err := ctx.Err(); err != nil {
		return nil, err
	}
	if strings.TrimSpace(manifestKey) == "" || strings.TrimSpace(testcaseSetID) == "" {
		return nil, fmt.Errorf("manifest key and testcaseSetId are required")
	}
	path := manifestCachePath(cacheRoot, manifestKey)

	if data, err := os.ReadFile(path); err == nil {
		manifest, parseErr := loader.ParseManifest(data)
		if parseErr == nil {
			if manifest.TestcaseSetID != testcaseSetID {
				return nil, fmt.Errorf("manifest version mismatch: requested %q, got %q", testcaseSetID, manifest.TestcaseSetID)
			}
			return manifest, nil
		}
		// Corrupt local copy: drop it and fall through to the remote source.
		os.Remove(path)
	} else if !errors.Is(err, fs.ErrNotExist) {
		os.Remove(path)
	}

	manifest, err := loader.LoadManifest(ctx, source, manifestKey, testcaseSetID)
	if err != nil {
		return nil, err
	}
	_ = storeManifest(path, manifest)
	return manifest, nil
}

// manifestCachePath hashes the key so request values never form a file path.
func manifestCachePath(cacheRoot, manifestKey string) string {
	sum := sha256.Sum256([]byte(manifestKey))
	return filepath.Join(cacheRoot, manifestCacheDir, hex.EncodeToString(sum[:])+".json")
}

// storeManifest publishes the manifest with temp file + rename so readers never
// see a partial file. Concurrent writers store identical content.
func storeManifest(path string, manifest *loader.Manifest) error {
	data, err := json.Marshal(manifest)
	if err != nil {
		return err
	}
	dir := filepath.Dir(path)
	if err := os.MkdirAll(dir, 0750); err != nil {
		return err
	}
	file, err := os.CreateTemp(dir, ".manifest-*")
	if err != nil {
		return err
	}
	temp := file.Name()
	defer os.Remove(temp)
	_, writeErr := file.Write(data)
	if err := errors.Join(writeErr, file.Chmod(0440), file.Close()); err != nil {
		return err
	}
	return os.Rename(temp, path)
}
