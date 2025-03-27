import { gql } from '@generated'

const CREATE_CONTEST = gql(`
  mutation CreateContest($input: CreateContestInput!) {
    createContest(input: $input) {
      id
      invitationCode
      enableCopyPaste
      isJudgeResultVisible
      description
      endTime
      startTime
      title
      summary
      posterUrl
      freezeTime
      userContest{
        userId
        role
      }
    }
  }
`)

const UPDATE_CONTEST = gql(`
  mutation UpdateContest($input: UpdateContestInput!) {
    updateContest(input: $input) {
      id
      invitationCode
      enableCopyPaste
      isJudgeResultVisible
      description
      endTime
      startTime
      title
      summary
      posterUrl
      freezeTime
      userContest{
        userId
        role
      }
    }
  }
`)

const UPDATE_CONTEST_VISIBLE = gql(`
  mutation UpdateContestVisible($input: UpdateContestInput!) {
    updateContest(input: $input) {
      id
    }
  }
`)

const DELETE_CONTEST = gql(`
  mutation DeleteContest($contestId: Int!) {
    deleteContest(contestId: $contestId) {
      id
    }
  }
`)

const IMPORT_PROBLEMS_TO_CONTEST = gql(`
  mutation ImportProblemsToContest(
    $contestId: Int!,
    $problemIdsWithScore: [ProblemScoreInput!]!
  ) {
    importProblemsToContest(
      contestId: $contestId,
      problemIdsWithScore: $problemIdsWithScore
    ) {
      contestId
      problemId
      score
    }
  }
`)

const REMOVE_PROBLEMS_FROM_CONTEST = gql(`
  mutation RemoveProblemsFromContest(
    $contestId: Int!,
    $problemIds: [Int!]!
  ) {
    removeProblemsFromContest(
      contestId: $contestId,
      problemIds: $problemIds
    ) {
      contestId
      problemId
    }
  }
`)

export {
  CREATE_CONTEST,
  UPDATE_CONTEST,
  UPDATE_CONTEST_VISIBLE,
  DELETE_CONTEST,
  IMPORT_PROBLEMS_TO_CONTEST,
  REMOVE_PROBLEMS_FROM_CONTEST
}
