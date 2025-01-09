import { describe, it, expect } from 'vitest'
import { authorize } from './authorize'

describe('authorize', () => {
  it('should return User data when the credential is correct', async () => {
    const credentials = { username: 'admin', password: 'admin' }
    const actual = await authorize(credentials)
    const expected = {
      username: 'test',
      role: 'User',
      accessToken:
        'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsInVzZXJuYW1lIjoiYWRtaW4iLCJpYXQiOjE3MjI5NDE5NzAsImV4cCI6MTcyMjk0Mzc3MCwiaXNzIjoic2trdWRpbmcuZGV2In0.irmggrLtvc6EroLYv-C4MHe96mDit1R6Wbf3W-wseiA',
      refreshToken:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsInVzZXJuYW1lIjoiYWRtaW4iLCJpYXQiOjE3MjI5NDE5NzAsImV4cCI6MTcyMzAyODM3MCwiaXNzIjoic2trdWRpbmcuZGV2In0.BdV0hk0r_1bVIdxKyer8kzZzhSS_k4d8zvTnD28Jpy0',
      accessTokenExpires: 1722943770000,
      refreshTokenExpires: 1723028370000
    }

    expect(actual).toEqual(expected)
  })

  it('should return null when the credential is incorrect', async () => {
    const credentials = { username: 'test', password: 'test' }
    const actual = await authorize(credentials)

    expect(actual).toBeNull()
  })

  it('should return null when fail to get user data', async () => {
    const credentials = { username: 'error', password: 'error' }
    const actual = await authorize(credentials)

    expect(actual).toBeNull()
  })
})
