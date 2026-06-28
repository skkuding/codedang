import * as v from 'valibot'

export const getSchema = () =>
  v.object({
    currentPassword: v.optional(v.pipe(v.string(), v.minLength(1, 'Required'))),
    newPassword: v.optional(
      v.pipe(
        v.string(),
        v.minLength(8, 'Password must be at least 8 characters'),
        v.maxLength(20, 'Password must be at most 20 characters'),
        v.regex(
          /^(?=.*[a-z])(?=.*[A-Z])|(?=.*[a-z])(?=.*\d)|(?=.*[A-Z])(?=.*\d)/,
          'Password must use 2 of: uppercase, lowercase, number'
        )
      )
    ),
    confirmPassword: v.optional(v.string()),
    realName: v.optional(
      v.pipe(
        v.string(),
        v.regex(/^[가-힣a-zA-Z ]*$/, 'only English and Korean supported')
      )
    ),
    studentId: v.optional(v.string()),
    nickname: v.optional(
      v.pipe(
        v.string(),
        v.minLength(1, '닉네임을 입력해주세요'),
        v.maxLength(20, '닉네임은 20자 이하로 입력해주세요')
      )
    )
  })
