const axios = require('axios')

const login = async (req, body) => {
  const baseUrl = bru.getEnvVar('baseUrl')
  const res = await axios.post(baseUrl + '/auth/login', body)
  req.setHeader('Authorization', res.headers.authorization)
  req.setHeader('Cookie', res.headers['set-cookie'])
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
