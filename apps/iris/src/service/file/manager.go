package file

import (
	"bytes"
	"fmt"
	"os"

	"github.com/skkuding/codedang/apps/iris/src/common/constants"
)

type FileManager interface {
	CreateDir(dir string) error
	RemoveDir(dir string) error
	CreateFile(path string, data string) error
	ReadFile(path string) ([]byte, error)
	MakeFilePath(dir string, fileName string) *bytes.Buffer
}

type fileManager struct {
	baseDir string
}

func NewFileManager(baseDir string) *fileManager {
	fileManager := fileManager{}
	fileManager.baseDir = baseDir
	return &fileManager
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

func (f *fileManager) MakeFilePath(dir string, fileName string) *bytes.Buffer {
	var b bytes.Buffer
	b.WriteString(f.baseDir)
	b.WriteString("/")
	b.WriteString(dir)
	b.WriteString("/")
	b.WriteString(fileName)
	return &b
}
