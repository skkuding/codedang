package file

import (
	"fmt"
	"io/fs"
)

type fileDataSource struct {
	fs fs.FS
}

func NewFileDataSource(fsys fs.FS) *fileDataSource {
	return &fileDataSource{fs: fsys}
}

func (f *fileDataSource) Get(path string) ([]byte, error) {
	contents, err := fs.ReadFile(f.fs, path)
	if err != nil {
		return nil, fmt.Errorf("failed to read %s: %w", path, err)
	}
	return contents, nil
}

