package sandbox

import "testing"

func TestLanguage(t *testing.T) {
	tests := []struct {
		name      string
		input     Language
		wantExt   string
		wantArg   string
		wantValid bool
	}{
		{"C", C, "c", "c", true},
		{"Cpp", CPP, "cpp", "cpp", true},
		{"Java", JAVA, "java", "java", true},
		{"Python3", PYTHON, "py", "python3", true},
		{"PyPy3", PYPY, "py", "python3", true},
		{"unsupported language", Language("Go"), "", "", false},
		{"empty language", Language(""), "", "", false},
		{"incorrect case", Language("cpp"), "", "", false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := tt.input.GetLangExt(); got != tt.wantExt {
				t.Errorf("GetLangExt() = %q, want %q", got, tt.wantExt)
			}
			if got := tt.input.GetLangArg(); got != tt.wantArg {
				t.Errorf("GetLangArg() = %q, want %q", got, tt.wantArg)
			}
			if got := tt.input.IsValid(); got != tt.wantValid {
				t.Errorf("IsValid() = %v, want %v", got, tt.wantValid)
			}
		})
	}
}
