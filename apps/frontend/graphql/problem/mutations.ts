import { gql } from '@generated'

const CREATE_PROBLEM = gql(`
  mutation CreateProblem($input: CreateProblemInput!) {
    createProblem(input: $input) {
      id
      createdById
      title
      isVisible
      difficulty
      languages
      problemTag {
        tagId
      }
      description
      inputDescription
      outputDescription
      problemTestcase {
        input
        output
      }
      timeLimit
      memoryLimit
      hint
      source
      template
    }
  }
`)

const UPDATE_PROBLEM = gql(`
  mutation UpdateProblem($input: UpdateProblemInput!) {
    updateProblem(input: $input) {
      id
      createdById
      title
      isVisible
      difficulty
      languages
      problemTag {
        tag {
          id
          name
        }
      }
      description
      inputDescription
      outputDescription
      problemTestcase {
        input
        output
      }
      timeLimit
      memoryLimit
      hint
      source
      template
    }
  }
`)

const UPDATE_PROBLEM_VISIBLE = gql(`
  mutation UpdateProblemVisible($input: UpdateProblemInput!) {
    updateProblem(input: $input) {
      id
      isVisible
    }
  }
`)

const UPDATE_CONTEST_PROBLEMS_ORDER = gql(`
  mutation UpdateContestProblemsOrder($contestId: Int!, $orders: [Int!]!) {
    updateContestProblemsOrder(contestId: $contestId, orders: $orders) {
      order
      contestId
      problemId
    }
  }
`)

const UPDATE_CONTEST_PROBLEMS_SCORES = gql(`
  mutation UpdateContestProblemsScore($contestId: Int!, $problemIdsWithScore: [ProblemScoreInput!]!) {
    updateContestProblemsScore(contestId: $contestId, problemIdsWithScore: $problemIdsWithScore) {
      contestId
      problemId
      score
      order
    }
  }
`)

const DELETE_PROBLEM = gql(`
  mutation DeleteProblem($id: Int!) {
    deleteProblem(id: $id) {
      id
    }
  }
`)

const UPLOAD_PROBLEMS = gql(`
  mutation UploadProblems($input: UploadFileInput!) {
    uploadProblems(input: $input) {
      id
    }
  }
`)

const UPLOAD_IMAGE = gql(`
  mutation uploadImage($input: UploadFileInput!) {
    uploadImage(input: $input) {
      src
    }
  }
`)

export {
  CREATE_PROBLEM,
  UPDATE_PROBLEM,
  UPDATE_PROBLEM_VISIBLE,
  UPDATE_CONTEST_PROBLEMS_ORDER,
  UPDATE_CONTEST_PROBLEMS_SCORES,
  DELETE_PROBLEM,
  UPLOAD_PROBLEMS,
  UPLOAD_IMAGE
}
