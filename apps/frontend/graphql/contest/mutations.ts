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
  mutation UpdateContest($contestId: Int!, $input: UpdateContestInput!) {
    updateContest(contestId: $contestId, input: $input) {
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
  mutation UpdateContestVisible($contestId: Int!, $input: UpdateContestInput!) {
    updateContest(contestId: $contestId, input: $input) {
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

const CREATE_CONTEST_ANNOUNCEMENT = gql(`
  mutation createAnnouncement($contestId: Int!, $input: CreateAnnouncementInput!) {
    createAnnouncement(contestId: $contestId, input: $input) {
      id
      problemId
      content
      createTime
      updateTime
    }
  }
`)

const CREATE_CONTEST_QNA_COMMENT = gql(`
  mutation createContestQnaComment($contestId: Int!, $qnaId: Int!, $content: String!) {
    createContestQnAComment(contestId: $contestId, order: $qnaId, content: $content) {
      id
    }
  }`)

const DELETE_CONTEST_QNA = gql(`
  mutation deleteContestQna($contestId: Int!, $qnaId: Int!) {
    deleteContestQnA(contestId: $contestId, order: $qnaId) {
      id
    }
  }
`)

const DELETE_CONTEST_QNA_COMMENT = gql(`
  mutation deleteContestQnaComment($contestId: Int!, $qnaId: Int!, $commentId: Int!) {
    deleteContestQnAComment(contestId: $contestId, qnAOrder: $qnaId, commentOrder: $commentId) {
      id
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
  CREATE_CONTEST_ANNOUNCEMENT,
  CREATE_CONTEST_QNA_COMMENT,
  DELETE_CONTEST_QNA,
  DELETE_CONTEST_QNA_COMMENT
}
