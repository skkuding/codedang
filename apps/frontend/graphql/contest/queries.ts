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

export { GET_CONTEST, GET_CONTESTS, GET_BELONGED_CONTESTS }
