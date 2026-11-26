package check

import (
	"reflect"
	"strings"
	"testing"

	"github.com/skkuding/codedang/apps/plag/src/loader"
)

func TestCheckInputCount(t *testing.T) {
	tests := []struct {
		name     string
		elements []loader.Element
		want     int
	}{
		{"nil elements", nil, 0},
		{"empty elements", []loader.Element{}, 0},
		{"one element", make([]loader.Element, 1), 1},
		{"multiple elements", make([]loader.Element, 3), 3},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			input := CheckInput{Elements: tt.elements}
			if got := input.Count(); got != tt.want {
				t.Errorf("Count() = %d, want %d", got, tt.want)
			}
		})
	}
}

func TestKeepDigits(t *testing.T) {
	tests := []struct {
		name  string
		input string
		want  string
	}{
		{"empty input", "", ""},
		{"no digits", "submission.java", ""},
		{"digits only", "00123", "00123"},
		{"mixed characters", "submission_12-part34.java", "1234"},
		{"unicode digits", "code_١٢３", "١٢３"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := keepDigits(tt.input); got != tt.want {
				t.Errorf("keepDigits() = %q, want %q", got, tt.want)
			}
		})
	}
}

func TestComparisonToComparisonWithID(t *testing.T) {
	similarities := Similarities{
		Average: 0.5, Maximum: 0.8, MaximumLength: 42, LongestMatch: 12,
	}
	matches := []Match{{
		StartInFirst:  Position{Line: 1, Column: 2},
		EndInFirst:    Position{Line: 3, Column: 4},
		StartInSecond: Position{Line: 5, Column: 6},
		EndInSecond:   Position{Line: 7, Column: 8},
		LengthOfFirst: 9, LengthOfSecond: 10,
	}}
	tests := []struct {
		name       string
		first      string
		second     string
		wantFirst  int
		wantSecond int
		wantErr    bool
	}{
		{"submission names", "submission_123.java", "submission_456.java", 123, 456, false},
		{"leading zeros and zero", "0012", "0", 12, 0, false},
		{"first ID has no digits", "invalid", "456", 0, 0, true},
		{"second ID has no digits", "123", "invalid", 0, 0, true},
		{"empty first ID", "", "456", 0, 0, true},
		{"empty second ID", "123", "", 0, 0, true},
		{"first ID overflows", strings.Repeat("9", 100), "456", 0, 0, true},
		{"second ID overflows", "123", strings.Repeat("9", 100), 0, 0, true},
		{"non-ASCII digits cannot become an ID", "١٢", "456", 0, 0, true},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			input := Comparison{
				SubmissionName1: tt.first, SubmissionName2: tt.second,
				Similarities: similarities, Matches: matches,
				Similarity1: 0.6, Similarity2: 0.4,
			}
			got, err := input.ToComparisonWithID()
			if (err != nil) != tt.wantErr {
				t.Fatalf("ToComparisonWithID() error = %v, wantErr %v", err, tt.wantErr)
			}
			want := ComparisonWithID{}
			if !tt.wantErr {
				want = ComparisonWithID{
					FirstSubmissionId: tt.wantFirst, SecondSubmissionId: tt.wantSecond,
					Similarities: similarities, Matches: matches,
					Similarity1: 0.6, Similarity2: 0.4,
				}
			}
			if !reflect.DeepEqual(got, want) {
				t.Errorf("ToComparisonWithID() = %+v, want %+v", got, want)
			}
		})
	}
}

func TestClusterToClusterWithID(t *testing.T) {
	tests := []struct {
		name    string
		members []string
		wantIDs []int
		wantErr bool
	}{
		{"nil members", nil, []int{}, false},
		{"empty members", []string{}, []int{}, false},
		{"preserves member order", []string{"submission_456.java", "submission_123.java"}, []int{456, 123}, false},
		{"leading zeros and zero", []string{"0012", "0"}, []int{12, 0}, false},
		{"invalid first member", []string{"invalid", "123"}, nil, true},
		{"invalid later member", []string{"123", "invalid"}, nil, true},
		{"empty member", []string{""}, nil, true},
		{"overflowing member", []string{strings.Repeat("9", 100)}, nil, true},
		{"non-ASCII digits", []string{"١٢"}, nil, true},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			input := Cluster{AvgSimilarity: 0.5, Strength: 0.75, Members: tt.members}
			got, err := input.ToClusterWithID()
			if (err != nil) != tt.wantErr {
				t.Fatalf("ToClusterWithID() error = %v, wantErr %v", err, tt.wantErr)
			}
			want := ClusterWithID{}
			if !tt.wantErr {
				want = ClusterWithID{AvgSimilarity: 0.5, Strength: 0.75, Members: tt.wantIDs}
			}
			if !reflect.DeepEqual(got, want) {
				t.Errorf("ToClusterWithID() = %+v, want %+v", got, want)
			}
		})
	}
}
