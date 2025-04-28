/* eslint-disable @typescript-eslint/no-explicit-any */
import { check, sleep } from 'k6'
import http from 'k6/http'

export const options = {
  vus: 2,
  duration: '2s'
}

const BASE_URL = 'https://codedang.com/api'
const USERNAME = '가나다라마바사'
const PASSWORD = '감자고구마'

export default function () {
  // Login
  const login_res = http.post(
    BASE_URL + '/auth/login',
    JSON.stringify({
      username: USERNAME,
      password: PASSWORD
    }),
    {
      headers: {
        'Content-Type': 'application/json'
      }
    }
  )
  // console.log(login_res)

  check(login_res, { 'login succeeded': (r: any) => r.status === 201 })
  check(login_res, {
    'check Bearer': (r: any) => r.headers.Authorization.indexOf('Bearer') >= 0
  })
  // check(login_res, { 'email auth': (r) => r.headers['Email-Auth'] !== '' })
  sleep(1)
}
