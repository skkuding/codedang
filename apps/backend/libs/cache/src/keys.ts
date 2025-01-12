export const refreshTokenCacheKey = (userId: number, refreshToken: string) =>
  `user:${userId}:${refreshToken}`

export const emailAuthenticationPinCacheKey = (email: string) =>
  `email:${email}:email-auth`

export const joinGroupCacheKey = (groupId: number) => `group:${groupId}`

export const invitationCodeKey = (code: string) => `invite:${code}`
export const invitationGroupKey = (groupId: number) => `invite:to:${groupId}`

/* TEST API용 Key */
export const testKey = (userId: number, testcaseId: number) =>
  `test:user:${userId}:testcase:${testcaseId}`
export const testcasesKey = (userId: number) => `test:user:${userId}`

/* User Test API용 Key */
export const userTestKey = (userId: number, testcaseId: number) =>
  `user-test:${userId}:testcase:${testcaseId}`
export const userTestcasesKey = (userId: number) => `user-test:${userId}`
