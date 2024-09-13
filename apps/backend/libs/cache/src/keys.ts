export const refreshTokenCacheKey = (userId: number, refreshToken: string) =>
  `user:${userId}:${refreshToken}`

export const emailAuthenticationPinCacheKey = (email: string) =>
  `email:${email}:email-auth`

export const joinGroupCacheKey = (groupId: number) => `group:${groupId}`

export const invitationCodeKey = (code: string) => `invite:${code}`
export const invitationGroupKey = (groupId: number) => `invite:to:${groupId}`

export const testKey = (userId: number) => `test:user:${userId}`
