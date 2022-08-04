export interface Membership {
  id: number
  user: {
    username: string
    email: string
    UserProfile: {
      user_id: number
      real_name: string
    }
  }
  is_group_manager?: boolean
}
