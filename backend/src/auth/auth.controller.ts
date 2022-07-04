import {
  Controller,
  UseGuards,
  Body,
  Get,
  Post,
  Req,
  Res,
  HttpException,
  UnauthorizedException,
  InternalServerErrorException
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
import { JwtTokens, RequestWithUser } from './type/jwt.type'

const setJwtResponse = (res: Response, jwtTokens: JwtTokens) => {
  res.setHeader('authorization', `${AUTH_TYPE} ${jwtTokens.accessToken}`)
  res.cookie(
    'refresh_token',
    jwtTokens.refreshToken,
    REFRESH_TOKEN_COOKIE_OPTIONS
  )
}

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
      setJwtResponse(res, jwtTokens)
      return
    } catch (error) {
      console.log(error)
      if (error instanceof PasswordNotMatchException) {
        throw new UnauthorizedException(error.message)
      }
      throw new HttpException('Login Failed', 500)
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(
    @Req() req: RequestWithUser,
    @Res({ passthrough: true }) res: Response
  ) {
    try {
      await this.authService.deleteRefreshToken(req.user.id)
      res.clearCookie('refresh_token', REFRESH_TOKEN_COOKIE_OPTIONS)
      return
    } catch (error) {
      throw new InternalServerErrorException('handled')
    }
  }

  @Get('reissue')
  async reIssueAccessToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ) {
    const refreshToken = req.cookies['refresh_token']
    if (!refreshToken) throw new UnauthorizedException('Invalid Token')

    try {
      const newJwtTokens = await this.authService.updateJwtTokens(refreshToken)
      setJwtResponse(res, newJwtTokens)
      return 'success'
    } catch (error) {
      if (error instanceof InvalidJwtTokenException) {
        throw new UnauthorizedException(error.message)
      }
      throw new HttpException('Failed to reissue Tokens', 500)
    }
  }
}
