import { gql } from '@generated'

const GET_GROUP_MEMBERS = gql(`
  query GetGroupMembers($groupId: Int!, $cursor: Int, $take: Int!, $leaderOnly: Boolean!) {
    getGroupMembers(groupId: $groupId, cursor: $cursor, take: $take, leaderOnly: $leaderOnly) {
      username
      userId
      name
      email
    }
  }
`)

export { GET_GROUP_MEMBERS }
