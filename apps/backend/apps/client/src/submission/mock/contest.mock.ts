import type { Contest } from '@prisma/client'

export const normalContest: Pick<
  Contest,
  'startTime' | 'penalty' | 'lastPenalty'
> = {
  startTime: new Date(),
  penalty: 1,
  lastPenalty: false
}

export const lastPenaltyContest: Pick<
  Contest,
  'startTime' | 'penalty' | 'lastPenalty'
> = {
  startTime: new Date(),
  penalty: 1,
  lastPenalty: true
}
