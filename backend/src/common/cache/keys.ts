export const refreshTokenCacheKey = (userId: number) =>
  `user:${userId}:refresh_token`

export const emailAuthenticationPinCacheKey = (email: string) =>
  `email-auth:${email}`
