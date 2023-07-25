export interface GroupData {
  id: number
  groupName: string
  description: string
  memberNum: number
  createdBy: string
  allowJoinFromSearch?: boolean
  leaders?: string[]
  isGroupLeader?: boolean
  isJoined?: boolean
}
