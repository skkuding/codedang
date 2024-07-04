package grader

import (
	"bytes"
	"unicode"
)

func Grade(answer []byte, output []byte) bool {
	return bytes.Equal(TrimWhitespaceBeforeNewline(answer), TrimWhitespaceBeforeNewline(output))
}

func TrimWhitespaceBeforeNewline(a []byte) []byte {
	sep := []byte("\n")
	b := bytes.Split(bytes.TrimRightFunc(a, unicode.IsSpace), sep)

	for idx, val := range b {
		b[idx] = bytes.TrimRightFunc(val, unicode.IsSpace)
	}
	return bytes.Join(b, sep)
}
