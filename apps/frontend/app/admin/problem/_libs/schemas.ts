import { levels, languages } from '@/libs/constants'
import { z } from 'zod'

const commonSchema = z.object({
  title: z
    .string()
    .min(1, 'The title must contain at least 1 character(s)')
    .max(200, 'The title can only be up to 200 characters long'),
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
        output: z.string().min(1),
        isHidden: z.boolean(),
        scoreWeight: z.number()
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
  isVisible: z.boolean().nullish(),
  tags: z
    .object({ create: z.array(z.number()), delete: z.array(z.number()) })
    .optional()
})

export const createSchema = commonSchema.extend({
  isVisible: z.boolean(),
  tagIds: z.array(z.number())
})
