export const baseUrl = process.env.NEXT_PUBLIC_BASEURL

const SECONDS_PER_MINUTE = 60

/** JWT Token Expiration Settings */
export const ACCESS_TOKEN_EXPIRE_TIME = 30 * SECONDS_PER_MINUTE
