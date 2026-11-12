package main

import (
	"archive/tar"
	"bytes"
	"compress/gzip"
	"crypto/sha256"
	"embed"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"regexp"
	"sort"
	"strings"
)

const (
	maxCases    = 512
	maxManifest = 256 << 10
	maxBundle   = 64 << 20
)

var identifier = regexp.MustCompile(`^[a-zA-Z0-9][a-zA-Z0-9_-]{0,31}$`)

type pin struct {
	Version string `json:"version"`
	SHA256  string `json:"sha256"`
}

func (p pin) valid() bool {
	digest, err := hex.DecodeString(p.SHA256)
	return identifier.MatchString(p.Version) && err == nil && len(digest) == sha256.Size &&
		p.SHA256 == strings.ToLower(p.SHA256)
}

func (p pin) objectKey() string { return "bundles/" + p.Version + ".tar.gz" }

type blob struct {
	Size   int64  `json:"size"`
	SHA256 string `json:"sha256"`
}

type testcase struct {
	ID     string `json:"id"`
	Input  blob   `json:"input"`
	Output blob   `json:"output"`
}

type manifest struct {
	Version string     `json:"version"`
	Cases   []testcase `json:"cases"`
}

type receipt struct {
	Pin      pin      `json:"pin"`
	Manifest manifest `json:"manifest"`
}

type bundleFile struct {
	name string
	blob
}

func (m manifest) files() []bundleFile {
	files := make([]bundleFile, 0, 2*len(m.Cases))
	for _, tc := range m.Cases {
		files = append(files, bundleFile{tc.ID + ".in", tc.Input}, bundleFile{tc.ID + ".out", tc.Output})
	}
	return files
}

func (m manifest) validate(version string) error {
	if m.Version != version || len(m.Cases) == 0 || len(m.Cases) > maxCases {
		return errors.New("invalid manifest version or testcase count")
	}
	seen := make(map[string]bool, len(m.Cases))
	var bytes int64
	for _, tc := range m.Cases {
		if !identifier.MatchString(tc.ID) || seen[tc.ID] {
			return fmt.Errorf("invalid or duplicate testcase ID %q", tc.ID)
		}
		seen[tc.ID] = true
		for _, b := range []blob{tc.Input, tc.Output} {
			if b.Size < 0 || b.Size > maxBundle || !(pin{version, b.SHA256}).valid() {
				return fmt.Errorf("invalid file metadata for testcase %s", tc.ID)
			}
			bytes += b.Size
		}
	}
	if bytes > maxBundle {
		return errors.New("unpacked bundle exceeds size limit")
	}
	return nil
}

func writeJSON(path string, value any) error {
	data, err := json.Marshal(value)
	if err != nil {
		return err
	}
	return os.WriteFile(path, append(data, '\n'), 0o644)
}

//go:embed fixtures
var fixtures embed.FS

func buildBundle(version string, bodies map[string][]byte) ([]byte, pin, error) {
	var ids []string
	for name := range bodies {
		if id, ok := strings.CutSuffix(name, ".in"); ok {
			ids = append(ids, id)
		}
	}
	sort.Strings(ids)
	m := manifest{Version: version}
	for _, id := range ids {
		input := bodies[id+".in"]
		output, ok := bodies[id+".out"]
		if !ok {
			return nil, pin{}, fmt.Errorf("missing output for %s", id)
		}
		m.Cases = append(m.Cases, testcase{id, describe(input), describe(output)})
	}
	if len(bodies) != 2*len(ids) {
		return nil, pin{}, errors.New("fixture files must be paired .in and .out files")
	}
	if err := m.validate(version); err != nil {
		return nil, pin{}, err
	}
	metadata, err := json.Marshal(m)
	if err != nil {
		return nil, pin{}, err
	}
	var buffer bytes.Buffer
	compressed := gzip.NewWriter(&buffer)
	archive := tar.NewWriter(compressed)
	write := func(name string, data []byte) error {
		if err := archive.WriteHeader(&tar.Header{Name: name, Mode: 0o444, Size: int64(len(data))}); err != nil {
			return err
		}
		_, err := archive.Write(data)
		return err
	}
	if err := write("manifest.json", metadata); err != nil {
		return nil, pin{}, err
	}
	for _, file := range m.files() {
		if err := write(file.name, bodies[file.name]); err != nil {
			return nil, pin{}, err
		}
	}
	if err := archive.Close(); err != nil {
		return nil, pin{}, err
	}
	if err := compressed.Close(); err != nil {
		return nil, pin{}, err
	}
	return buffer.Bytes(), pin{version, describe(buffer.Bytes()).SHA256}, nil
}

func describe(data []byte) blob {
	hash := sha256.Sum256(data)
	return blob{int64(len(data)), hex.EncodeToString(hash[:])}
}

func unpackBundle(r io.Reader, p pin, stage string, reserve func(manifest) error) (manifest, error) {
	compressed, err := gzip.NewReader(r)
	if err != nil {
		return manifest{}, err
	}
	defer compressed.Close()
	archive := tar.NewReader(compressed)
	header, err := archive.Next()
	if err != nil || header.Name != "manifest.json" || header.Typeflag != tar.TypeReg || header.Size > maxManifest {
		return manifest{}, errors.New("bundle must start with a bounded manifest.json")
	}
	data, err := io.ReadAll(archive)
	if err != nil {
		return manifest{}, err
	}
	var m manifest
	if err := json.Unmarshal(data, &m); err != nil {
		return manifest{}, err
	}
	if err := m.validate(p.Version); err != nil {
		return manifest{}, err
	}
	if err := reserve(m); err != nil {
		return manifest{}, err
	}
	for _, expected := range m.files() {
		header, err := archive.Next()
		if err != nil || header.Name != expected.name || header.Typeflag != tar.TypeReg || header.Size != expected.Size {
			return manifest{}, fmt.Errorf("invalid archive entry for %s", expected.name)
		}
		path := filepath.Join(stage, expected.name)
		file, err := os.OpenFile(path, os.O_WRONLY|os.O_CREATE|os.O_EXCL, 0o444)
		if err != nil {
			return manifest{}, err
		}
		verifyErr := verifyFile(io.TeeReader(archive, file), expected.blob)
		if err := errors.Join(verifyErr, file.Close()); err != nil {
			return manifest{}, fmt.Errorf("unpack %s: %w", expected.name, err)
		}
	}
	if _, err := archive.Next(); err != io.EOF {
		return manifest{}, errors.New("unexpected trailing tar entries")
	}
	var extra [1]byte
	if n, err := io.ReadFull(compressed, extra[:]); n != 0 || err != io.EOF {
		return manifest{}, errors.New("unexpected trailing gzip data or invalid gzip checksum")
	}
	return m, nil
}

func verifyFile(r io.Reader, expected blob) error {
	hash := sha256.New()
	n, err := io.Copy(hash, io.LimitReader(r, expected.Size+1))
	if err != nil {
		return err
	}
	if n != expected.Size || hex.EncodeToString(hash.Sum(nil)) != expected.SHA256 {
		return errors.New("file size or SHA-256 mismatch")
	}
	return nil
}
