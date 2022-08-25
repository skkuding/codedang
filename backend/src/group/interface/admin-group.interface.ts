export interface AdminGroup {
  id: number
  groupName: string
  private: boolean
  invitationCode?: string
  description: string
  createTime?: Date
  updateTime?: Date
  totalMember: number
  managers?: string[]
}
