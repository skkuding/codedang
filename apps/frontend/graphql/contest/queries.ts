import { gql } from '@generated'

const GET_CONTEST = gql(`
  query GetContest($contestId: Int!) {
    getContest(contestId: $contestId) {
      id
      isJudgeResultVisible
      invitationCode
      description
      endTime
      startTime
      title
      invitationCode
      posterUrl
      summary
      freezeTime
      enableCopyPaste
      evaluateWithSampleTestcase
      userContest {
        userId
        role
        user {
          username
          email
          userProfile {
            realName
          }
        }
      }
      contestRecord {
        userId
        user {
          username
          email
        }
      }
    }
  }
`)

const GET_CONTESTS = gql(`
  query GetContests($cursor: Int, $take: Int!) {
    getContests(cursor: $cursor, take: $take) {
      id
      title
      startTime
      endTime
      description
      participants
    }
  }
`)

const GET_BELONGED_CONTESTS =
  gql(`query GetContestsByProblemId($problemId: Int!) {
    getContestsByProblemId(problemId: $problemId) {
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

const GET_CONTEST_SCORE_SUMMARIES =
  gql(`query GetContestScoreSummaries($contestId: Int!, $take: Int!) {
    getContestScoreSummaries(
      contestId: $contestId,
      take: $take
    ) {
      submittedProblemCount
      totalProblemCount
      userContestScore
      contestPerfectScore
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

const GET_CONTEST_SUBMISSION_SUMMARIES_OF_USER =
  gql(`query getContestSubmissionSummariesByUserId($contestId: Int!, $userId: Int!, $take: Int!) {
    getContestSubmissionSummaryByUserId(contestId: $contestId, userId: $userId, take: $take) {
      scoreSummary {
        contestPerfectScore
        problemScores {
          problemId
          score
        }
        submittedProblemCount
        totalProblemCount
        userContestScore
      }
      submissions {
        contestId
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

const GET_CONTEST_UPDATE_HISTORIES =
  gql(`query GetContestUpdateHistories($contestId: Int!) {
    getContestUpdateHistories(contestId: $contestId) {
      updateHistories {
        id
        order
        problemId
        updatedAt
        updatedFields
        updatedInfo
      }
    }
  }
`)

const GET_CONTEST_ROLES = gql(`query GetContestRoles {
    getContestRoles {
      contestId
      role
    }
  }
`)

export {
  GET_CONTEST,
  GET_CONTESTS,
  GET_BELONGED_CONTESTS,
  GET_CONTEST_SCORE_SUMMARIES,
  GET_CONTEST_SUBMISSION_SUMMARIES_OF_USER,
  GET_CONTEST_UPDATE_HISTORIES,
  GET_CONTEST_ROLES
}
