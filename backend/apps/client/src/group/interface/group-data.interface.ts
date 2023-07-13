import { Prisma } from '@prisma/client'

export interface GroupData {
  id: number
  groupName: string
  description: string
  memberNum: number
  createdBy: string
  config?: Prisma.JsonValue
  leaders?: string[]
  isGroupLeader?: boolean
}
