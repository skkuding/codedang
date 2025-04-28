import { check, sleep } from 'k6'
import http from 'k6/http'

export const options = {
  vus: 3,
  duration: '1s'
}

// const BASE_URL = 'http://localhost:4000'
const BASE_URL = 'https://codedang.com/api'
const USERNAME = 'load1234'
const REALNAME = 'abcde'
const USER_EMAIL = 'eloadtest@gmail.com'
const PASSWORD = "it'smehi"
const VERIFICATION_CODE = '261322'

export default function () {
  // Send pin to new email

  // Verify pin and issue jwt
  const res = http.post(
    BASE_URL + '/email-auth/verify-pin',
    JSON.stringify({
      pin: VERIFICATION_CODE,
      email: USER_EMAIL
    }),
    {
      headers: {
        'Content-Type': 'application/json'
      }
    }
  )
  // if (res.status !== 201) {
  //   console.log(res)
  // }

  check(res, { 'verified pin': (r) => r.status === 201 })
  check(res, { 'email auth': (r) => r.headers['Email-Auth'] !== '' })

  // Sign up
  const res2 = http.post(
    BASE_URL + '/user/sign-up',
    JSON.stringify({
      username: USERNAME,
      realName: REALNAME,
      password: PASSWORD,
      passwordAgain: PASSWORD,
      email: USER_EMAIL,
      verificationCode: VERIFICATION_CODE
    }),
    {
      headers: {
        'Content-Type': 'application/json',
        'email-auth': res.headers['Email-Auth']
      }
    }
  )

  // console.log(res2)

  check(res2, { 'signup succeeded': (r) => r.status === 201 })

  sleep(1)
}
