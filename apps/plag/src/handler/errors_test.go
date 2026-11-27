package handler

import (
	"errors"
	"testing"

	"github.com/skkuding/codedang/apps/plag/src/service/logger"
)

func TestHandlerErrorError(t *testing.T) {
	tests := []struct {
		name   string
		caller string
		want   string
	}{
		{"with caller", "CheckHandler", "CheckHandler: underlying error"},
		{"empty caller", "", ": underlying error"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			input := &HandlerError{
				err:     errors.New("underlying error"),
				caller:  tt.caller,
				Message: "user-facing message",
			}
			if got := input.Error(); got != tt.want {
				t.Errorf("Error() = %q, want %q", got, tt.want)
			}
		})
	}
}

func TestHandlerErrorWrap(t *testing.T) {
	existingErr := errors.New("underlying error")
	tests := []struct {
		name     string
		existing error
		wantText string
	}{
		{"without existing error", nil, "validation error"},
		{"with existing error", existingErr, "validation error: underlying error"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			input := &HandlerError{
				err:     tt.existing,
				level:   logger.WARN,
				caller:  "CheckHandler",
				Message: "user-facing message",
			}
			got := input.Wrap(ErrValidate)
			if got != input {
				t.Fatal("Wrap() did not return the original HandlerError")
			}
			if got.err == nil {
				t.Fatal("Wrap() left the underlying error nil")
			}
			if got.err.Error() != tt.wantText {
				t.Errorf("wrapped error = %q, want %q", got.err.Error(), tt.wantText)
			}
			if !errors.Is(got, ErrValidate) {
				t.Error("errors.Is() could not find the newly wrapped error")
			}
			// Wrap preserves the existing error as text, not as an unwrap target.
			if tt.existing != nil && errors.Is(got, tt.existing) {
				t.Error("existing error unexpectedly remains in the unwrap chain")
			}
			if got.level != logger.WARN || got.caller != "CheckHandler" || got.Message != "user-facing message" {
				t.Errorf("Wrap() changed metadata: %+v", got)
			}
		})
	}
}

func TestHandlerErrorUnwrap(t *testing.T) {
	tests := []struct {
		name string
		err  error
	}{
		{"nil error", nil},
		{"underlying error", ErrRunJPlag},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			input := &HandlerError{err: tt.err}
			if got := input.Unwrap(); got != tt.err {
				t.Errorf("Unwrap() = %v, want %v", got, tt.err)
			}
		})
	}
}

func TestHandlerErrorLevel(t *testing.T) {
	for _, level := range []logger.Level{logger.DEBUG, logger.INFO, logger.WARN, logger.ERROR} {
		t.Run(string(level), func(t *testing.T) {
			input := &HandlerError{level: level}
			if got := input.Level(); got != level {
				t.Errorf("Level() = %q, want %q", got, level)
			}
		})
	}
}
