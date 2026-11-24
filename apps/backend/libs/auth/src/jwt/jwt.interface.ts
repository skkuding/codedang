export interface JwtPayload {
  userId: number
  username: string
  userRole: string
  tokenType: 'access' | 'refresh'
}

export interface JwtObject extends JwtPayload {
  iat: number
  exp: number
  iss: string
}

export interface JwtTokens {
  accessToken: string
  refreshToken: string
}
