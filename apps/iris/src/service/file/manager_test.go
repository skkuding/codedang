package file

import (
	"os"
	"path/filepath"
	"syscall"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

const (
	otherRead  os.FileMode = 0o004
	otherWrite os.FileMode = 0o002
	otherExec  os.FileMode = 0o001
)

func withUmask(t *testing.T, mask int) {
	t.Helper()
	old := syscall.Umask(mask)
	t.Cleanup(func() { syscall.Umask(old) })
}

func TestCreateDirIsTraversableButNotListableByOthers(t *testing.T) {
	withUmask(t, 0o022)
	baseDir := t.TempDir()
	fm := NewFileManager(baseDir)

	require.NoError(t, fm.CreateDir("unit"))

	info, err := os.Stat(filepath.Join(baseDir, "unit"))
	require.NoError(t, err)
	require.True(t, info.IsDir())
	perm := info.Mode().Perm()
	assert.NotZero(t, perm&otherExec, "sandbox user must traverse the dir, got %o", perm)
	assert.Zero(t, perm&otherRead, "sandbox user must not list the dir, got %o", perm)
	assert.Zero(t, perm&otherWrite, "sandbox user must not write the dir, got %o", perm)
}

func TestCreateDirFailsWhenDirExists(t *testing.T) {
	fm := NewFileManager(t.TempDir())
	require.NoError(t, fm.CreateDir("unit"))

	assert.Error(t, fm.CreateDir("unit"))
}

func TestCreateFileIsReadableButNotWritableByOthers(t *testing.T) {
	withUmask(t, 0o022)
	baseDir := t.TempDir()
	fm := NewFileManager(baseDir)
	require.NoError(t, fm.CreateDir("unit"))
	path := fm.MakeFilePath("unit", "solution.py").String()

	require.NoError(t, fm.CreateFile(path, "print(1)"))

	info, err := os.Stat(path)
	require.NoError(t, err)
	perm := info.Mode().Perm()
	assert.NotZero(t, perm&otherRead, "interpreters run as the sandbox user must read the source, got %o", perm)
	assert.Zero(t, perm&otherWrite, "sandbox user must not modify the source, got %o", perm)
	data, err := fm.ReadFile(path)
	require.NoError(t, err)
	assert.Equal(t, "print(1)", string(data))
}
