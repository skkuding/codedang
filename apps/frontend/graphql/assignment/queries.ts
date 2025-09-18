import { gql } from '@generated'

const GET_ASSIGNMENT = gql(`
  query GetAssignment($groupId: Int!, $assignmentId: Int!) {
    getAssignment(groupId: $groupId,assignmentId: $assignmentId) {
      id
      enableCopyPaste
      isJudgeResultVisible
      isFinalScoreVisible
      autoFinalizeScore
      description
      endTime
      startTime
      dueTime
      title
      week
    }
  }
`)

const GET_ASSIGNMENTS = gql(`
  query GetAssignments($groupId: Int!, $cursor: Int, $take: Int!, $isExercise: Boolean) {
    getAssignments(groupId: $groupId, cursor: $cursor, take: $take, isExercise: $isExercise) {
      id
      title
      startTime
      dueTime
      endTime
      description
      participants
      isRankVisible
      isVisible
      week
    }
  }
`)

const GET_BELONGED_ASSIGNMENTS = gql(`
  query GetAssignmentsByProblemId($problemId: Int!) {
  getAssignmentsByProblemId(problemId: $problemId) {
        upcoming {
          id
          title
          isExercise
          week
          problemScore
          totalScore
          group {
            id
            groupName
            courseInfo {
              courseNum
              classNum
            }
          }
        }
        ongoing {
          id
          title
          isExercise
          week
          problemScore
          totalScore
          group {
            id
            groupName
            courseInfo {
              courseNum
              classNum
            }
          }
        }
        finished {
          id
          title
          isExercise
          week
          problemScore
          totalScore
          group {
            id
            groupName
            courseInfo {
              courseNum
              classNum
            }
          }
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
      userAssignmentFinalScore
      problemScores {
        problemId
        score
        maxScore
        finalScore
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
          maxScore
          finalScore
        }
        submittedProblemCount
        totalProblemCount
        userAssignmentScore
        userAssignmentFinalScore
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

const GET_ASSIGNMENT_PROBLEM_RECORD = gql(`
  query GetAssignmentProblemRecord($groupId: Int!, $assignmentId: Int!, $problemId: Int!, $userId: Int!, ) {
    getAssignmentProblemRecord(groupId: $groupId, assignmentId: $assignmentId, problemId: $problemId, userId: $userId) {
      finalScore
      comment
    }
  }
`)

const GET_ASSIGNMENT_PROBLEM_TESTCASE_RESULTS = gql(`
  query GetAssignmentProblemTestcaseResults(
    $groupId: Int!
    $assignmentId: Int!
    $problemId: Int!
  ) {
    getAssignmentProblemTestcaseResults(
      groupId: $groupId
      assignmentId: $assignmentId
      problemId: $problemId
    ) {
      userId
      result {
        id
        isHidden
        result
      }
    }
  }
`)

export {
  GET_ASSIGNMENT,
  GET_ASSIGNMENTS,
  GET_BELONGED_ASSIGNMENTS,
  GET_ASSIGNMENT_SCORE_SUMMARIES,
  GET_ASSIGNMENT_SUBMISSION_SUMMARIES_OF_USER,
  GET_ASSIGNMENT_PROBLEM_RECORD,
  GET_ASSIGNMENT_PROBLEM_TESTCASE_RESULTS
}
