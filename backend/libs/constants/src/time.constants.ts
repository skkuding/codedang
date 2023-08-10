const SECONDS_PER_MINUTE = 60
const SECONDS_PER_HOUR = 60 * SECONDS_PER_MINUTE
const SECONDS_PER_DAY = 24 * SECONDS_PER_HOUR

/** JWT Token Expiration Settings */
export const ACCESS_TOKEN_EXPIRE_TIME = 30 * SECONDS_PER_MINUTE
export const REFRESH_TOKEN_EXPIRE_TIME = SECONDS_PER_DAY
export const REFRESH_TOKEN_COOKIE_OPTIONS = {
  maxAge: 1000 * SECONDS_PER_DAY,
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production'
}
export const EMAIL_AUTH_EXPIRE_TIME = 5 * SECONDS_PER_MINUTE

/** Cache Expiration Settings */
export const PUBLICIZING_REQUEST_EXPIRE_TIME = 7 * SECONDS_PER_DAY
export const JOIN_GROUP_REQUEST_EXPIRE_TIME = 7 * SECONDS_PER_DAY

export const OPEN_SPACE_ID = 1
