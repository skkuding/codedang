package loader

import (
	"context"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"io/fs"
	"strings"
)

type Manifest struct {
	TestcaseSetID string             `json:"testcaseSetId"`
	Bundles       []ManifestBundle   `json:"bundles"`
	Testcases     []ManifestTestcase `json:"testcases"`
}

type ManifestBundle struct {
	ID        string `json:"id"`
	ObjectKey string `json:"objectKey"`
	Checksum  string `json:"checksum"`
}

type ManifestTestcase struct {
	ID          int     `json:"id"`
	BundleID    string  `json:"bundleId"`
	Input       string  `json:"input"`
	Output      string  `json:"output"`
	Hidden      bool    `json:"hidden"`
	ScoreWeight float64 `json:"scoreWeight"`
}

// LoadManifest reads the exact immutable object referenced by a request.
// Version mismatches fail without looking up the current problem's testcases.
func LoadManifest(ctx context.Context, source BundleSource, manifestKey, testcaseSetID string) (*Manifest, error) {
	if err := ctx.Err(); err != nil {
		return nil, err
	}
	if source == nil || strings.TrimSpace(manifestKey) == "" || strings.TrimSpace(testcaseSetID) == "" {
		return nil, fmt.Errorf("manifest source, key and testcaseSetId are required")
	}
	body, err := source.OpenObject(ctx, manifestKey)
	if err != nil {
		return nil, fmt.Errorf("load manifest %q: %w", manifestKey, err)
	}
	data, readErr := io.ReadAll(bundleContextReader{ctx, body})
	if err := errors.Join(readErr, body.Close(), ctx.Err()); err != nil {
		return nil, fmt.Errorf("read manifest %q: %w", manifestKey, err)
	}
	manifest, err := ParseManifest(data)
	if err != nil {
		return nil, fmt.Errorf("manifest %q: %w", manifestKey, err)
	}
	if manifest.TestcaseSetID != testcaseSetID {
		return nil, fmt.Errorf("manifest version mismatch: requested %q, got %q", testcaseSetID, manifest.TestcaseSetID)
	}
	return manifest, nil
}

// ParseManifest validates metadata only. Downloaded bytes and archive entries
// must be verified separately before installing a bundle in the cache.
func ParseManifest(data []byte) (*Manifest, error) {
	var manifest Manifest
	if err := json.Unmarshal(data, &manifest); err != nil {
		return nil, fmt.Errorf("decode testcase manifest: %w", err)
	}
	if err := manifest.Validate(); err != nil {
		return nil, err
	}
	return &manifest, nil
}

func (m Manifest) Validate() error {
	if strings.TrimSpace(m.TestcaseSetID) == "" {
		return fmt.Errorf("manifest: testcaseSetId must not be empty")
	}
	if len(m.Bundles) == 0 || len(m.Testcases) == 0 {
		return fmt.Errorf("manifest: bundles and testcases must not be empty")
	}

	bundles := make(map[string]bool, len(m.Bundles))
	for _, bundle := range m.Bundles {
		if bundle.ID != "public" && bundle.ID != "hidden" {
			return fmt.Errorf("manifest: unsupported bundle id %q", bundle.ID)
		}
		if bundles[bundle.ID] {
			return fmt.Errorf("manifest: duplicate bundle id %q", bundle.ID)
		}
		if strings.TrimSpace(bundle.ObjectKey) == "" {
			return fmt.Errorf("manifest: bundle %q has an empty objectKey", bundle.ID)
		}
		// Canonical lowercase SHA-256 of the final .tar.zst object.
		digest, prefixed := strings.CutPrefix(bundle.Checksum, "sha256:")
		decoded, err := hex.DecodeString(digest)
		if !prefixed || err != nil || len(decoded) != 32 || digest != strings.ToLower(digest) {
			return fmt.Errorf("manifest: bundle %q has an invalid SHA-256 checksum", bundle.ID)
		}
		bundles[bundle.ID] = true
	}

	ids := make(map[int]bool, len(m.Testcases))
	for _, tc := range m.Testcases {
		if tc.ID <= 0 || ids[tc.ID] {
			return fmt.Errorf("manifest: invalid or duplicate testcase id %d", tc.ID)
		}
		if !bundles[tc.BundleID] {
			return fmt.Errorf("manifest: testcase %d references unknown bundle %q", tc.ID, tc.BundleID)
		}
		if tc.Hidden != (tc.BundleID == "hidden") {
			return fmt.Errorf("manifest: testcase %d hidden flag disagrees with bundle %q", tc.ID, tc.BundleID)
		}
		for _, name := range []string{tc.Input, tc.Output} {
			if name == "." || !fs.ValidPath(name) || strings.ContainsAny(name, "\\\x00") {
				return fmt.Errorf("manifest: testcase %d has invalid relative file path %q", tc.ID, name)
			}
		}
		ids[tc.ID] = true
	}
	return nil
}
