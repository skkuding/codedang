import { type ClassValue, clsx } from 'clsx'
import ky from 'ky'
import { getServerSession } from 'next-auth'
import { twMerge } from 'tailwind-merge'
import { authOptions } from './auth'
import { baseUrl } from './vars'

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs))
}

export const fetcher = ky.create({
  prefixUrl: baseUrl,
  credentials: 'include'
})

// TODO: add refresh token logic
export const fetcherWithAuth = fetcher.extend({
  hooks: {
    beforeRequest: [
      async (request) => {
        const session = await getServerSession(authOptions)
        if (session) {
          request.headers.set('Authorization', session.user.accessToken)
        }
      }
    ]
  }
})
