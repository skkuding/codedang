import * as v from 'valibot'

export const createSchema = v.object({
  title: v.pipe(
    v.string(),
    v.minLength(1, 'The title must contain at least 1 character(s)'),
    v.maxLength(200, 'The title can only be up to 200 characters long')
  ),
  isRankVisible: v.boolean(),
  isVisible: v.boolean(),
  description: v.string(),
  startTime: v.optional(v.date()),
  endTime: v.optional(v.date()),
  dueTime: v.nullish(v.date()),
  week: v.number(),
  enableCopyPaste: v.boolean(),
  isJudgeResultVisible: v.boolean(),
  autoFinalizeScore: v.boolean()
})

export const editSchema = v.object({
  id: v.number(),
  ...createSchema.entries
})
