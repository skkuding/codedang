import { http, HttpResponse } from 'msw'

export const handlers = [
  http.get('https://test.com/api/user', async ({ request }) => {
    const authorization = request.headers.get('Authorization')
    if (
      authorization ===
      'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsInVzZXJuYW1lIjoiYWRtaW4iLCJpYXQiOjE3MjI5NDE5NzAsImV4cCI6MTcyMjk0Mzc3MCwiaXNzIjoic2trdWRpbmcuZGV2In0.irmggrLtvc6EroLYv-C4MHe96mDit1R6Wbf3W-wseiA'
    ) {
      // For testing success case
      return HttpResponse.json({
        username: 'test',
        role: 'User'
      })
    } else {
      // For testing error case
      return new HttpResponse('Unauthorized', {
        status: 401
      })
    }
  }),
  http.post('https://test.com/api/auth/login', async ({ request }) => {
    const credential: Record<string, string> = (await request.json()) as Record<
      string,
      string
    >

    if (
      credential &&
      credential.username === 'admin' &&
      credential.password === 'admin'
    ) {
      // For testing success case
      return new HttpResponse(undefined, {
        headers: {
          authorization:
            'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsInVzZXJuYW1lIjoiYWRtaW4iLCJpYXQiOjE3MjI5NDE5NzAsImV4cCI6MTcyMjk0Mzc3MCwiaXNzIjoic2trdWRpbmcuZGV2In0.irmggrLtvc6EroLYv-C4MHe96mDit1R6Wbf3W-wseiA',
          'set-cookie':
            'refresh_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsInVzZXJuYW1lIjoiYWRtaW4iLCJpYXQiOjE3MjI5NDE5NzAsImV4cCI6MTcyMzAyODM3MCwiaXNzIjoic2trdWRpbmcuZGV2In0.BdV0hk0r_1bVIdxKyer8kzZzhSS_k4d8zvTnD28Jpy0; Max-Age=86400; Path=/api/auth/reissue; Expires=Wed, 07 Aug 2024 10:59:30 GMT; HttpOnly; Secure; SameSite=None; Secure'
        }
      })
    } else if (
      credential &&
      credential.username === 'error' &&
      credential.password === 'error'
    ) {
      // For testing error case that fails to get user data
      return new HttpResponse(undefined, {
        headers: {
          authorization:
            'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsInVzZXJuYW1lIjoiYWRtaW4iLCJpYXQiOjE3MjI5NDE5NzAsImV4cCI6MTcyMjk0Mzc3MCwiaXNzIjoic2trdWRpbmcuZGV2In0.irmggrLtvc6EroLYv-C4MHe96mDit1R6Wbf3W-wseiAds',
          'set-cookie':
            'refresh_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsInVzZXJuYW1lIjoiYWRtaW4iLCJpYXQiOjE3MjI5NDE5NzAsImV4cCI6MTcyMzAyODM3MCwiaXNzIjoic2trdWRpbmcuZGV2In0.BdV0hk0r_1bVIdxKyer8kzZzhSS_k4d8zvTnD28Jpy0; Max-Age=86400; Path=/api/auth/reissue; Expires=Wed, 07 Aug 2024 10:59:30 GMT; HttpOnly; Secure; SameSite=None; Secure'
        }
      })
    } else {
      // For testing error case that fails to login
      return new HttpResponse('Unauthorized', {
        status: 401
      })
    }
  })
]
