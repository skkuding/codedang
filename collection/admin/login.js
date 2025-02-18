const axios = require('axios')

const login = async (req, body) => {
  try {
    const baseUrl = bru.getEnvVar('baseUrl')
    const res = await axios.post(baseUrl + '/auth/login', body, { timeout: 5000 })
    req.setHeader('Authorization', res.headers.authorization)
    req.setHeader('Cookie', res.headers['set-cookie'])
  } catch (error) {
    if (axios.isAxiosError(error)) error.message += ' (in pre-script)'
    throw error
  }
}

const loginAdmin = async (req) => {
  await login(req, {
    username: 'admin',
    password: 'Adminadmin'
  })
}

module.exports = {
  loginAdmin
}
