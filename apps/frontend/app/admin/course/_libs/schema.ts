import * as v from 'valibot'

export const courseSchema = v.object({
  professor: v.pipe(v.string(), v.minLength(1, 'Required')),
  courseTitle: v.pipe(v.string(), v.minLength(1, 'Required')),
  courseNum: v.pipe(
    v.string(),
    v.minLength(1, 'Required'),
    v.length(7),
    v.regex(
      /^[A-Z]{3,4}\d{3,4}$/,
      'Course number must start with 3-4 uppercase letters followed by 3-4 digits'
    )
  ),
  classNum: v.pipe(v.number(), v.minValue(1, 'Required'), v.maxValue(99)),
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
