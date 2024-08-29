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
  mutation UpdateProblemVisible($groupId: Int!, $input: UpdateProblemInput!) {
    updateProblem(groupId: $groupId, input: $input) {
      id
      isVisible
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

const DELETE_PROBLEM = gql(`
  mutation DeleteProblem($groupId: Int!, $id: Int!) {
    deleteProblem(groupId: $groupId, id: $id) {
      id
    }
  }
`)

const UPLOAD_PROBLEMS = gql(`
  mutation UploadProblems ($groupId: Int!, $input: UploadFileInput!) {
    uploadProblems(groupId: $groupId, input: $input) {
      id
    }
  }
`)

const UPLOAD_IMAGE = gql(`
  mutation uploadImage ($input: UploadFileInput!){
    uploadImage(input: $input){
      src
    }
  }
`)

export {
  CREATE_PROBLEM,
  UPDATE_PROBLEM,
  UPDATE_PROBLEM_VISIBLE,
  UPDATE_CONTEST_PROBLEMS_ORDER,
  DELETE_PROBLEM,
  UPLOAD_PROBLEMS,
  UPLOAD_IMAGE
}
