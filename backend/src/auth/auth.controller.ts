import {
  Body,
  Controller,
  Get,
  HttpException,
  Post,
  Req,
  Res,
  UnauthorizedException
} from '@nestjs/common'
import { Request, Response } from 'express'
import { AuthService } from './auth.service'

import {
  PasswordNotMatchException,
  InvalidJwtTokenException
} from '../common/exception/business.exception'

import { LoginUserDto } from './dto/login-user.dto'
import { REFRESH_TOKEN_COOKIE_OPTIONS } from './config/jwt.config'

const AUTH_TYPE = 'Bearer'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(
    @Body() loginUserDto: LoginUserDto,
    @Res({ passthrough: true }) res: Response
  ) {
    try {
      const jwtTokens = await this.authService.issueJwtTokens(loginUserDto)

      res.setHeader('authorization', `${AUTH_TYPE} ${jwtTokens.accessToken}`)
      res.cookie(
        'refresh_token',
        jwtTokens.refreshToken,
        REFRESH_TOKEN_COOKIE_OPTIONS
      )
      return
    } catch (error) {
      if (error instanceof PasswordNotMatchException) {
        throw new UnauthorizedException(error.message)
      }
      throw new HttpException('Login Failed', 500)
    }
  }

  @Get('reissue')
  async reIssueAccessToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ) {
    // TODO: 없을때의 예외처리 필요
    const accessToken = req.get('authorization')?.replace(`${AUTH_TYPE} `, '')
    const refreshToken = req.cookies['refresh_token']

    try {
      const newAccessToken = await this.authService.updateAccessToken({
        accessToken,
        refreshToken
      })
      res.setHeader('authorization', `${AUTH_TYPE} ${newAccessToken}`)
      return 'success'
    } catch (error) {
      if (error instanceof InvalidJwtTokenException) {
        throw new UnauthorizedException(error.message)
      }
      throw new HttpException('Failed to reIssue Tokens', 500)
    }
  }
}
