export interface Membership {
  id: number
  user: {
    username?: string
    student_id: string
    email?: string
    UserProfile: {
      real_name: string
    }
  }
  is_group_manager?: boolean
}
