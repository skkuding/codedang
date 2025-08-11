import * as v from 'valibot'

export const courseSchema = v.object({
  professor: v.pipe(v.string(), v.minLength(1, 'Required')),
  courseTitle: v.pipe(v.string(), v.minLength(1, 'Required')),
  courseCodePrefix: v.pipe(v.string(), v.minLength(1, 'Required')),
  courseCodeSuffix: v.pipe(v.string(), v.minLength(1, 'Required')),
  courseNum: v.pipe(v.string()),
  classNum: v.pipe(v.number(), v.minValue(1, 'Required')),
  semester: v.pipe(v.string('Required'), v.minLength(1, 'Required')),
  week: v.pipe(v.number('Required'), v.minValue(1, 'Required')),
  email: v.optional(v.string()),
  phoneNum: v.optional(v.string()),
  office: v.optional(v.string()),
  website: v.optional(v.string()),
  config: v.object({
    showOnList: v.boolean(),
    allowJoinFromSearch: v.boolean(),
    allowJoinWithURL: v.boolean(),
    requireApprovalBeforeJoin: v.boolean()
  })
})
