import { gql } from '@generated'

const CHECK_ASSIGNMENT_SUBMISSIONS = gql(`
  mutation CheckAssignmentSubmissions(
    $input: CreatePlagiarismCheckInput!
    $assignmentId: Int!
    $problemId: Int!
  ) {
    checkAssignmentSubmissions(
      input: $input
      assignmentId: $assignmentId
      problemId: $problemId
    ) {
      id
      problemId
      userId
      language
      enableMerging
      minTokens
      useJplagClustering
      assignmentId
      contestId
      workbookId
      createTime
      result
    }
  }
`)

export { CHECK_ASSIGNMENT_SUBMISSIONS }
