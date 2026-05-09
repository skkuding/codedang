import * as v from 'valibot'

export const signupSchema = v.pipe(
  v.object({
    name: v.pipe(v.string(), v.minLength(1, '이름을 입력해주세요.')),

    birth: v.pipe(
      v.string(),
      v.length(6, '생년월일 6자리를 입력해 주세요.'),
      v.regex(/^\d{6}$/, '생년월일 6자리를 입력해 주세요.')
    ),

    userId: v.pipe(
      v.string(),
      v.minLength(3, '아이디는 3자 이상이어야 합니다.'),
      v.maxLength(10, '아이디는 10자 이하여야 합니다.'),
      v.regex(
        /^[a-z0-9]+$/,
        '아이디는 영문 소문자와 숫자만 사용할 수 있습니다.'
      )
    ),

    password: v.pipe(
      v.string(),
      v.minLength(
        8,
        '대문자, 소문자, 숫자 중 2종류 이상 포함 8-20자를 입력해주세요.'
      ),
      v.maxLength(
        20,
        '대문자, 소문자, 숫자 중 2종류 이상 포함 8-20자를 입력해주세요.'
      ),
      v.regex(
        /^(?:(?=.*[a-z])(?=.*[A-Z])|(?=.*[a-z])(?=.*\d)|(?=.*[A-Z])(?=.*\d)).+$/,
        '대문자, 소문자, 숫자 중 2종류 이상 포함 8-20자를 입력해주세요.'
      )
    ),

    passwordConfirm: v.pipe(
      v.string(),
      v.minLength(1, '비밀번호 확인을 입력해주세요.')
    ),

    nickname: v.string(),

    job: v.pipe(v.string(), v.minLength(1, '직업을 선택해주세요.')),

    university: v.string(),

    major: v.string(),

    studentId: v.pipe(
      v.string(),
      v.check(
        (val) => val === '' || /^\d{10}$/.test(val),
        '학번 10자리를 입력해주세요.'
      )
    ),

    email: v.pipe(
      v.string(),
      v.minLength(1, '이메일을 입력해주세요.'),
      v.email('올바른 이메일 형식이 아닙니다.')
    ),

    terms: v.boolean(),
    privacy: v.boolean(),
    minorPrivacy: v.boolean(),
    marketing: v.boolean()
  }),
  v.forward(
    v.check(
      ({ password, passwordConfirm }) => password === passwordConfirm,
      '비밀번호가 일치하지 않습니다.'
    ),
    ['passwordConfirm']
  )
)
