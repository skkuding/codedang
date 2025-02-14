import * as v from 'valibot'

export const createSchema = v.object({
  title: v.pipe(
    v.string(),
    v.minLength(1, 'The title must contain at least 1 character(s)'),
    v.maxLength(200, 'The title can only be up to 200 characters long')
  ),

  isRankVisible: v.boolean(),
  isVisible: v.boolean(),
  description: v.pipe(
    v.string(),
    v.minLength(1),
    v.check((value) => value !== '<p></p>')
  ),
  startTime: v.date(),
  endTime: v.date(),
  enableCopyPaste: v.boolean(),
  isJudgeResultVisible: v.boolean(),
  invitationCode: v.nullable(
    v.pipe(
      v.string(),
      v.regex(/^\d{6}$/, 'The invitation code must be a 6-digit number')
    )
  )
})

export const editSchema = v.object({
  id: v.number(),
  ...createSchema.entries
})
