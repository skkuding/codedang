import { gql } from '@generated'

const GET_CONTEST_SUBMISSIONS_COUNT = gql(`
  query GetContestSubmissionsCount(
  $input: GetContestSubmissionsInput!,
  $cursor: Int,
  $take: Int
) {
  getContestSubmissions(
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
  $input: GetContestSubmissionsInput!,
  $cursor: Int,
  $take: Int
) {
  getContestSubmissions(
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
  GET_SUBMISSION
}
