const SECONDS_PER_MINUTE = 60
const SECONDS_PER_HOUR = 60 * SECONDS_PER_MINUTE
const SECONDS_PER_DAY = 24 * SECONDS_PER_HOUR

/** JWT Token Expiration Settings */
export const ACCESS_TOKEN_EXPIRE_TIME = 30 * SECONDS_PER_MINUTE
export const REFRESH_TOKEN_EXPIRE_TIME = SECONDS_PER_DAY
export const REFRESH_TOKEN_COOKIE_OPTIONS = {
  maxAge: 1000 * SECONDS_PER_DAY,
  httpOnly: true,
  secure:
    process.env.APP_ENV === 'production' || process.env.APP_ENV === 'stage',
  path:
    process.env.APP_ENV === 'production' || process.env.APP_ENV === 'stage'
      ? '/api/auth/reissue'
      : '/auth/reissue'
}
export const EMAIL_AUTH_EXPIRE_TIME = 5 * SECONDS_PER_MINUTE

/** Cache Expiration Settings (in milliseconds) */
export const PUBLICIZING_REQUEST_EXPIRE_TIME = 7 * SECONDS_PER_DAY * 1000
export const JOIN_GROUP_REQUEST_EXPIRE_TIME = 7 * SECONDS_PER_DAY * 1000
export const INVIATION_EXPIRE_TIME = 14 * SECONDS_PER_DAY * 1000
export const TEST_SUBMISSION_EXPIRE_TIME = 10 * SECONDS_PER_MINUTE * 1000

export const PUBLICIZING_REQUEST_KEY = 'publicize'

/** Image Size Limitation */
const KILOBYTE = 1024
const MEGABYTE = 1024 * KILOBYTE
export const MAX_IMAGE_SIZE = 5 * MEGABYTE
export const MAX_FILE_SIZE = 30 * MEGABYTE
export const MAX_ZIP_SIZE = 100 * MEGABYTE

/* Problem isVisible setting Lock Time */
export const MIN_DATE: Date = new Date('2000-01-01T00:00:00.000Z')
export const MAX_DATE: Date = new Date('2999-12-31T00:00:00.000Z')
