/* eslint-disable */
export interface UserGroupInterface {
  id: number
  groupName: string
  description: string
  memberNum?: number
  leaders?: string[]
  createdBy?: {
    userProfile: {
      realName: string
    }
  }
}
