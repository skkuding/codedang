import { gql } from '@generated'

const INVITE_USER = gql(`
  mutation inviteUser($groupId: Int!, $isGroupLeader: Boolean!, $userId: Int!) {
    inviteUser(groupId: $groupId, isGroupLeader: $isGroupLeader, userId: $userId){
      userId
      groupId
      isGroupLeader
    }
  }
`)

const DELETE_GROUP_MEMBER = gql(`
  mutation deleteGroupMember($userId: Int!, $groupId: Int!) {
    deleteGroupMember(userId: $userId, groupId: $groupId) {
      userId
      groupId
      isGroupLeader
      createTime
      updateTime
    }
  }
`)

export { INVITE_USER, DELETE_GROUP_MEMBER }
