export interface GroupData {
  id: number
  groupName: string
  description: string
  memberNum: number
  allowJoinFromSearch?: boolean
  leaders?: string[]
  isGroupLeader?: boolean
  isJoined?: boolean
}
