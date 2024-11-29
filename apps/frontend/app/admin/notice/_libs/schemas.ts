import { z } from 'zod'

export const createSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  isFixed: z.boolean(),
  isVisible: z.boolean()
})
