import { gql } from '@generated'

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
    ip
    id
  }
}
`)

export { GET_CONTEST_SUBMISSIONS }
