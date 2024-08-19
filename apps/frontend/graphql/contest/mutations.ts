import { gql } from '@generated'

const CREATE_CONTEST = gql(`
  mutation CreateContest($groupId: Int!, $input: CreateContestInput!) {
    createContest(groupId: $groupId, input: $input) {
      id
      invitationCode
      isVisible
      isRankVisible
      description
      endTime
      startTime
      title
    }
  }
`)

const UPDATE_CONTEST = gql(`
  mutation UpdateContest($groupId: Int!, $input: UpdateContestInput!) {
    updateContest(groupId: $groupId, input: $input) {
      id
      invitationCode
      isRankVisible
      isVisible
      description
      endTime
      startTime
      title
    }
  }
`)

const UPDATE_CONTEST_VISIBLE = gql(`
  mutation UpdateContestVisible($groupId: Int!, $input: UpdateContestInput!) {
    updateContest(groupId: $groupId, input: $input) {
      id
      isVisible
      isRankVisible
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

const DUPLICATE_CONTEST = gql(`
  mutation DuplicateContest($groupId: Int!, $contestId: Int!) {
    duplicateContest(groupId: $groupId, contestId: $contestId) {
      contest {
        id
        invitationCode
        isRankVisible
        isVisible
        description
        endTime
        startTime
        title
      }
      problems {
        problemId
        contestId
        order

      }
      records {
        id
        userId
        score
      }
    }
  }
`)

export {
  CREATE_CONTEST,
  UPDATE_CONTEST,
  UPDATE_CONTEST_VISIBLE,
  DELETE_CONTEST,
  IMPORT_PROBLEMS_TO_CONTEST,
  REMOVE_PROBLEMS_FROM_CONTEST,
  DUPLICATE_CONTEST
}
