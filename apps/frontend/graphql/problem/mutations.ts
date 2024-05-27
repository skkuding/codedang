import { gql } from '@generated'

const CREATE_PROBLEM = gql(`
  mutation CreateProblem($groupId: Int!, $input: CreateProblemInput!) {
    createProblem(groupId: $groupId, input: $input) {
      id
      createdById
      groupId
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
      samples {
        input
        output
      }
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

const UPDATE_CONTEST_PROBLEMS_ORDER = gql(`
  mutation UpdateContestProblemsOrder($groupId: Int!, $contestId: Int!, $orders: [Int!]!) {
    updateContestProblemsOrder(groupId: $groupId, contestId: $contestId, orders: $orders) {
      order
      contestId
      problemId
    }
  }
`)

const EDIT_VISIBLE = gql(`
  mutation UpdateVisible($groupId: Int!, $input: UpdateProblemInput!) {
    updateProblem(groupId: $groupId, input: $input) {
      id
      isVisible
    }
  }
`)

const DELETE_PROBLEM = gql(`
  mutation DeleteProblem($groupId: Int!, $id: Int!) {
    deleteProblem(groupId: $groupId, id: $id) {
      id
    }
  }
`)

const UPDATE_PROBLEM = gql(`
  mutation UpdateProblem($groupId: Int!, $input: UpdateProblemInput!) {
    updateProblem(groupId: $groupId, input: $input) {
      id
      createdById
      groupId
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
      samples {
        input
        output
      }
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

const UPLOAD_PROBLEMS = gql(`
  mutation uploadProblems ($groupId: Int!, $input: UploadFileInput!) {
    uploadProblems(groupId: $groupId, input: $input) {
      id
    }
  }
`)

export {
  UPDATE_CONTEST_PROBLEMS_ORDER,
  EDIT_VISIBLE,
  DELETE_PROBLEM,
  CREATE_PROBLEM,
  UPDATE_PROBLEM,
  UPLOAD_PROBLEMS
}
