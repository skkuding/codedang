export const refreshTokenCacheKey = (userId: number) =>
  `user:${userId}:refresh_token`

export const emailAuthenticationPinCacheKey = (email: string) =>
  `email:${email}:email-auth`

export const contestPublicizingRequestKey = (contestId: number) =>
  `contest:${contestId}:publicize`

export const joinGroupCacheKey = (userId: number, groupId: number) =>
  `user:${userId}:group:${groupId}`

export const invitationCodeKey = (hash: string) => `invite_code:${hash}`
export const invitationGroupKey = (groupId: number) => `invite_group:${groupId}`
