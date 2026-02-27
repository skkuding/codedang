import { type ClassValue, clsx } from 'clsx'
import dayjs from 'dayjs'
import ky, { HTTPError } from 'ky'
import { extendTailwindMerge } from 'tailwind-merge'
import { auth } from './auth'
import { adminRestUrl, baseUrl, UNLIMITED_DATE } from './constants'

const customTwMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [
        {
          text: [
            (value: string) => /^(head|title|sub|body|caption)/.test(value)
          ]
        }
      ]
    }
  }
})

export const cn = (...inputs: ClassValue[]) => {
  return customTwMerge(clsx(inputs))
}

export const isHttpError = (error: unknown) => error instanceof HTTPError

export const fetcher = ky.create({
  prefixUrl: baseUrl,
  retry: 0,
  timeout: 5000,
  throwHttpErrors: false,
  hooks: {}
})

export const fetcherWithAuth = fetcher.extend({
  hooks: {
    beforeRequest: [
      async (request) => {
        // Add access token to request header if user is logged in.
        const session = await auth()
        if (session) {
          request.headers.set('Authorization', session.token.accessToken)
        }
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

export const adminSafeFetcherWithAuth = fetcherWithAuth.extend({
  prefixUrl: adminRestUrl,
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

export const formatDateRange = (
  start: string | Date,
  end: string | Date,
  showYear?: boolean
) => {
  const defaultFormat = 'MMM DD, YYYY HH:mm'
  const adjustedFormat =
    showYear === false ? defaultFormat.replace('YYYY ', '') : defaultFormat
  const formattedStart = dateFormatter(start, adjustedFormat)
  const isEndDefault = new Date(end).toISOString() === UNLIMITED_DATE
  const formattedEnd = isEndDefault ? '' : dateFormatter(end, adjustedFormat)

  return `${formattedStart}${isEndDefault ? ' ~ ' : ` ~ ${formattedEnd}`}`
}

export const formatTimeAgo = (timeString: string) => {
  const date = new Date(timeString)
  const now = new Date()
  const diffInMinutes = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60)
  )

  if (diffInMinutes < 1) {
    return 'Just now'
  }
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`
  }
  if (diffInMinutes < 1440) {
    return `${Math.floor(diffInMinutes / 60)} hour${
      Math.floor(diffInMinutes / 60) > 1 ? 's' : ''
    } ago`
  }
  return `${Math.floor(diffInMinutes / 1440)} day${
    Math.floor(diffInMinutes / 1440) > 1 ? 's' : ''
  } ago`
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

export const getDuration = (
  start: string | number | Date,
  end: string | number | Date
): string => {
  const diff = new Date(end).getTime() - new Date(start).getTime()

  if (diff <= 0) {
    return '00:00:00'
  }

  const totalSeconds = Math.floor(diff / 1000)
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60

  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${pad(h)}:${pad(m)}:${pad(s)}`
}

/**
 * Returns the appropriate color class based on the result status.
 *
 * @param {string} result - The result status to be evaluated.
 * @returns {string} The corresponding color class name based on the result status:
 *   - 'text-green-500!' for 'Accepted'.
 *   - 'text-neutral-400!' for 'Judging' or 'Blind' or null or undefined.
 *   - 'text-red-500!' for any other result status.
 */
export const getResultColor = (result: string | null | undefined): string => {
  if (result === 'Accepted') {
    return 'text-green-500!'
  } else if (
    result === 'Judging' ||
    result === 'Blind' ||
    result === null ||
    result === undefined
  ) {
    return 'text-neutral-400!'
  } else {
    return 'text-red-500!'
  }
}

export const getPageArray = (start: number, end: number) => {
  return Array(end - start + 1)
    .fill(0)
    .map((_, i) => start + i)
}

interface OmitStringProps {
  targetString: string
  maxlength: number
}

export const omitString = ({ targetString, maxlength }: OmitStringProps) => {
  if (targetString.length <= maxlength) {
    return targetString
  } else {
    const result = `${targetString.slice(0, maxlength)}...`
    return result
  }
}

/**
 *
 * @param status status of the contest
 * @returns text style for the status
 */
export const getStatusColor = (status: string): string => {
  if (status.toLowerCase().includes('upcoming')) {
    return 'text-white border-primary bg-primary font-medium'
  } else if (status.toLowerCase().includes('ongoing')) {
    return 'text-primary border-primary font-medium'
  } else {
    return 'text-[#8A8A8A] border-[#C4C4C4]'
  }
}

/**
 *
 * @param text text to capitalize
 * @returns text with first letter capitalized
 */
export const capitalizeFirstLetter = (text: string) =>
  text.charAt(0).toUpperCase() + text.slice(1)

export const hasDueDate = (dueTime: Date) => {
  return new Date(dueTime).toISOString() !== UNLIMITED_DATE
}
