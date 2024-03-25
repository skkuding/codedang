/**
 * The base URL for the client API.
 * @constant
 */
export const baseUrl = process.env.NEXT_PUBLIC_BASEURL

/**
 * The base URL for the admin API.
 * @constant
 */
export const adminBaseUrl = process.env.NEXT_PUBLIC_GQL_BASEURL

/**
 * The milliseconds per minute.
 * @constant
 */
const MILLSECONDS_PER_MINUTE = 60000

/**
 * The time in milliseconds that the access token expires.
 * @constant
 */
export const ACCESS_TOKEN_EXPIRE_TIME = 30 * MILLSECONDS_PER_MINUTE

/**
 * The meta base URL for open graph and twitter card.
 * @constant
 */
export const metaBaseUrl = process.env.VERCEL_URL || process.env.NEXT_URL

/**
 * The languages that are supported by the grading system.
 * @constant
 */
export const languages = ['C', 'Cpp', 'Java', 'Python3'] as const

/**
 * The levels of difficulty for problems.
 * @constant
 */
export const levels = [
  'Level1',
  'Level2',
  'Level3',
  'Level4',
  'Level5'
] as const
