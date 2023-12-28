export const refreshTokenCacheKey = (userId: number) =>
  `user:${userId}:refresh_token`

export const emailAuthenticationPinCacheKey = (email: string) =>
  `email:${email}:email-auth`

export const joinGroupCacheKey = (groupId: number) => `group:${groupId}`

export const invitationCodeKey = (code: string) => `invite:${code}`
export const invitationGroupKey = (groupId: number) => `invite:to:${groupId}`
