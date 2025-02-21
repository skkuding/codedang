export const refreshTokenCacheKey = (userId: number, refreshToken: string) =>
  `user:${userId}:${refreshToken}`

export const emailAuthenticationPinCacheKey = (email: string) =>
  `email:${email}:email-auth`

export const joinGroupCacheKey = (groupId: number) => `group:${groupId}`

export const invitationCodeKey = (code: string) => `invite:${code}`
export const invitationGroupKey = (groupId: number) => `invite:to:${groupId}`

/* TEST API용 Key */
export const testKey = (testSubmissionId: number, testcaseId: number) =>
  `test:id:${testSubmissionId}:testcase:${testcaseId}`
export const testcasesKey = (testSubmissionId: number) =>
  `test:id:${testSubmissionId}`

/* User Test API용 Key */
export const userTestKey = (testSubmissionId: number, testcaseId: number) =>
  `user-test:id:${testSubmissionId}:testcase:${testcaseId}`
export const userTestcasesKey = (testSubmissionId: number) =>
  `user-test:${testSubmissionId}`
