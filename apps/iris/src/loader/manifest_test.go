package loader

import (
	"encoding/json"
	"reflect"
	"strings"
	"testing"
)

func sampleManifest() Manifest {
	return Manifest{
		TestcaseSetID: "tcset-42",
		Bundles: []ManifestBundle{
			{ID: "public", ObjectKey: "testcases/tcset-42/" + strings.Repeat("a", 64) + ".tar.zst", Checksum: "sha256:" + strings.Repeat("a", 64)},
			{ID: "hidden", ObjectKey: "testcases/tcset-42/" + strings.Repeat("b", 64) + ".tar.zst", Checksum: "sha256:" + strings.Repeat("b", 64)},
		},
		Testcases: []ManifestTestcase{
			{ID: 1001, BundleID: "public", Input: "1001.in", Output: "1001.out", Hidden: false, ScoreWeight: 1},
			{ID: 1002, BundleID: "hidden", Input: "nested/1002.in", Output: "nested/1002.out", Hidden: true, ScoreWeight: 2},
		},
	}
}

func TestParseManifest(t *testing.T) {
	// Literal JSON checks the public field names independently of marshaling.
	data := `{
		"testcaseSetId":"tcset-42",
		"bundles":[{"id":"hidden","objectKey":"testcases/tcset-42/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa.tar.zst",
		"checksum":"sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"}],
		"testcases":[{"id":1002,"bundleId":"hidden","input":"1002.in",
		"output":"1002.out","hidden":true,"scoreWeight":2}]
	}`
	got, err := ParseManifest([]byte(data))
	if err != nil {
		t.Fatal(err)
	}
	if got.TestcaseSetID != "tcset-42" || len(got.Bundles) != 1 || len(got.Testcases) != 1 {
		t.Fatalf("unexpected manifest: %+v", got)
	}
	want := ManifestTestcase{ID: 1002, BundleID: "hidden", Input: "1002.in", Output: "1002.out", Hidden: true, ScoreWeight: 2}
	if !reflect.DeepEqual(got.Testcases[0], want) || got.Bundles[0].ID != "hidden" {
		t.Fatalf("unexpected testcase or bundle: %+v", got)
	}
}

func TestManifestValidation(t *testing.T) {
	tests := []struct {
		name   string
		change func(*Manifest)
		valid  bool
	}{
		{"public and hidden bundles", func(m *Manifest) {}, true},
		{"public only set", func(m *Manifest) { m.Bundles = m.Bundles[:1]; m.Testcases = m.Testcases[:1] }, true},
		{"empty set id", func(m *Manifest) { m.TestcaseSetID = " " }, false},
		{"no bundles", func(m *Manifest) { m.Bundles = nil }, false},
		{"no testcases", func(m *Manifest) { m.Testcases = nil }, false},
		{"duplicate bundle", func(m *Manifest) { m.Bundles = append(m.Bundles, m.Bundles[0]) }, false},
		{"unknown bundle type", func(m *Manifest) { m.Bundles[0].ID = "all" }, false},
		{"empty object key", func(m *Manifest) { m.Bundles[0].ObjectKey = "" }, false},
		{"wrong algorithm", func(m *Manifest) { m.Bundles[0].Checksum = "md5:" + strings.Repeat("a", 64) }, false},
		{"short hash", func(m *Manifest) { m.Bundles[0].Checksum = "sha256:abc" }, false},
		{"nonhex hash", func(m *Manifest) { m.Bundles[0].Checksum = "sha256:" + strings.Repeat("g", 64) }, false},
		{"uppercase hash", func(m *Manifest) { m.Bundles[0].Checksum = "sha256:" + strings.Repeat("A", 64) }, false},
		{"invalid testcase id", func(m *Manifest) { m.Testcases[0].ID = 0 }, false},
		{"duplicate testcase", func(m *Manifest) { m.Testcases = append(m.Testcases, m.Testcases[0]) }, false},
		{"missing bundle reference", func(m *Manifest) { m.Testcases[0].BundleID = "missing" }, false},
		{"public marked hidden", func(m *Manifest) { m.Testcases[0].Hidden = true }, false},
		{"hidden marked public", func(m *Manifest) { m.Testcases[1].Hidden = false }, false},
		{"input traversal", func(m *Manifest) { m.Testcases[0].Input = "../1001.in" }, false},
		{"output traversal", func(m *Manifest) { m.Testcases[0].Output = "nested/../../1001.out" }, false},
		{"absolute path", func(m *Manifest) { m.Testcases[0].Input = "/1001.in" }, false},
		{"empty path", func(m *Manifest) { m.Testcases[0].Input = "" }, false},
		{"root path", func(m *Manifest) { m.Testcases[0].Input = "." }, false},
		{"backslash path", func(m *Manifest) { m.Testcases[0].Input = `..\1001.in` }, false},
		{"null byte", func(m *Manifest) { m.Testcases[0].Input = "1001\x00.in" }, false},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			manifest := sampleManifest()
			tt.change(&manifest)
			data, err := json.Marshal(manifest)
			if err != nil {
				t.Fatal(err)
			}
			got, err := ParseManifest(data)
			if (err == nil) != tt.valid {
				t.Fatalf("ParseManifest() error = %v, want valid = %t", err, tt.valid)
			}
			if !tt.valid && got != nil {
				t.Fatal("invalid manifest must not be returned")
			}
		})
	}
}

func TestParseManifestInvalidJSON(t *testing.T) {
	for _, data := range []string{"", "{", "null", "{}", `{"testcases":"wrong type"}`, `{} {}`} {
		if manifest, err := ParseManifest([]byte(data)); err == nil || manifest != nil {
			t.Errorf("expected rejection for %q", data)
		}
	}
}
