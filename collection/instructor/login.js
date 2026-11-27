const axios = require('axios')

const login = async (req, body) => {
  try {
    const baseUrl = bru.getEnvVar('baseUrl')
    const res = await axios.post(baseUrl + '/auth/login', body, { timeout: 5000 })
    req.setHeader('Authorization', res.headers.authorization)
    // Convert Set-Cookie values into a Cookie request header without attributes.
    const setCookies = res.headers['set-cookie']
    const cookies = Array.isArray(setCookies)
      ? setCookies
      : setCookies
        ? [setCookies]
        : []
    req.setHeader(
      'Cookie',
      cookies.map((cookie) => cookie.split(';')[0]).join('; ')
    )
  } catch (error) {
    if (axios.isAxiosError(error)) error.message += ' (in pre-script)'
    throw error
  }
}

const loginInstructor = async (req) => {
  await login(req, {
    username: 'instructor',
    password: 'Instructorinstructor'
  })
}

const loginUser = async (req) => {
  await login(req, {
    username: 'user01',
    password: 'Useruser'
  })
}

module.exports = {
  loginInstructor,loginUser
}
