import * as v from 'valibot'

export const signupSchema = v.object({
  name: v.pipe(v.string(), v.minLength(1, '이름을 입력해주세요.')),

  birth: v.pipe(
    v.string(),
    v.length(6, '생년월일 6자리를 입력해주세요.'),
    v.regex(/^\d{6}$/, '생년월일은 숫자 6자리여야 합니다.')
  ),

  userId: v.pipe(
    v.string(),
    v.minLength(3, '아이디는 3자 이상이어야 합니다.'),
    v.maxLength(10, '아이디는 10자 이하여야 합니다.'),
    v.regex(/^[a-z0-9]+$/, '아이디는 영문 소문자와 숫자만 사용할 수 있습니다.')
  ),

  password: v.pipe(
    v.string(),
    v.minLength(8, '비밀번호는 8자 이상이어야 합니다.'),
    v.maxLength(20, '비밀번호는 20자 이하여야 합니다.'),
    v.regex(
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).*$/,
      '비밀번호는 영문자, 숫자, 특수문자를 포함해야 합니다.'
    )
  ),

  passwordConfirm: v.pipe(
    v.string(),
    v.minLength(1, '비밀번호 확인을 입력해주세요.')
  ),

  nickname: v.string(),

  job: v.pipe(v.string(), v.minLength(1, '직업을 입력해주세요.')),

  email: v.pipe(
    v.string(),
    v.minLength(1, '이메일을 입력해주세요.'),
    v.email('올바른 이메일 형식이 아닙니다.')
  )
})
