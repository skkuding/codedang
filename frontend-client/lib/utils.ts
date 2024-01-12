import { type ClassValue, clsx } from 'clsx'
import ky from 'ky'
import { twMerge } from 'tailwind-merge'
import { getAuth } from './auth'
import { baseUrl } from './vars'

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs))
}

export const fetcher = ky.create({
  prefixUrl: baseUrl,
  throwHttpErrors: false
})

export const fetcherWithAuth = fetcher.extend({
  hooks: {
    beforeRequest: [
      async (request) => {
        // Add access token to request header if user is logged in.
        const { isAuth, token } = await getAuth()
        if (isAuth) request.headers.set('Authorization', token.accessToken)
      }
    ],
    afterResponse: [
      async (request, options, response) => {
        if (response.status === 401) {
          // If access token is expired, reissue it. and then retry.
          const { isAuth, token } = await getAuth()
          if (isAuth) request.headers.set('Authorization', token.accessToken)
          fetcher(request, options)
        }
      }
    ]
  }
})
