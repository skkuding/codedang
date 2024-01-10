package file

import (
	"bytes"
	"fmt"
	"io/fs"
	"os"
	"regexp"

	"github.com/skkuding/codedang/iris/src/common/constants"
)

type FileManager interface {
	CreateDir(dir string) error
	RemoveDir(dir string) error
	CreateFile(path string, data string) error
	ReadFile(path string) ([]byte, error)
	MakeFilePath(dir string, fileName string) *bytes.Buffer
	RemoveOutputs(dir string) error
	CheckDir(dir string) bool
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

// Dir. existence checker
func (f *fileManager) CheckDir(dir string) bool {
	if _, err := os.Stat(f.baseDir + "/" + dir); err != nil {
		return false
	} else {
		return true
	}
}

// Only .out and .error files remover
func (f *fileManager) RemoveOutputs(dir string) error {
	dentry, err := os.ReadDir(f.baseDir + "/" + dir)
	if err != nil {
		return fmt.Errorf("failed to read dir : %s: %w", dir, err)
	}

	r, _ := regexp.Compile("^.*(error|out)")
	ch := make(chan error)
	for _, file := range dentry {
		go func(dir string, file fs.DirEntry, ch chan error) {
			filepath := f.baseDir + "/" + dir + "/" + file.Name()
			if r.MatchString(filepath) {
				err := os.Remove(filepath)
				if err != nil {
					ch <- fmt.Errorf("failed to remove file : %s: %w", filepath, err)
				}
			}
			ch <- nil
		}(dir, file, ch)
	}

	for range dentry {
		err := <-ch
		if err != nil {
			return err
		}
	}

	return nil
}
