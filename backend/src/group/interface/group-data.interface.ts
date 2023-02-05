/* eslint-disable */
export interface GroupData {
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
