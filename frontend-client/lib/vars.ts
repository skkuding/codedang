export const baseUrl = process.env.NEXT_PUBLIC_BASEURL
export const adminBaseUrl = process.env.NEXT_ADMIN_BASEURL
/** JWT Token Expiration Settings */
const MILLSECONDS_PER_MINUTE = 60 * 1000
export const ACCESS_TOKEN_EXPIRE_TIME = 30 * MILLSECONDS_PER_MINUTE
export const metaBaseUrl = process.env.VERCEL_URL || process.env.NEXT_URL
