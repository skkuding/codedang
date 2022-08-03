export const refreshTokenCacheKey = (userId: number) =>
  `user:${userId}:refresh_token`

export const passwordResetPinCacheKey = (userId: number) =>
  `password-reset:${userId}`
