import { gql } from '@generated'

const GET_CHECK_REQUESTS = gql(`
  query GetCheckRequests($assignmentId: Int!, $problemId: Int!, $groupId: Int!) {
    getCheckRequests(assignmentId: $assignmentId, problemId: $problemId, groupId: $groupId) {
      id
      language
      enableMerging
      minTokens
      useJplagClustering
      createTime
      result
    }
  }
`)

const OVERVIEW_CHECK_BY_ASSIGNMENT_PROBLEM_ID = gql(`
  query OverviewCheckByAssignmentProblemId(
    $problemId: Int!
    $assignmentId: Int!
    $groupId: Int!
    $take: Int!
    $cursor: Int
  ) {
    overviewCheckByAssignmentProblemId(
      problemId: $problemId,
      assignmentId: $assignmentId,
      groupId: $groupId,
      take: $take
      cursor: $cursor
    ) {
      id
      firstCheckSubmission {
        id
        user {
          username
          studentId
        }
      }
      secondCheckSubmission {
        id
        user {
          username
          studentId
        }
      }
      averageSimilarity
      maxSimilarity
      maxLength
      longestMatch
      firstSimilarity
      secondSimilarity
      clusterId
      cluster {
        averageSimilarity
        strength
      }
    }
  }
`)

const GET_CHECK_RESULT_DETAILS = gql(`
  query GetCheckResultDetails($resultId: Int!, $groupId: Int!) {
    getCheckResultDetails(resultId: $resultId, groupId: $groupId) {
      requestId
      firstCheckSubmission {
        id
        user {
          username
          studentId
        }
      }
      secondCheckSubmission {
        id
        user {
          username
          studentId
        }
      }
      averageSimilarity
      maxSimilarity
      maxLength
      longestMatch
      matches {
        startInFirst {
          line
          column
        }
        endInFirst {
          line
          column
        }
        startInSecond {
          line
          column
        }
        endInSecond {
          line
          column
        }
        lengthOfFirst
        lengthOfSecond
      }
      firstSimilarity
      secondSimilarity
      clusterId
    }
  }
`)

const GET_CLUSTER = gql(`
  query GetCluster($clusterId: Int!, $groupId: Int!) {
    getCluster(clusterId: $clusterId, groupId: $groupId) {
      id
      averageSimilarity
      strength
      submissionClusterInfos {
        submissionId
        clusterId
        user {
          username
          studentId
        }
      }
    }
  }
`)

export {
  GET_CHECK_REQUESTS,
  OVERVIEW_CHECK_BY_ASSIGNMENT_PROBLEM_ID,
  GET_CHECK_RESULT_DETAILS,
  GET_CLUSTER
}
