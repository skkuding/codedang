import { gql } from '@generated'

const GET_PROBLEM = gql(`
  query GetProblem($groupId: Int!, $id: Int!) {
    getProblem(groupId: $groupId, id: $id) {
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
      samples {
        id
        input
        output
      }
      testcase {
        id
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

const GET_PROBLEMS = gql(`
  query GetProblems(
    $groupId: Int!
    $cursor: Int
    $take: Int!
    $input: FilterProblemsInput!
  ) {
    getProblems(
      groupId: $groupId
      cursor: $cursor
      take: $take
      input: $input
    ) {
      id
      title
      createTime
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
  query GetProblemDetail($groupId: Int!, $id: Int!) {
    getProblem(groupId: $groupId, id: $id) {
      title
      description
    }
  }
`)

const GET_CONTEST_PROBLEMS = gql(`
  query GetContestProblems($groupId: Int!, $contestId: Int!) {
    getContestProblems(groupId: $groupId, contestId: $contestId) {
      order
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

export {
  GET_PROBLEM,
  GET_PROBLEMS,
  GET_PROBLEM_DETAIL,
  GET_CONTEST_PROBLEMS,
  GET_TAGS
}
