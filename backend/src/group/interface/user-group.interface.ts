export interface UserGroupInterface {
  id: number
  group_name: string
  description: string
  memberNum?: number
  managers?: string[]
  created_by?: {
    UserProfile: {
      real_name: string
    }
  }
}
