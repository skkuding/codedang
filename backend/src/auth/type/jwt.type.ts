import { Request } from 'express'

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

export type VerifiedUser = {
  id: number
  username: string
  role: string
}

export interface RequestWithUser extends Request {
  user: VerifiedUser
}
