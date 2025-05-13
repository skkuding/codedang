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
      testcase {
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
      testcase {
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

const UPDATE_ASSIGNMENT_PROBLEMS_ORDER = gql(`
  mutation UpdateAssignmentProblemsOrder($groupId: Int!, $assignmentId: Int!, $orders: [Int!]!) {
    updateAssignmentProblemsOrder(groupId: $groupId, assignmentId: $assignmentId, orders: $orders) {
      order
      assignmentId
      problemId
      score
      createTime
      updateTime
    }
  }
`)

const UPDATE_ASSIGNMENT_PROBLEMS_SCORES = gql(`
  mutation UpdateAssignmentProblemsScore($groupId: Int!, $assignmentId: Int!, $problemIdsWithScore: [ProblemScoreInput!]!) {
    updateAssignmentProblemsScore(groupId: $groupId, assignmentId: $assignmentId, problemIdsWithScore: $problemIdsWithScore) {
      assignmentId
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

const UPLOAD_FILE = gql(`
  mutation uploadFile($input: UploadFileInput!) {
    uploadFile(input: $input) {
      src
    }
  }
`)

const UPLOAD_TESTCASE_ZIP = gql(`
  mutation uploadTestcaseZip($input: UploadTestcaseZipInput!) {
    uploadTestcaseZip(input: $input) {
      testcaseId
    }
  }
`)

export {
  CREATE_PROBLEM,
  UPDATE_PROBLEM,
  UPDATE_PROBLEM_VISIBLE,
  UPDATE_CONTEST_PROBLEMS_ORDER,
  UPDATE_CONTEST_PROBLEMS_SCORES,
  UPDATE_ASSIGNMENT_PROBLEMS_ORDER,
  UPDATE_ASSIGNMENT_PROBLEMS_SCORES,
  DELETE_PROBLEM,
  UPLOAD_PROBLEMS,
  UPLOAD_IMAGE,
  UPLOAD_FILE,
  UPLOAD_TESTCASE_ZIP
}
