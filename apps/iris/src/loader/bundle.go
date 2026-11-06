package loader

import (
	"archive/tar"
	"context"
	"crypto/sha256"
	"errors"
	"fmt"
	"io"
	"io/fs"
	"os"
	"path/filepath"
	"strings"

	"github.com/klauspost/compress/zstd"
)

type BundleSource interface {
	OpenObject(ctx context.Context, objectKey string) (io.ReadCloser, error)
}

// InstallBundle handles a cache miss for one selected bundle. cacheRoot may be
// a local directory or a mounted PV. The returned directory contains TC files.
//
// Installation is idempotent: the destination is derived from the verified
// bundle checksum, so any completed installation has identical content. If the
// bundle is already installed, or another installer (e.g. an Iris Pod sharing
// the same node-local PV) publishes it first, the existing directory is
// returned instead of an error. Concurrent installers may still download the
// same bundle more than once. Existing entries are never replaced.
// Cache hits, GC, locking and manifest fetching are outside this function.
func InstallBundle(ctx context.Context, cacheRoot string, source BundleSource, manifest Manifest, bundleID string) (string, error) {
	if err := ctx.Err(); err != nil {
		return "", err
	}
	if strings.TrimSpace(cacheRoot) == "" || source == nil {
		return "", fmt.Errorf("bundle install: cache root and source are required")
	}
	if err := manifest.Validate(); err != nil {
		return "", err
	}
	var bundle *ManifestBundle
	for i := range manifest.Bundles {
		if manifest.Bundles[i].ID == bundleID {
			bundle = &manifest.Bundles[i]
			break
		}
	}
	if bundle == nil {
		return "", fmt.Errorf("bundle install: unknown bundle %q", bundleID)
	}
	digest := strings.TrimPrefix(bundle.Checksum, "sha256:")
	parent := filepath.Join(cacheRoot, "sha256", digest[:2])
	destination := filepath.Join(parent, digest)
	if installed, err := isInstalledBundle(destination); err != nil {
		return "", err
	} else if installed {
		return destination, nil
	}
	if err := os.MkdirAll(parent, 0750); err != nil {
		return "", fmt.Errorf("create cache directory: %w", err)
	}
	// Keep staging on the same filesystem as the destination for atomic rename.
	stage, err := os.MkdirTemp(parent, ".install-")
	if err != nil {
		return "", fmt.Errorf("create staging directory: %w", err)
	}
	defer os.RemoveAll(stage)
	archive := filepath.Join(stage, "bundle.tar.zst")
	if err := downloadBundle(ctx, source, *bundle, archive); err != nil {
		return "", err
	}
	payload := filepath.Join(stage, "files")
	if err := os.Mkdir(payload, 0750); err != nil {
		return "", fmt.Errorf("create extraction directory: %w", err)
	}
	if err := extractBundle(ctx, archive, payload); err != nil {
		return "", fmt.Errorf("extract bundle %q: %w", bundleID, err)
	}
	for _, tc := range manifest.Testcases {
		if tc.BundleID != bundleID {
			continue
		}
		for _, name := range []string{tc.Input, tc.Output} {
			info, err := os.Lstat(filepath.Join(payload, filepath.FromSlash(name)))
			if err != nil {
				return "", fmt.Errorf("bundle %q testcase %d file %q: %w", bundleID, tc.ID, name, err)
			}
			if !info.Mode().IsRegular() {
				return "", fmt.Errorf("bundle %q testcase %d path %q is not a regular file", bundleID, tc.ID, name)
			}
		}
	}
	if err := ctx.Err(); err != nil {
		return "", err
	}
	if err := os.Rename(payload, destination); err != nil {
		// Renaming onto a non-empty directory fails with EEXIST or ENOTEMPTY,
		// both of which match fs.ErrExist. Another installer won the race; its
		// content is identical, so use it. The staging copy is removed by defer.
		if !errors.Is(err, fs.ErrExist) {
			return "", fmt.Errorf("publish bundle cache: %w", err)
		}
		if installed, inspectErr := isInstalledBundle(destination); inspectErr != nil {
			return "", inspectErr
		} else if !installed {
			return "", fmt.Errorf("publish bundle cache: %w", err)
		}
	}
	return destination, nil
}

