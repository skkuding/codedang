package grader

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestGrade(t *testing.T) {
	tests := []struct {
		name   string
		answer string
		output string
		want   bool
	}{
		{"identical output", "abc", "abc", true},
		{"different output", "abc", "abd", false},
		{"whitespace before newline", "a\nb", "a  \nb", true},
		{"trailing whitespace and newlines", "abc", "abc \t\n\n", true},
		{"trailing whitespace in answer", "abc ", "abc", true},
		{"leading whitespace differs", "abc", " abc", false},
		{"internal whitespace differs", "a b", "a  b", false},
		{"internal blank line differs", "a\nb", "a\n\nb", false},
		{"empty answer and whitespace output", "", " \t\n", true},
		{"empty answer and nonempty output", "", "abc", false},
		{"trailing Unicode whitespace", "abc", "abc\u3000", true},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			assert.Equal(t, tt.want, Grade([]byte(tt.answer), []byte(tt.output)))
		})
	}
}

func TestTrimWhitespaceBeforeNewline(t *testing.T) {
	tests := []struct {
		name  string
		input string
		want  string
	}{
		{"no whitespace to trim", "abc", "abc"},
		{"whitespace at line ends", "a \t\nb ", "a\nb"},
		{"trailing newlines and whitespace", "abc\n\n \t", "abc"},
		{"preserve leading and internal whitespace", " a  b", " a  b"},
		{"preserve internal blank line", "a\n \n b", "a\n\n b"},
		{"CRLF line endings", "a\r\nb\r\n", "a\nb"},
		{"Unicode whitespace at line ends", "a\u3000\nb\u00a0", "a\nb"},
		{"whitespace only", " \t\n", ""},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			assert.Equal(t, tt.want, string(TrimWhitespaceBeforeNewline([]byte(tt.input))))
		})
	}
}
