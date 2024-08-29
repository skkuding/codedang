import { gql } from '@generated'

const GET_CONTEST = gql(`
  query GetContest($contestId: Int!) {
    getContest(contestId: $contestId) {
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

const GET_CONTESTS = gql(`
  query GetContests($groupId: Int!, $cursor: Int, $take: Int!) {
    getContests(groupId: $groupId, cursor: $cursor, take: $take) {
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

const GET_BELONGED_CONTESTS =
  gql(`query GetContestsByProblemId($problemId: Int!) {
  getContestsByProblemId(problemId: $problemId) {
    upcoming {
      id
      title
    }
    ongoing {
      id
      title
    }
    finished {
      id
      title
    }
  }
}`)

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
    }
  }`)

const GET_CONTEST_SUBMISSION_SUMMARIES_OF_USER =
  gql(`query getContestSubmissionSummariesByUserId($contestId: Int!, $userId: Int!) {
  getContestSubmissionSummaryByUserId(contestId: $contestId, userId: $userId) {
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
}`)

export {
  GET_CONTEST,
  GET_CONTESTS,
  GET_BELONGED_CONTESTS,
  GET_CONTEST_SCORE_SUMMARIES,
  GET_CONTEST_SUBMISSION_SUMMARIES_OF_USER
}
