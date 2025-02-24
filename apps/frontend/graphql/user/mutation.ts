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

export { INVITE_USER }
