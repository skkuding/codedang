import { UnauthorizedException } from '@nestjs/common'
import { Request } from 'express'
import { AUTH_TYPE } from './config/jwt.config'

export function extractAccessToken(req: Request) {
  const authorizationHeader = req.get('authorization')
  if (!authorizationHeader) throw new UnauthorizedException('Invalid Token')

  const [authType, accessToken] = authorizationHeader.split(' ')
  if (authType !== AUTH_TYPE)
    throw new UnauthorizedException('Invalid authorization type')

  return accessToken
}
