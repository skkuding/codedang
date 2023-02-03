/* eslint-disable */
export interface Membership {
  userId: number
  groupId: number
  user: {
    username?: string
    email?: string
    userProfile: {
      realName: string
    }
  }
  isGroupLeader?: boolean
}
