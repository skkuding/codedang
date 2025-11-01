package check

import (
	"strconv"
	"strings"
	"unicode"

	"github.com/skkuding/codedang/apps/plag/src/loader"
)

type CheckInput struct {
	// metadata should be here
	BaseCode string
	HasBase  bool
	Elements []loader.Element
}

type Position struct {
	Line   int `json:"line"`
	Column int `json:"column"`
}

type Match struct {
	StartInFirst   Position `json:"startInFirst"`
	EndInFirst     Position `json:"endInFirst"`
	StartInSecond  Position `json:"startInSecond"`
	EndInSecond    Position `json:"endInSecond"`
	LengthOfFirst  int      `json:"lengthOfFirst"`
	LengthOfSecond int      `json:"lengthOfSecond"`
}

type Similarities struct {
	Average       float32 `json:"AVG"`
	Maximum       float32 `json:"MAX"`
	MaximumLength float32 `json:"MAXIMUMLENGTH"`
	LongestMatch  float32 `json:"LONGESTMATCH"`
}

type Comparison struct {
	SubmissionName1 string       `json:"firstSubmissionId"`
	SubmissionName2 string       `json:"secondSubmissionId"`
	Similarities    Similarities `json:"similarities"`
	Matches         []Match      `json:"matches"`
	Similarity1     float32      `json:"firstSimilarity"`
	Similarity2     float32      `json:"secondSimilarity"`
}

type ComparisonWithID struct {
	FirstSubmissionId  int        `json:"firstSubmissionId"`
	SecondSubmissionId int        `json:"secondSubmissionId"`
	Similarities  Similarities `json:"similarities"`
	Matches       []Match      `json:"matches"`
	Similarity1   float32      `json:"firstSimilarity"`
	Similarity2   float32      `json:"secondSimilarity"`
}

type Cluster struct {
  AvgSimilarity  float32      `json:"averageSimilarity"`
	Strength       float32      `json:"strength"`
	Members        []string     `json:"members"`
}

type ClusterWithID struct {
  AvgSimilarity  float32      `json:"averageSimilarity"`
	Strength       float32      `json:"strength"`
	Members        []int        `json:"members"`
}

func (s *CheckInput) Count() int {
	return len(s.Elements)
}

func keepDigits(input string) string {
    var b strings.Builder
    for _, r := range input {
        if unicode.IsDigit(r) {
            b.WriteRune(r)
        }
    }
    return b.String()
}

func (c *Comparison) ToComparisonWithID() (ComparisonWithID, error) {
	submissionId1, err := strconv.Atoi(keepDigits(c.SubmissionName1))
	if err != nil {
		return ComparisonWithID{}, err
	}
	submissionId2, err := strconv.Atoi(keepDigits(c.SubmissionName2))
	if err != nil {
		return ComparisonWithID{}, err
	}

	return ComparisonWithID{
		submissionId1,
    submissionId2,
		c.Similarities,
		c.Matches,
		c.Similarity1,
		c.Similarity2,
	}, nil
}

func (c *Cluster) ToClusterWithID() (ClusterWithID, error) {
	ids := []int{}

  for _, m := range c.Members{
    id, err := strconv.Atoi(keepDigits(m))
    if err != nil {
      return ClusterWithID{}, err
    }
    ids = append(ids, id)
  }

	return ClusterWithID{
		c.AvgSimilarity,
    c.Strength,
    ids,
	}, nil
}
