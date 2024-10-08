import { type ClassValue, clsx } from 'clsx'
import dayjs from 'dayjs'
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
  retry: 0,
  timeout: 5000,
  throwHttpErrors: false,
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

// difference with fetcher: "throws" http error (must handle error when using)
export const safeFetcher = fetcher.extend({
  throwHttpErrors: true
})

export const safeFetcherWithAuth = fetcherWithAuth.extend({
  throwHttpErrors: true
})

export const convertToLetter = (n: number) => {
  return String.fromCharCode(65 + n)
}

export const dateFormatter = (date: string | Date, format: string) => {
  return dayjs(
    new Date(date).toLocaleString('en-US', { timeZone: 'Asia/Seoul' })
  ).format(format)
}

export const getStatusWithStartEnd = (startTime: string, endTime: string) => {
  const now = new Date()
  const start = dayjs(startTime, 'YYYY-MM-DD HH:mm:ss').toDate()
  const end = dayjs(endTime, 'YYYY-MM-DD HH:mm:ss').toDate()
  if (now < start) {
    return 'upcoming'
  } else if (now > end) {
    return 'finished'
  } else {
    return 'ongoing'
  }
}
