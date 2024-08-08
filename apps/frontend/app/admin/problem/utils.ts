import { levels, languages } from '@/lib/constants'
import { z } from 'zod'

const commonSchema = z.object({
  title: z.string().min(1, { message: 'required' }).max(200),
  isVisible: z.boolean(),
  difficulty: z.enum(levels),
  languages: z.array(z.enum(languages)).min(1),
  description: z
    .string()
    .min(1)
    .refine((value) => value !== '<p></p>'),
  inputDescription: z
    .string()
    .min(1)
    .refine((value) => value !== '<p></p>'),
  outputDescription: z
    .string()
    .min(1)
    .refine((value) => value !== '<p></p>'),
  testcases: z
    .array(
      z.object({
        input: z.string().min(1),
        output: z.string().min(1)
      })
    )
    .min(1),
  timeLimit: z.number().min(0),
  memoryLimit: z.number().min(0),
  hint: z.string().optional(),
  source: z.string().optional(),
  template: z
    .array(
      z
        .object({
          language: z.enum([
            'C',
            'Cpp',
            'Golang',
            'Java',
            'Python2',
            'Python3'
          ]),
          code: z.array(
            z.object({
              id: z.number(),
              text: z.string(),
              locked: z.boolean()
            })
          )
        })
        .optional()
    )
    .optional()
})

export const editSchema = commonSchema.extend({
  id: z.number(),
  tags: z
    .object({ create: z.array(z.number()), delete: z.array(z.number()) })
    .optional(),
  samples: z.object({
    create: z
      .array(z.object({ input: z.string().min(1), output: z.string().min(1) }))
      .min(1),
    delete: z.array(z.number().optional())
  })
})

export const createSchema = commonSchema.extend({
  tagIds: z.array(z.number()),
  samples: z
    .array(
      z.object({
        input: z.string().min(1),
        output: z.string().min(1)
      })
    )
    .min(1)
})
