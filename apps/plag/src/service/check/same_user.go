package check

import "github.com/skkuding/codedang/apps/plag/src/loader"

func ExcludeSameUserResults(
	comparisons []ComparisonWithID,
	clusters []ClusterWithID,
	elements []loader.Element,
) ([]ComparisonWithID, []ClusterWithID) {
	userIds := make(map[int]int, len(elements))
	for _, element := range elements {
		userIds[element.Id] = element.UserId
	}

	isSameUser := func(firstId, secondId int) bool {
		firstUser, firstOk := userIds[firstId]
		secondUser, secondOk := userIds[secondId]
		return firstOk && secondOk && firstUser == secondUser
	}

	filteredComparisons := make([]ComparisonWithID, 0, len(comparisons))
	for _, comparison := range comparisons {
		if !isSameUser(comparison.FirstSubmissionId, comparison.SecondSubmissionId) {
			filteredComparisons = append(filteredComparisons, comparison)
		}
	}

	if clusters == nil {
		return filteredComparisons, nil
	}

	filteredClusters := make([]ClusterWithID, 0, len(clusters))
	for _, cluster := range clusters {
		singleUser := len(cluster.Members) > 0
		for _, member := range cluster.Members {
			if !isSameUser(cluster.Members[0], member) {
				singleUser = false
				break
			}
		}
		if !singleUser {
			filteredClusters = append(filteredClusters, cluster)
		}
	}

	return filteredComparisons, filteredClusters
}
