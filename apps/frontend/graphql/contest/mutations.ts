import { gql } from '@generated'

const CREATE_CONTEST = gql(`
  mutation CreateContest($groupId: Int!, $input: CreateContestInput!) {
    createContest(groupId: $groupId, input: $input) {
      id
      isVisible
      isRankVisible
      description
      endTime
      startTime
      title
    }
  }
`)

const IMPORT_PROBLEMS_TO_CONTEST = gql(`
  mutation ImportProblemsToContest(
    $groupId: Int!,
    $contestId: Int!,
    $problemIds: [Int!]!
  ) {
    importProblemsToContest(
      groupId: $groupId,
      contestId: $contestId,
      problemIds: $problemIds
    ) {
      contestId
      problemId
    }
  }
`)

const UPDATE_CONTEST = gql(`
  mutation UpdateContest($groupId: Int!, $input: UpdateContestInput!) {
    updateContest(groupId: $groupId, input: $input) {
      id
      isRankVisible
      isVisible
      description
      endTime
      startTime
      title
    }
  }
`)

const REMOVE_PROBLEMS_FROM_CONTEST = gql(`
  mutation RemoveProblemsFromContest(
    $groupId: Int!,
    $contestId: Int!,
    $problemIds: [Int!]!
  ) {
    removeProblemsFromContest(
      groupId: $groupId,
      contestId: $contestId,
      problemIds: $problemIds
    ) {
      contestId
      problemId
    }
  }
`)

const DELETE_CONTEST = gql(`
  mutation DeleteContest($groupId: Int!, $contestId: Int!) {
    deleteContest(groupId: $groupId, contestId: $contestId) {
      id
    }
  }
`)

const EDIT_VISIBLE = gql(`
  mutation UpdateContestVisible($groupId: Int!, $input: UpdateContestInput!) {
    updateContest(groupId: $groupId, input: $input) {
      id
      isVisible
      isRankVisible
    }
  }
`)

export {
  CREATE_CONTEST,
  IMPORT_PROBLEMS_TO_CONTEST,
  UPDATE_CONTEST,
  REMOVE_PROBLEMS_FROM_CONTEST,
  DELETE_CONTEST,
  EDIT_VISIBLE
}
