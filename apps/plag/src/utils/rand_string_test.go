package utils

import (
	"strconv"
	"testing"
)

func TestRandString(t *testing.T) {
	for _, length := range []int{0, 1, 10, 11, 100, 1024} {
		t.Run(strconv.Itoa(length), func(t *testing.T) {
			got := RandString(length)
			if len(got) != length {
				t.Fatalf("RandString(%d) length = %d, want %d", length, len(got), length)
			}
			for i, ch := range got {
				if !('a' <= ch && ch <= 'z') && !('A' <= ch && ch <= 'Z') {
					t.Errorf("RandString(%d) contains invalid character %q at index %d", length, ch, i)
				}
			}
		})
	}
}
