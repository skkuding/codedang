import { Controller, Post, Req, Res, UseGuards } from '@nestjs/common'
import { User } from '@prisma/client'
import { Request, Response } from 'express'
import { AuthService } from './auth.service'
import { LocalAuthGuard } from './guard/local-auth.guard'
import { REFRESH_TOKEN_COOKIE_OPTIONS } from './config/jwt.config'

const AUTH_TYPE = 'Bearer'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const user: Partial<User> = req.user
    const jwtTokens = await this.authService.issueTokens(user.username, user.id)

    res.setHeader('authorization', `${AUTH_TYPE} ${jwtTokens.accessToken}`)
    res.cookie(
      'refresh_token',
      jwtTokens.refreshToken,
      REFRESH_TOKEN_COOKIE_OPTIONS
    )
    return 'success'
  }

  @Post('reissue')
  async reIssueAccessToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ) {
    // TODO: 없을때의 예외처리 필요
    const accessToken = req.get('authorization')?.replace(`${AUTH_TYPE} `, '')
    const refreshToken = req.cookies['refresh_token']

    const newAccessToken = await this.authService.updateAccessToken(
      accessToken,
      refreshToken
    )
    res.setHeader('Authorization', `${AUTH_TYPE} ${newAccessToken}`)
    return 'success'
  }
}
