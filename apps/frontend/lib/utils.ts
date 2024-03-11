import { type ClassValue, clsx } from 'clsx'
import ky, { TimeoutError } from 'ky'
import { toast } from 'sonner'
import { twMerge } from 'tailwind-merge'
import { auth } from './auth'
import { baseUrl } from './constants'

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs))
}

export const fetcher = ky.create({
  prefixUrl: baseUrl,
  throwHttpErrors: false,
  retry: 0,
  timeout: 5000,
  hooks: {
    beforeError: [
      (error) => {
        if (error instanceof TimeoutError) {
          toast.error('Request timed out. Please try again later.')
        }
        return error
      }
    ]
  }
})

export const fetcherWithAuth = fetcher.extend({
  hooks: {
    beforeRequest: [
      async (request) => {
        // Add access token to request header if user is logged in.
        const session = await auth()
        if (session)
          request.headers.set('Authorization', session.token.accessToken)
      }
    ],
    afterResponse: [
      // Retry option is not working, so we use this workaround.
      async (request, options, response) => {
        if (response.status === 401) {
          const session = await auth()
          if (session) {
            request.headers.set('Authorization', session.token.accessToken)
            fetcher(request, {
              ...options,
              hooks: {} // Remove hooks to prevent infinite loop.
            })
          }
        }
      }
    ]
  }
})

export const convertToLetter = (n: number) => {
  return String.fromCharCode(65 + n)
}
