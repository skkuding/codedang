import { ContestType } from '@prisma/client'

export class CreateContestDto {
  readonly group_id: number
  readonly title: string
  readonly description: string
  readonly start_time: Date
  readonly end_time: Date
  readonly visible: boolean
  readonly is_rank_visible: boolean
  readonly type: ContestType
}
