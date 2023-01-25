/* eslint-disable */
export interface Membership {
  id: number
  user: {
    username?: string
    student_id: string
    email?: string
    UserProfile: {
      realName: string
    }
  }
  isGroupLeader?: boolean
}
