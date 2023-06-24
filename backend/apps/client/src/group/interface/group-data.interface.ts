export interface GroupData {
  id: number
  groupName: string
  description: string
  memberNum: number
  createdBy: string
  leaders?: string[]
  isGroupLeader?: boolean
}
