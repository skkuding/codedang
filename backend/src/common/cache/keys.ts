export const refreshTokenCacheKey = (userId: number) =>
  `user:${userId}:refresh_token`

export const passwordResetPinCacheKey = (email: string) =>
  `password-reset:${email}`
