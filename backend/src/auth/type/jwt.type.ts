export type JwtPayload = {
  userId: number
  username: string
}

export type JwtObject = JwtPayload & {
  iat: number
  exp: number
  iss: string
}

export type JwtTokens = {
  accessToken: string
  refreshToken: string
}

export type AuthenticatedUser = {
  id: number
  username: string
  role: string
}
