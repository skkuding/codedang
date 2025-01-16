import * as v from 'valibot'

export const getSchema = (updateNow: boolean) =>
  v.object({
    currentPassword: v.optional(v.pipe(v.string(), v.minLength(1, 'Required'))),
    newPassword: v.optional(
      v.pipe(
        v.string(),
        v.minLength(8),
        v.maxLength(20),
        v.check((input) => {
          const invalidPassword = /^([a-z]*|[A-Z]*|[0-9]*|[^a-zA-Z0-9]*)$/
          return !invalidPassword.test(input)
        })
      )
    ),
    confirmPassword: v.optional(v.string()),
    realName: v.optional(
      v.pipe(v.string(), v.regex(/^[a-zA-Z\s]+$/, 'Only English Allowed'))
    ),
    studentId: updateNow
      ? v.pipe(v.string(), v.regex(/^\d{10}$/, 'Only 10 numbers'))
      : v.optional(v.string())
  })
