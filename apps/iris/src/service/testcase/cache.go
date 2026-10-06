package testcase

import (
	"context"
	"errors"
	"fmt"
	"io/fs"
	"os"
	"path/filepath"
	"strings"

	"github.com/skkuding/codedang/apps/iris/src/loader"
)

// GetVersionedTestcase resolves the requested manifest, then reads cached TC
// bundles. Only bundles are cached: each call still fetches the manifest.
func GetVersionedTestcase(ctx context.Context, cacheRoot string, source loader.BundleSource, testcaseSetID, manifestKey string, filter TestcaseFilterCode) (Testcase, error) {
	if strings.TrimSpace(cacheRoot) == "" {
		return Testcase{}, fmt.Errorf("testcase cache root must not be empty")
	}
	if filter != ALL && filter != PUBLIC_ONLY && filter != HIDDEN_ONLY {
		return Testcase{}, fmt.Errorf("unknown testcase filter %d", filter)
	}
	manifest, err := loader.LoadManifest(ctx, source, manifestKey, testcaseSetID)
	if err != nil {
		return Testcase{}, err
	}
	return GetCachedTestcase(ctx, cacheRoot, source, *manifest, filter)
}

// GetCachedTestcase reads an already resolved manifest using the existing TC
// filters. Calls must be sequential: this PoC has no locking, GC or repair.
// A hit trusts the previously verified installation; it does not rehash files.
func GetCachedTestcase(ctx context.Context, cacheRoot string, source loader.BundleSource, manifest loader.Manifest, filter TestcaseFilterCode) (Testcase, error) {
	if err := ctx.Err(); err != nil {
		return Testcase{}, err
	}
	if strings.TrimSpace(cacheRoot) == "" {
		return Testcase{}, fmt.Errorf("testcase cache root must not be empty")
	}
	if filter != ALL && filter != PUBLIC_ONLY && filter != HIDDEN_ONLY {
		return Testcase{}, fmt.Errorf("unknown testcase filter %d", filter)
	}
	if err := manifest.Validate(); err != nil {
		return Testcase{}, err
	}

	bundles := make(map[string]loader.ManifestBundle, len(manifest.Bundles))
	for _, bundle := range manifest.Bundles {
		bundles[bundle.ID] = bundle
	}

	roots := make(map[string]*os.Root)
	defer func() {
		for _, root := range roots {
			root.Close()
		}
	}()

	result := Testcase{Elements: make([]loader.ElementOut, 0)}
	for _, tc := range manifest.Testcases {
		if err := ctx.Err(); err != nil {
			return Testcase{}, err
		}
		if (filter == PUBLIC_ONLY && tc.Hidden) || (filter == HIDDEN_ONLY && !tc.Hidden) {
			continue
		}
		root := roots[tc.BundleID]
		if root == nil {
			bundle := bundles[tc.BundleID]
			// Match InstallBundle's checksum-based layout after manifest validation.
			digest := strings.TrimPrefix(bundle.Checksum, "sha256:")
			dir := filepath.Join(cacheRoot, "sha256", digest[:2], digest)
			info, err := os.Lstat(dir)
			if errors.Is(err, fs.ErrNotExist) {
				dir, err = loader.InstallBundle(ctx, cacheRoot, source, manifest, tc.BundleID)
			} else if err == nil && !info.IsDir() {
				err = fmt.Errorf("cache path %q is not a directory", dir)
			}
			if err != nil {
				return Testcase{}, fmt.Errorf("prepare bundle %q: %w", tc.BundleID, err)
			}
			root, err = os.OpenRoot(dir)
			if err != nil {
				return Testcase{}, fmt.Errorf("open cached bundle %q: %w", tc.BundleID, err)
			}
			roots[tc.BundleID] = root
		}
		input, err := readCachedFile(root, tc.Input)
		if err != nil {
			return Testcase{}, fmt.Errorf("read testcase %d input: %w", tc.ID, err)
		}
		output, err := readCachedFile(root, tc.Output)
		if err != nil {
			return Testcase{}, fmt.Errorf("read testcase %d output: %w", tc.ID, err)
		}
		result.Elements = append(result.Elements, loader.ElementOut{
			Id: tc.ID, In: string(input), Out: string(output), Hidden: tc.Hidden,
		})
	}

	if err := ctx.Err(); err != nil {
		return Testcase{}, err
	}
	return result, nil
}

func readCachedFile(root *os.Root, name string) ([]byte, error) {
	name = filepath.FromSlash(name)
	info, err := root.Lstat(name)
	if err != nil {
		return nil, err
	}
	if !info.Mode().IsRegular() {
		return nil, fmt.Errorf("cached path %q is not a regular file", name)
	}
	// Root confines reads even if an intermediate directory is a symlink.
	return root.ReadFile(name)
}
