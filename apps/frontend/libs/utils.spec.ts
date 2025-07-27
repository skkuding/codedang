import { HTTPError } from 'ky'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { baseUrl } from './constants'
import * as utils from './utils'

vi.mock('ky', () => {
  class HTTPError extends Error {}
  const fakeInstance = {
    get: vi.fn(),
    post: vi.fn(),
    extend: vi.fn(function (this: typeof fakeInstance) {
      return this
    })
  }
  const fakeKy = {
    create: vi.fn(() => fakeInstance)
  }
  return {
    __esModule: true,
    default: fakeKy,
    HTTPError
  }
})

describe('cn', () => {
  it('should merge class names', () => {
    expect(utils.cn('a', 'b')).toBe('a b')
  })
})

describe('isHttpError', () => {
  it('should return true for HTTPError', () => {
    const err = new HTTPError(
      new Response('error', { status: 400 }),
      new Request('http://localhost:3000/api/v1/users', { method: 'GET' }),
      {
        method: 'GET',
        credentials: 'include',
        retry: {
          methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD']
        },
        prefixUrl: baseUrl || '',
        onDownloadProgress: () => {}
      }
    )
    expect(utils.isHttpError(err)).toBe(true)
    expect(err).toBeInstanceOf(HTTPError)
  })
  it('should return false for other errors', () => {
    expect(utils.isHttpError(new Error('err'))).toBe(false)
  })
})

describe('convertToLetter', () => {
  it('should convert 0 to A', () => {
    expect(utils.convertToLetter(0)).toBe('A')
  })
  it('should convert 25 to Z', () => {
    expect(utils.convertToLetter(25)).toBe('Z')
  })
  it('should throw error if n is not an integer between 0 and 25', () => {
    expect(() => utils.convertToLetter(-1)).toThrow()
    expect(() => utils.convertToLetter(26)).toThrow()
    expect(() => utils.convertToLetter(1.5)).toThrow()
  })
})

describe('dateFormatter', () => {
  it('should format date object to YYYY-MM-DD', () => {
    const date = new Date('2025-01-01T00:00:00Z')
    const result = utils.dateFormatter(date, 'YYYY-MM-DD')
    expect(result).toBe('2025-01-01')
  })
  it('should format date string to MMM DD, YYYY', () => {
    const date = '2025-01-01T00:00:00Z'
    const result = utils.dateFormatter(date, 'MMM DD, YYYY')
    expect(result).toBe('Jan 01, 2025')
  })
})

describe('formatDateRange', () => {
  it('should format date range', () => {
    const start = '2025-01-01T00:00:00Z'
    const end = '2025-01-02T00:00:00Z'
    expect(utils.formatDateRange(start, end)).toContain('~')
  })
})

describe('getStatusWithStartEnd', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })
  it('should return upcoming if now < start', () => {
    const now = new Date('2025-01-01T00:00:00')
    vi.setSystemTime(now)
    expect(
      utils.getStatusWithStartEnd('2025-01-02 00:00:00', '2025-01-03 00:00:00')
    ).toBe('upcoming')
  })
  it('should return finished if now > end', () => {
    const now = new Date('2025-01-04T00:00:00')
    vi.setSystemTime(now)
    expect(
      utils.getStatusWithStartEnd('2025-01-02 00:00:00', '2025-01-03 00:00:00')
    ).toBe('finished')
  })
  it('should return ongoing if start <= now <= end', () => {
    const now = new Date('2025-01-02T12:00:00')
    vi.setSystemTime(now)
    expect(
      utils.getStatusWithStartEnd('2025-01-02 00:00:00', '2025-01-03 00:00:00')
    ).toBe('ongoing')
  })
})

describe('getResultColor', () => {
  it('should return green for Accepted', () => {
    expect(utils.getResultColor('Accepted')).toBe('!text-green-500')
  })
  it('should return neutral for Judging/Blind/null/undefined', () => {
    const neutralStatuses = ['Judging', 'Blind', null, undefined]
    neutralStatuses.forEach((status) => {
      expect(utils.getResultColor(status)).toBe('!text-neutral-400')
    })
  })
  it('should return red for others', () => {
    expect(utils.getResultColor('Wrong')).toBe('!text-red-500')
  })
})

describe('getPageArray', () => {
  it('should return array from start to end', () => {
    expect(utils.getPageArray(1, 3)).toEqual([1, 2, 3])
    expect(utils.getPageArray(5, 5)).toEqual([5])
  })
})

describe('omitString', () => {
  it('should omit and add ... if too long', () => {
    expect(utils.omitString({ targetString: 'abcdef', maxlength: 3 })).toBe(
      'abc...'
    )
  })
  it('should return as is if short', () => {
    expect(utils.omitString({ targetString: 'abc', maxlength: 5 })).toBe('abc')
  })
})

describe('getStatusColor', () => {
  it('should return correct color for status', () => {
    expect(utils.getStatusColor('upcoming')).toContain('bg-primary')
    expect(utils.getStatusColor('ongoing')).toContain('text-primary')
    expect(utils.getStatusColor('finished')).toContain('#8A8A8A')
  })
})

describe('capitalizeFirstLetter', () => {
  it('should capitalize first letter', () => {
    expect(utils.capitalizeFirstLetter('hello')).toBe('Hello')
    expect(utils.capitalizeFirstLetter('Hello')).toBe('Hello')
    expect(utils.capitalizeFirstLetter('h')).toBe('H')
    expect(utils.capitalizeFirstLetter('')).toBe('')
  })
})
