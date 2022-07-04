import {
  Controller,
  UseGuards,
  Body,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
  InternalServerErrorException
} from '@nestjs/common'
import { Request, Response } from 'express'
import { AuthService } from './auth.service'

import {
  PasswordNotMatchException,
  InvalidJwtTokenException
} from '../common/exception/business.exception'

import {
  REFRESH_TOKEN_COOKIE_OPTIONS,
  AUTH_TYPE
} from './constants/jwt.constants'
import { LoginUserDto } from './dto/login-user.dto'
import { JwtAuthGuard } from './guard/jwt-auth.guard'
import { AuthenticatedRequest } from './interface/authenticated-request.interface'
import { JwtTokens } from './type/jwt.type'

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
      if (error instanceof PasswordNotMatchException) {
        throw new UnauthorizedException(error.message)
      }
      throw new InternalServerErrorException('Login failed')
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(
    @Req() req: AuthenticatedRequest,
    @Res({ passthrough: true }) res: Response
  ) {
    try {
      await this.authService.deleteRefreshToken(req.user.id)
      res.clearCookie('refresh_token', REFRESH_TOKEN_COOKIE_OPTIONS)
      return
    } catch (error) {
      throw new InternalServerErrorException()
    }
  }

  @Get('reissue')
  async reIssueJwtTokens(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ) {
    const refreshToken = req.cookies['refresh_token']
    if (!refreshToken) throw new UnauthorizedException('Invalid Token')

    try {
      const newJwtTokens = await this.authService.updateJwtTokens(refreshToken)
      setJwtResponse(res, newJwtTokens)
      return
    } catch (error) {
      if (error instanceof InvalidJwtTokenException) {
        throw new UnauthorizedException(error.message)
      }
      throw new InternalServerErrorException('Failed to reissue tokens')
    }
  }
}
