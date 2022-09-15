export interface UserGroupInterface {
  id: number
  group_name: string
  description: string
  memberNum?: number
  created_by?: {
    username: string
  }
}
