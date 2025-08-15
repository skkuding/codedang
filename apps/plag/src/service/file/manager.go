package file

import (
	"archive/zip"
	"bytes"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"strings"

	"github.com/skkuding/codedang/apps/plag/src/common/constants"
)

type FileManager interface {
	CreateDir(dir string) error
	RemoveDir(dir string) error
	CreateFile(path string, data string) error
	ReadFile(path string) ([]byte, error)
	MakeFilePath(dir string, fileName string) *bytes.Buffer
	GetBasePath(path string) string
	Unzip(path string, resultDir string) error
	CollectFiles(dir string) ([]string, error)
}

type fileManager struct {
	baseDir string
}

func NewFileManager(baseDir string) *fileManager {
	fileManager := fileManager{}
	fileManager.baseDir = baseDir
	return &fileManager
}

func (f *fileManager) GetBasePath(dir string) string {
	return f.baseDir + "/" + dir
}

func (f *fileManager) CreateDir(dir string) error {
	if err := os.Mkdir(f.baseDir+"/"+dir, os.FileMode(constants.BASE_FILE_MODE)); err != nil {
		return fmt.Errorf("failed to create dir: %s: %w", dir, err)
	}
	return nil
}

func (f *fileManager) RemoveDir(dir string) error {
	if err := os.RemoveAll(f.baseDir + "/" + dir); err != nil {
		return fmt.Errorf("failed to remove dir: %s: %w", dir, err)
	}
	return nil
}

func (f *fileManager) CreateFile(path string, data string) error {
	if err := os.WriteFile(path, []byte(data), constants.BASE_FILE_MODE); err != nil {
		return fmt.Errorf("failed to create file: %s: %w", path, err)
	}
	return nil
}

func (f *fileManager) ReadFile(path string) ([]byte, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, fmt.Errorf("failed to read file: %s: %w", path, err)
	}
	return data, nil
}

func (f *fileManager) CollectFiles(dir string) ([]string, error) {
	entries, err := os.ReadDir(dir)
	if err != nil {
		return nil, fmt.Errorf("failed to collect files: %s: %w", dir, err)
	}

	fileNames := []string{}
	for _, e := range entries {
		fileNames = append(fileNames, e.Name())
	}

	return fileNames, nil
}

func (f *fileManager) MakeFilePath(dir string, fileName string) *bytes.Buffer {
	var b bytes.Buffer
	b.WriteString(f.baseDir)
	b.WriteString("/")
	b.WriteString(dir)
	b.WriteString("/")
	b.WriteString(fileName)
	return &b
}

func (f *fileManager) Unzip(path string, resultDir string) error {
	r, err := zip.OpenReader(path)
	if err != nil {
		return fmt.Errorf("zip.OpenReader: %w", err)
	}
	defer r.Close()
	for _, f := range r.File {
		// 압축 취약점 방지 (ZipSlip)
		fpath := resultDir + "/" + f.Name
		if !strings.HasPrefix(fpath, filepath.Clean(resultDir)+string(os.PathSeparator)) {
			return fmt.Errorf("illegal file path: %s", fpath)
		}

		if f.FileInfo().IsDir() {
			if err := os.MkdirAll(fpath, f.Mode()); err != nil {
				return err
			}
			continue
		}

		if err := os.MkdirAll(filepath.Dir(fpath), 0755); err != nil {
			return err
		}

		dstFile, err := os.OpenFile(fpath, os.O_WRONLY|os.O_CREATE|os.O_TRUNC, f.Mode())
		if err != nil {
			return err
		}
		defer dstFile.Close()

		srcFile, err := f.Open()
		if err != nil {
			return err
		}
		defer srcFile.Close()

		if _, err := io.Copy(dstFile, srcFile); err != nil {
			return err
		}
	}

	return nil
}
