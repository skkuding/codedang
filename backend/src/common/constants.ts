const SECONDS_PER_MINUTE = 60
const SECONDS_PER_HOUR = 60 * SECONDS_PER_MINUTE
const SECONDS_PER_DAY = 24 * SECONDS_PER_HOUR

export const AUTH_TYPE = 'Bearer'

export const ACCESS_TOKEN_EXPIRE_TIME = 30 * SECONDS_PER_MINUTE
export const REFRESH_TOKEN_EXPIRE_TIME = SECONDS_PER_DAY

// TODO: production 환경에서는 secure, signed cookie 사용하기
export const REFRESH_TOKEN_COOKIE_OPTIONS = {
  maxAge: 1000 * SECONDS_PER_DAY,
  httpOnly: true
  // secure: true,
}

export const EMAIL_AUTH_EXPIRE_TIME = 5 * SECONDS_PER_MINUTE

export const PUBLICIZING_REQUEST_EXPIRE_TIME = 7 * SECONDS_PER_DAY

export const PUBLIC_GROUP_ID = 1
export const PAGINATION_MAX_LIMIT = 10
export const PAGINATION_MIN_LIMIT = 0
export const PAGINATION_MIN_OFFSET = 0
