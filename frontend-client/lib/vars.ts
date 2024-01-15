export const baseUrl = process.env.NEXT_PUBLIC_BASEURL

const MILLSECONDS_PER_MINUTE = 60 * 1000

/** JWT Token Expiration Settings */
export const ACCESS_TOKEN_EXPIRE_TIME = 30 * MILLSECONDS_PER_MINUTE
