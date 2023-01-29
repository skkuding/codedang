/* eslint-disable */
export interface Membership {
  id: number
  user: {
    username?: string
    email?: string
    userProfile: {
      realName: string
    }
  }
  isGroupLeader?: boolean
}
