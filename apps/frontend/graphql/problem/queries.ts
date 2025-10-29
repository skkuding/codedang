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
      isHiddenUploadedByZip
      isSampleUploadedByZip
      testcase {
        id
        input
        output
        isHidden
        scoreWeightNumerator
        scoreWeightDenominator
      }
      timeLimit
      memoryLimit
      hint
      source
      template
      solution
    }
  }
`)

const GET_PROBLEMS = gql(`
  query GetProblems($cursor: Int, $take: Int!, $input: FilterProblemsInput!, $mode: String!, $contestId: Int) {
    getProblems(cursor: $cursor, take: $take, input: $input, mode: $mode, contestId: $contestId) {
      id
      title
      updateTime
      updateContentTime
      difficulty
      submissionCount
      acceptedRate
      isVisible
      languages
      createdBy {
        username
      }
      tag {
        id
        tag {
          id
          name
        }
      }
      solution
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

const GET_ASSIGNMENT_PROBLEMS = gql(`
  query GetAssignmentProblems($groupId: Int!, $assignmentId: Int!) {
    getAssignmentProblems(groupId: $groupId, assignmentId: $assignmentId) {
      order
      assignmentId
      problemId
      score
      createTime
      updateTime
      solutionReleaseTime
      problem {
        id
        title
        description
        isVisible
        difficulty
        solution
      }
    }
  }
`)

const GET_ASSIGNMENT_PROBLEM_MAX_SCORE = gql(`
  query GetAssignmentProblemMaxScore($groupId: Int!, $assignmentId: Int!) {
    getAssignmentProblems(groupId: $groupId, assignmentId: $assignmentId) {
      problemId
      score
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
        order
        input
        output
        isHidden
        scoreWeightNumerator
        scoreWeightDenominator
      }
    }
  }
`)

const GET_PROBLEM_TESTCASE_WITHOUT_IO = gql(`
  query GetProblemTestcaseWithoutIO($id: Int!) {
    getProblem(id: $id) {
      testcase {
        id
        order
        isHidden
        scoreWeightNumerator
        scoreWeightDenominator
      }
    }
  }
`)

const GET_TESTCASE = gql(`
  query GetTestcase($testcaseId: Int!) {
  getTestcase(testcaseId: $testcaseId) {
    id
    order
    input
    output
    isHidden
    isOutdated
    outdateTime
    scoreWeight
    scoreWeightDenominator
    scoreWeightNumerator
    submissionCount
    createTime
    updateTime
  }
}
`)

export {
  GET_ASSIGNMENT_PROBLEM_MAX_SCORE,
  GET_ASSIGNMENT_PROBLEMS,
  GET_PROBLEM_TESTCASE_WITHOUT_IO,
  GET_CONTEST_PROBLEMS,
  GET_PROBLEM,
  GET_PROBLEM_DETAIL,
  GET_PROBLEM_TESTCASE,
  GET_PROBLEMS,
  GET_TAGS,
  GET_TESTCASE
}
