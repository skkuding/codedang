import { gql } from '@generated'

const GET_PROBLEM = gql(`
  query GetProblem($id: Int!) {
    getProblem(id: $id) {
      title
      isVisible
      difficulty
      languages
      tag {
        tag {
          id
          name
        }
      }
      description
      inputDescription
      outputDescription
      submissionCount
      testcase {
        id
        input
        output
        isHidden
        scoreWeight
      }
      timeLimit
      memoryLimit
      hint
      source
      template
    }
  }
`)

const GET_PROBLEMS = gql(`
  query GetProblems($cursor: Int, $take: Int!, $input: FilterProblemsInput!) {
    getProblems(cursor: $cursor, take: $take, input: $input) {
      id
      title
      updateTime
      difficulty
      submissionCount
      acceptedRate
      isVisible
      languages
      tag {
        id
        tag {
          id
          name
        }
      }
    }
  }
`)

const GET_PROBLEM_DETAIL = gql(`
  query GetProblemDetail($id: Int!) {
    getProblem(id: $id) {
      title
      description
    }
  }
`)

const GET_CONTEST_PROBLEMS = gql(`
  query GetContestProblems($contestId: Int!) {
    getContestProblems(contestId: $contestId) {
      order
      score
      problemId
      problem {
        title
        difficulty
      }
    }
  }
`)

const GET_TAGS = gql(`
  query GetTags {
    getTags {
      id
      name
    }
  }
`)

const GET_PROBLEM_TESTCASE = gql(`
  query GetProblemTestcase($id: Int!) {
    getProblem(id: $id) {
      testcase {
        id
        input
        output
        isHidden
        scoreWeight
      }
    }
  }
`)

export {
  GET_PROBLEM,
  GET_PROBLEMS,
  GET_PROBLEM_DETAIL,
  GET_CONTEST_PROBLEMS,
  GET_TAGS,
  GET_PROBLEM_TESTCASE
}
