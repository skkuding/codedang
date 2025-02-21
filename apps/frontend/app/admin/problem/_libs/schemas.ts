import { levels, languages } from '@/libs/constants'
import * as v from 'valibot'

const commonSchema = v.object({
  title: v.pipe(
    v.string(),
    v.minLength(1, 'The title must contain at least 1 character(s)'),
    v.maxLength(200, 'The title can only be up to 200 characters long')
  ),
  difficulty: v.picklist(levels),
  languages: v.pipe(v.array(v.picklist(languages)), v.minLength(1)),
  description: v.pipe(
    v.string(),
    v.minLength(1),
    v.check((value) => value !== '<p></p>')
  ),
  inputDescription: v.pipe(
    v.string(),
    v.minLength(1),
    v.check((value) => value !== '<p></p>')
  ),
  outputDescription: v.pipe(
    v.string(),
    v.minLength(1),
    v.check((value) => value !== '<p></p>')
  ),
  testcases: v.pipe(
    v.array(
      v.object({
        input: v.pipe(v.string(), v.minLength(1)),
        output: v.pipe(v.string(), v.minLength(1)),
        isHidden: v.boolean(),
        scoreWeight: v.number()
      })
    ),
    v.minLength(1)
  ),
  timeLimit: v.pipe(v.number(), v.minValue(0)),
  memoryLimit: v.pipe(v.number(), v.minValue(0)),
  hint: v.optional(v.string()),
  source: v.optional(v.string()),
  template: v.optional(
    v.array(
      v.optional(
        v.object({
          language: v.picklist([
            'C',
            'Cpp',
            'Golang',
            'Java',
            'Python2',
            'Python3'
          ]),
          code: v.array(
            v.object({
              id: v.number(),
              text: v.string(),
              locked: v.boolean()
            })
          )
        })
      )
    )
  )
})

export const editSchema = v.object({
  ...commonSchema.entries,
  id: v.number(),
  isVisible: v.nullable(v.boolean()),
  tags: v.optional(
    v.object({ create: v.array(v.number()), delete: v.array(v.number()) })
  )
})

export const createSchema = v.object({
  ...commonSchema.entries,
  isVisible: v.boolean(),
  tagIds: v.array(v.number())
})
