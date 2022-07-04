export const refreshTokenCacheKey = (userId: number) =>
  `user:${userId}:refresh_token`

export const jwtBlackListCacheKey = (jwtToken: string) =>
  `jwt_token:${jwtToken}:black_list`
