export type JwtPayload = {
  userId: number
  username: string
}

export type JwtObject = JwtPayload & {
  iat: number
  exp: number
}

export type JwtTokens = {
  accessToken: string
  refreshToken: string
}
