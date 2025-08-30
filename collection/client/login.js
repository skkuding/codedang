const axios = require('axios')

const login = async (req, body) => {
  try {
    // TODO: call API only if not already logged in
    // TODO: refresh token automatically
    const baseUrl = bru.getEnvVar('baseUrl')
    const res = await axios.post(baseUrl + '/auth/login', body, { timeout: 5000 })
    bru.setVar('jwtToken', res.headers.authorization)
    req.setHeader('Authorization', res.headers.authorization)
    req.setHeader('Cookie', res.headers['set-cookie'])
  } catch (error) {
    if (axios.isAxiosError(error)) error.message += ' (in pre-script)'
    throw error
  }
}

const loginSuper = async (req) => {
  await login(req, {
    username: 'super',
    password: 'Supersuper'
  })
}

const loginAdmin = async (req) => {
  await login(req, {
    username: 'admin',
    password: 'Adminadmin'
  })
}

const loginContestAdmin = async (req) => {
  await login(req, {
    username: 'contestAdmin',
    password: 'ContestAdmin'
  })
}

const loginContestManager = async (req) => {
  await login(req, {
    username: 'contestManager',
    password: 'ContestManager'
  })
}

const loginContestReviewer = async (req) => {
  await login(req, {
    username: 'contestReviewer',
    password: 'ContestReviewer'
  })
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

const loginUser2nd = async (req) => {
  await login(req, {
    username: 'user02',
    password: 'Useruser'
  })
}

module.exports = {
  loginSuper,
  loginAdmin,
  loginContestAdmin,
  loginContestManager,
  loginContestReviewer,
  loginInstructor,
  loginUser,
  loginUser2nd,
}
