export interface Membership {
  id: number
  user: {
    username: string
    studentId: string
    email: string
    UserProfile: {
      realName: string
    }
  }
  isGroupManager?: boolean
}
