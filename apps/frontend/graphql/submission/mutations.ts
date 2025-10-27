import { gql } from '@generated'

const REJUDGE_ASSIGNMENT_PROBLEM = gql(`
  mutation RejudgeAssignmentProblem($groupId: Int!, $input: RejudgeInput!) {
    rejudgeAssignmentProblem(groupId: $groupId, input: $input) {
      totalSubmissions
      processedSubmissions
      message
    }
  }
`)

export { REJUDGE_ASSIGNMENT_PROBLEM }
