import {
  Body,
  Controller,
  Get,
  HttpException,
  InternalServerErrorException,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards
} from '@nestjs/common'
import { Request, Response } from 'express'
import { AuthService } from './auth.service'

import {
  PasswordNotMatchException,
  InvalidJwtTokenException
} from '../common/exception/business.exception'

import { LoginUserDto } from './dto/login-user.dto'
import { REFRESH_TOKEN_COOKIE_OPTIONS, AUTH_TYPE } from './config/jwt.config'
import { JwtAuthGuard } from './guard/jwt-auth.guard'
import { RequestWithUser } from './type/jwt.type'
import { extractAccessToken } from './extractAccessToken'

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

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Req() req: RequestWithUser) {
    const accessToken = extractAccessToken(req)
    try {
      await this.authService.disableJwtTokens(req.user.id, accessToken)
      return
    } catch (error) {
      throw new InternalServerErrorException()
    }
  }

  @Get('reissue')
  async reIssueAccessToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ) {
    const accessToken = extractAccessToken(req)
    const refreshToken = req.cookies['refresh_token']
    if (!refreshToken) throw new UnauthorizedException('Invalid Token')

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
      throw new HttpException('Failed to reissue Tokens', 500)
    }
  }
}
