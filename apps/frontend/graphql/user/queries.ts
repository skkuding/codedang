import { gql } from '@generated'

const GET_GROUP_MEMBER =
  gql(`query GetGroupMember($groupId: Int!, $userId: Int!) {
  getGroupMember(groupId: $groupId, userId: $userId) {
  	username
    userId
    name
    email
    studentId
    major
    role
  }
}`)

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

export { GET_GROUP_MEMBER, GET_GROUP_MEMBERS }
