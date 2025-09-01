import { gql } from '@generated'

const GET_CONTEST_SUBMISSIONS_COUNT = gql(`
  query GetContestSubmissionsCount(
  $contestId: Int!,
  $input: GetContestSubmissionsInput!,
  $cursor: Int,
  $take: Int
) {
  getContestSubmissions(
    contestId: $contestId,
    input: $input,
    cursor: $cursor,
    take: $take
  ) {
    id
  }
}
`)

const GET_CONTEST_SUBMISSIONS = gql(`
  query GetContestSubmissions(
  $contestId: Int!,
  $input: GetContestSubmissionsInput!,
  $cursor: Int,
  $take: Int
) {
  getContestSubmissions(
    contestId: $contestId,
    input: $input,
    cursor: $cursor,
    take: $take
  ) {
    title
    studentId
    realname
    username
    result
    language
    submissionTime
    codeSize
    problemId
    order
    ip
    id
  }
}
`)

const GET_ASSIGNMENT_SUBMISSIONS = gql(`
  query GetAssignmentSubmissions(
    $groupId: Int!,
    $input: GetAssignmentSubmissionsInput!,
    $cursor: Int,
    $take: Int,
    $order: String
  ) {
    getAssignmentSubmissions(
      groupId: $groupId,
      input: $input,
      cursor: $cursor,
      take: $take,
      order: $order
    ) {
      title
      studentId
      realname
      username
      result
      language
      submissionTime
      codeSize
      problemId
      order
      ip
      id
    }
  }
`)

const GET_SUBMISSION = gql(`query GetSubmission(
  $id: Int!
) {
  getSubmission(id: $id) {
    id
    userId
    userIp
    problemId
    contestId
    workbookId
    code
    codeSize
    language
    result
    score
    createTime
    updateTime
    testcaseResult {
      cpuTime
      id
      submissionId
      problemTestcaseId
      problemTestcase {
        input
        output
      }
      output
      result
      memoryUsage
      createTime
      updateTime
    }
    user {
      id
      studentId
      major
      username
      userProfile {
        realName
      }
    }
    contest {
      id
      title
    }
    problem {
      id
      title

    }
  }
}`)

const GET_SUBMISSIONS = gql(`
  query GetSubmissions(
    $problemId: Int!
    $cursor: Int
    $take: Int
  ) {
    getSubmissions(
      problemId: $problemId
      cursor: $cursor
      take: $take
    ) {
      data {
        id
        user {
          id
          username
          studentId
        }
        userIp
        codeSize
        createTime
        language
        result
        score
      }
      total
    }
  }
`)

const GET_ASSIGNMENT_LATEST_SUBMISSION = gql(`
  query GetAssignmentLatestSubmission(
    $groupId: Int!
    $assignmentId: Int!
    $userId: Int!
    $problemId: Int!
  ) {
    getAssignmentLatestSubmission(
      groupId: $groupId
      assignmentId: $assignmentId
      userId: $userId
      problemId: $problemId
    ) {
      id
      code
      codeSize
      language
      result
      score
      updateTime
      testcaseResult {
        cpuTime
        problemTestcaseId
        result
        memoryUsage
        isHidden
        scoreWeightNumerator
        scoreWeightDenominator
        output
      }
      user {
        id
        studentId
        username
        userProfile {
          realName
        }
      }
      assignment{
        title
      }
      problem {
        title
      }
    }
  }
`)

export {
  GET_CONTEST_SUBMISSIONS_COUNT,
  GET_CONTEST_SUBMISSIONS,
  GET_ASSIGNMENT_LATEST_SUBMISSION,
  GET_ASSIGNMENT_SUBMISSIONS,
  GET_SUBMISSION,
  GET_SUBMISSIONS
}
