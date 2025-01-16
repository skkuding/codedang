import * as v from 'valibot'

export const createSchema = v.object({
  title: v.pipe(v.string(), v.minLength(1)),
  content: v.pipe(v.string(), v.minLength(1)),
  isFixed: v.boolean(),
  isVisible: v.boolean()
})