// isInstalledBundle reports whether destination holds a published bundle.
// Only a directory counts; any other entry at that path is an error.
func isInstalledBundle(destination string) (bool, error) {
	info, err := os.Lstat(destination)
	if errors.Is(err, fs.ErrNotExist) {
		return false, nil
	}
	if err != nil {
		return false, fmt.Errorf("inspect cache destination: %w", err)
	}
	if !info.IsDir() {
		return false, fmt.Errorf("cache path %q is not a directory", destination)
	}
	return true, nil
}

func downloadBundle(ctx context.Context, source BundleSource, bundle ManifestBundle, archive string) error {
	body, err := source.OpenObject(ctx, bundle.ObjectKey)
	if err != nil {
		return fmt.Errorf("download bundle %q: %w", bundle.ID, err)
	}
	file, err := os.OpenFile(archive, os.O_CREATE|os.O_EXCL|os.O_WRONLY, 0600)
	if err != nil {
		body.Close()
		return fmt.Errorf("create downloaded bundle: %w", err)
	}
	hash := sha256.New()
	_, copyErr := io.Copy(io.MultiWriter(file, hash), bundleContextReader{ctx, body})
	if err := errors.Join(copyErr, body.Close(), file.Close()); err != nil {
		return fmt.Errorf("save downloaded bundle: %w", err)
	}
	actual := fmt.Sprintf("sha256:%x", hash.Sum(nil))
	if actual != bundle.Checksum {
		return fmt.Errorf("bundle %q checksum mismatch: expected %s, got %s", bundle.ID, bundle.Checksum, actual)
	}
	return nil
}

func extractBundle(ctx context.Context, archive, root string) error {
	file, err := os.Open(archive)
	if err != nil {
		return err
	}
	defer file.Close()
	decoder, err := zstd.NewReader(file, zstd.WithDecoderConcurrency(1))
	if err != nil {
		return err
	}
	defer decoder.Close()
	stream := bundleContextReader{ctx, decoder}
	reader := tar.NewReader(stream)
	for {
		header, err := reader.Next()
		if err == io.EOF {
			// Read through the zstd frame trailer to catch truncation/CRC errors.
			_, err = io.Copy(io.Discard, stream)
			return err
		}
		if err != nil {
			return err
		}
		name := strings.TrimPrefix(header.Name, "./")
		if header.Typeflag == tar.TypeDir {
			if header.Name == "." || header.Name == "./" {
				continue
			}
			name = strings.TrimSuffix(name, "/")
		}
		if name == "." || !fs.ValidPath(name) || strings.ContainsAny(name, "\\\x00") {
			return fmt.Errorf("invalid archive path %q", header.Name)
		}
		filename := filepath.Join(root, filepath.FromSlash(name))
		switch header.Typeflag {
		case tar.TypeDir:
			if err := os.MkdirAll(filename, 0750); err != nil {
				return err
			}
		case tar.TypeReg, tar.TypeRegA:
			if err := os.MkdirAll(filepath.Dir(filename), 0750); err != nil {
				return err
			}
			// Reject duplicate entries; never restore archive permissions or owners.
			out, err := os.OpenFile(filename, os.O_CREATE|os.O_EXCL|os.O_WRONLY, 0440)
			if err != nil {
				return err
			}
			_, copyErr := io.Copy(out, reader)
			if err := errors.Join(copyErr, out.Close()); err != nil {
				return err
			}
		default:
			return fmt.Errorf("unsupported archive entry type %d for %q", header.Typeflag, header.Name)
		}
	}
}

type bundleContextReader struct {
	ctx    context.Context
	reader io.Reader
}

func (r bundleContextReader) Read(p []byte) (int, error) {
	if err := r.ctx.Err(); err != nil {
		return 0, err
	}
	return r.reader.Read(p)
}
