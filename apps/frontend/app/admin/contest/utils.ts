import { z } from 'zod'

export const createSchema = z.object({
  title: z.string().min(1).max(100),
  isRankVisible: z.boolean(),
  isVisible: z.boolean(),
  description: z.string().min(1),
  startTime: z.date(),
  endTime: z.date(),
  invitationCode: z.string().min(6).max(6).nullish()
})

export const editSchema = createSchema.extend({
  id: z.number()
})

export interface ContestProblem {
  id: number
  title: string
  order: number
  difficulty: string
}
