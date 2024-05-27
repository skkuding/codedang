import { gql } from '@generated'

const GET_CONTESTS = gql(`
  query getContests($groupId: Int!, $cursor: Int, $take: Int!) {
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

const GET_CONTEST = gql(`
  query GetContest($contestId: Int!) {
    getContest(contestId: $contestId) {
      id
      description
      endTime
      startTime
      title
    }
  }
`)

export { GET_CONTESTS, GET_CONTEST }
