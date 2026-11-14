package check

import (
	"testing"

	"github.com/skkuding/codedang/apps/plag/src/loader"
	"github.com/stretchr/testify/require"
)

func TestExcludeSameUserResults(t *testing.T) {
	// submissions 1 and 2 belong to the same student in different assignments
	elements := []loader.Element{
		{Id: 1, UserId: 10},
		{Id: 2, UserId: 10},
		{Id: 3, UserId: 20},
	}

	comparisons := []ComparisonWithID{
		{FirstSubmissionId: 1, SecondSubmissionId: 2},
		{FirstSubmissionId: 1, SecondSubmissionId: 3},
		{FirstSubmissionId: 3, SecondSubmissionId: 2},
	}
	clusters := []ClusterWithID{
		{Members: []int{1, 2}},
		{Members: []int{1, 2, 3}},
	}

	gotComparisons, gotClusters := ExcludeSameUserResults(comparisons, clusters, elements)

	require.Equal(t, []ComparisonWithID{
		{FirstSubmissionId: 1, SecondSubmissionId: 3},
		{FirstSubmissionId: 3, SecondSubmissionId: 2},
	}, gotComparisons)
	require.Equal(t, []ClusterWithID{{Members: []int{1, 2, 3}}}, gotClusters)
}

func TestExcludeSameUserResults_EmptyResults(t *testing.T) {
	elements := []loader.Element{{Id: 1, UserId: 10}, {Id: 2, UserId: 10}}

	comparisons, clusters := ExcludeSameUserResults(
		[]ComparisonWithID{{FirstSubmissionId: 1, SecondSubmissionId: 2}},
		[]ClusterWithID{{Members: []int{1, 2}}},
		elements,
	)

	// The backend reads these as JSON arrays, so they must not serialize as null.
	require.NotNil(t, comparisons)
	require.Empty(t, comparisons)
	require.NotNil(t, clusters)
	require.Empty(t, clusters)
}

func TestExcludeSameUserResults_ClusteringDisabled(t *testing.T) {
	_, clusters := ExcludeSameUserResults(nil, nil, nil)
	require.Nil(t, clusters)
}
