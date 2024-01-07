import { z } from 'zod'

export const problemOrderSchema = z
  .union([
    z.literal('id-asc'),
    z.literal('id-desc'),
    z.literal('title-asc'),
    z.literal('title-desc'),
    z.literal('level-asc'),
    z.literal('level-desc'),
    z.literal('acrate-asc'),
    z.literal('acrate-desc'),
    z.literal('submit-asc'),
    z.literal('submit-desc')
  ])
  .default('id-asc')

export type ProblemOrder = z.infer<typeof problemOrderSchema>
