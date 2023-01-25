/* eslint-disable */
export interface UserGroupInterface {
  id: number
  groupName: string
  description: string
  memberNum?: number
  managers?: string[]
  createdBy?: {
    UserProfile: {
      realName: string
    }
  }
}
