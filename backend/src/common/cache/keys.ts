export const refreshTokenCacheKey = (userId: number) =>
  `user:${userId}:refresh_token`

export const emailAuthenticationPinCacheKey = (email: string) =>
  `email:${email}:email-auth`

export const contestPublicizingRequestKey = (contestId: number) =>
  `contest:${contestId}:publicize`
