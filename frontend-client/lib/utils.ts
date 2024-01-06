import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { type ClassValue, clsx } from 'clsx'
import ky from 'ky'
import { getServerSession } from 'next-auth'
import { twMerge } from 'tailwind-merge'
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
        const session = await getServerSession(authOptions)
        if (session) {
          request.headers.set('Authorization', session.token.accessToken)
        }
      }
    ]
  }
})
