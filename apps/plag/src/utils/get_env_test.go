package utils

import (
	"bytes"
	"context"
	"errors"
	"fmt"
	"io"
	"os"
	"os/exec"
	"strings"
	"testing"

	"github.com/skkuding/codedang/apps/plag/src/service/logger"
)

type envTestLogger struct {
	output io.Writer
}

func (l *envTestLogger) Log(level logger.Level, msg string) {
	fmt.Fprintf(l.output, "%s: %s\n", level, msg)
}

func (l *envTestLogger) Panic(msg string) {
	panic(msg)
}

func (l *envTestLogger) LogWithContext(level logger.Level, msg string, _ context.Context) {
	l.Log(level, msg)
}

func TestGetenv(t *testing.T) {
	const key = "PLAG_TEST_GETENV"
	tests := []struct {
		name     string
		value    string
		unset    bool
		fallback string
		want     string
	}{
		{"set value", "configured", false, "default", "configured"},
		{"empty value is preserved", "", false, "default", ""},
		{"unset uses fallback", "", true, "default", "default"},
		{"unset with empty fallback", "", true, "", ""},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Setenv registers cleanup to restore the original environment,
			// including when the variable is subsequently unset.
			t.Setenv(key, tt.value)
			if tt.unset {
				if err := os.Unsetenv(key); err != nil {
					t.Fatal(err)
				}
			}
			if got := Getenv(key, tt.fallback); got != tt.want {
				t.Errorf("Getenv() = %q, want %q", got, tt.want)
			}
		})
	}
}

func TestMustGetenvOrElseThrow(t *testing.T) {
	const key = "PLAG_TEST_REQUIRED_ENV"
	tests := []struct {
		name  string
		value string
	}{
		{"set value", "configured"},
		{"whitespace is not empty", " "},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Setenv(key, tt.value)
			var output bytes.Buffer
			logProvider := &envTestLogger{output: &output}
			if got := MustGetenvOrElseThrow(key, logProvider); got != tt.value {
				t.Errorf("MustGetenvOrElseThrow() = %q, want %q", got, tt.value)
			}
			if output.Len() != 0 {
				t.Errorf("unexpected log output: %q", output.String())
			}
		})
	}
}

func TestMustGetenvOrElseThrowExits(t *testing.T) {
	const (
		key       = "PLAG_TEST_REQUIRED_ENV"
		helperKey = "PLAG_TEST_GETENV_HELPER"
	)

	// Run the terminating call only in a child test process.
	if os.Getenv(helperKey) == "1" {
		MustGetenvOrElseThrow(key, &envTestLogger{output: os.Stderr})
		return
	}

	executable, err := os.Executable()
	if err != nil {
		t.Fatal(err)
	}
	tests := []struct {
		name  string
		unset bool
	}{
		{"unset variable", true},
		{"empty variable", false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			cmd := exec.Command(executable, "-test.run=^TestMustGetenvOrElseThrowExits$")
			// Inherit the environment without the helper and tested variables.
			// The parent process environment remains unchanged.
			for _, entry := range os.Environ() {
				if !strings.HasPrefix(entry, key+"=") && !strings.HasPrefix(entry, helperKey+"=") {
					cmd.Env = append(cmd.Env, entry)
				}
			}
			cmd.Env = append(cmd.Env, helperKey+"=1")
			if !tt.unset {
				cmd.Env = append(cmd.Env, key+"=")
			}

			output, err := cmd.CombinedOutput()
			var exitErr *exec.ExitError
			if !errors.As(err, &exitErr) {
				t.Fatalf("child process error = %v, want exit code 1; output: %s", err, output)
			}
			if exitErr.ExitCode() != 1 {
				t.Fatalf("child process exit code = %d, want 1; output: %s", exitErr.ExitCode(), output)
			}
			wantLog := "Error: FATAL: Required environment variable " + key + " is not set"
			if !strings.Contains(string(output), wantLog) {
				t.Errorf("child process output = %q, want log %q", output, wantLog)
			}
		})
	}
}
