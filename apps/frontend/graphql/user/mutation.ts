import { gql } from '@generated'

const INVITE_USER = gql(`
  mutation inviteUser($groupId: Int!, $isGroupLeader: Boolean!, $userId: Int!) {
    inviteUser(groupId: $groupId, isGroupLeader: $isGroupLeader, userId: $userId){
      userId
      groupId
      isGroupLeader
      user{
        email
      }
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

const UPDATE_GROUP_MEMBER = gql(`
  mutation UpdateGroupMember($userId: Int!, $groupId: Int!, $toGroupLeader: Boolean!) {
    updateGroupMember(userId: $userId, groupId: $groupId, toGroupLeader: $toGroupLeader) {
      userId
      groupId
      isGroupLeader
      createTime
      updateTime
    }
  }
`)

const ISSUE_INVITATION = gql(`
  mutation issueInvitation($groupId: Int!) {
    issueInvitation(groupId: $groupId)
  }
`)

const REVOKE_INVITATION = gql(`
  mutation revokeInvitation($groupId: Int!) {
    revokeInvitation(groupId: $groupId)
  }
`)

const GET_UPDATE_PERMISSIONS = gql(`
  mutation UpdatePermissions($input: UpdateCreationPermissionsInput!) {
    updateCreationPermissions(input: $input) {
      id
      role
      canCreateContest
      canCreateCourse
    }
  }
`)

export {
  INVITE_USER,
  DELETE_GROUP_MEMBER,
  UPDATE_GROUP_MEMBER,
  ISSUE_INVITATION,
  REVOKE_INVITATION,
  GET_UPDATE_PERMISSIONS
}
