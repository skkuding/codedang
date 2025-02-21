import { gql } from '@generated'

const GET_ASSIGNMENT = gql(`
  query GetAssignment($groupId: Int!, $assignmentId: Int!) {
    getAssignment(groupId: $groupId,assignmentId: $assignmentId) {
      id
      enableCopyPaste
      isJudgeResultVisible
      invitationCode
      description
      endTime
      startTime
      title
    }
  }
`)

const GET_ASSIGNMENTS = gql(`
  query GetAssignments($groupId: Int!, $cursor: Int, $take: Int!) {
    getAssignments(groupId: $groupId, cursor: $cursor, take: $take) {
      id
      title
      startTime
      endTime
      description
      participants
      isRankVisible
      isVisible
    }
  }
`)

const GET_BELONGED_ASSIGNMENTS = gql(`
  query GetAssignmentsByProblemId($problemId: Int!) {
    getAssignmentsByProblemId(problemId: $problemId) {
      upcoming {
        id
        title
        problemScore
        totalScore
      }
      ongoing {
        id
        title
        problemScore
        totalScore
      }
      finished {
        id
        title
        problemScore
        totalScore
      }
    }
  }
`)

const GET_ASSIGNMENT_SCORE_SUMMARIES = gql(`
  query GetAssignmentScoreSummaries($groupId: Int!, $assignmentId: Int!, $take: Int!) {
    getAssignmentScoreSummaries(
      groupId: $groupId,
      assignmentId: $assignmentId,
      take: $take
    ) {
      submittedProblemCount
      totalProblemCount
      userAssignmentScore
      assignmentPerfectScore
      problemScores {
        problemId
        score
        maxScore
      }
      userId
      username
      studentId
      realName
      major
    }
  }
`)

const GET_ASSIGNMENT_SUBMISSION_SUMMARIES_OF_USER = gql(`
  query getAssignmentSubmissionSummariesByUserId($groupId: Int!,$assignmentId: Int!, $userId: Int!, $take: Int!) {
    getAssignmentSubmissionSummaryByUserId(assignmentId: $assignmentId, userId: $userId, take: $take, groupId: $groupId) {
      scoreSummary {
        assignmentPerfectScore
        problemScores {
          problemId
          score
        }
        submittedProblemCount
        totalProblemCount
        userAssignmentScore
      }
      submissions {
        assignmentId
        problemTitle
        studentId
        username
        submissionResult
        language
        submissionTime
        codeSize
        problemId
        ip
        order
        id
      }
    }
  }
`)

export {
  GET_ASSIGNMENT,
  GET_ASSIGNMENTS,
  GET_BELONGED_ASSIGNMENTS,
  GET_ASSIGNMENT_SCORE_SUMMARIES,
  GET_ASSIGNMENT_SUBMISSION_SUMMARIES_OF_USER
}
