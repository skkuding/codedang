import * as v from 'valibot'

export const courseSchema = v.object({
  profName: v.pipe(v.string(), v.minLength(1, 'Required')),
  courseTitle: v.pipe(v.string(), v.minLength(1, 'Required')),
  courseCodePrefix: v.pipe(v.string(), v.minLength(1, 'Required')),
  courseCodeNum: v.pipe(v.string(), v.regex(/^\d+$/, 'Must be a number')),
  classSection: v.pipe(v.string(), v.minLength(1, 'Required')),
  semester: v.pipe(v.string(), v.minLength(1, 'Required')),
  weekCount: v.pipe(v.number(), v.minValue(1, 'Must be at least 1')),

  email: v.optional(v.pipe(v.string(), v.email('Invalid email format'))),
  phoneNumber: v.optional(
    v.pipe(v.string(), v.regex(/^\d{10,15}$/, 'Invalid phone number'))
  ),
  office: v.optional(v.string()),
  website: v.optional(v.pipe(v.string(), v.url('Invalid URL')))
})
