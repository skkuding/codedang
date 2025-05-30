import { gql } from '@generated'

const GET_USERS = gql(`
  query GetUsers($cursor: Int, $take: Int!) {
    getUsers(cursor: $cursor, take: $take) {
      id
      userProfile {
        realName
        createTime
      }
      username
      email
      studentId
      major
      role
      canCreateCourse
      canCreateContest
      lastLogin
    }
  }
`)

const GET_USERS_SET_MANAGER = gql(`
  query GetUserSetManager($cursor: Int, $take: Int!){
    getUsers(cursor: $cursor, take: $take) {
      id
      username
      email
      userProfile {
        realName
      }
      role
    }
  }
`)

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
  }
`)

const GET_GROUP_MEMBERS = gql(`
  query GetGroupMembers($groupId: Int!, $cursor: Int, $take: Int!, $leaderOnly: Boolean!) {
    getGroupMembers(groupId: $groupId, cursor: $cursor, take: $take, leaderOnly: $leaderOnly) {
      userId
      name
      email
      username
      major
      studentId
      role
      isGroupLeader
    }
  }
`)

export { GET_GROUP_MEMBER, GET_GROUP_MEMBERS, GET_USERS, GET_USERS_SET_MANAGER }
