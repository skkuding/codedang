import {
  Controller,
  Body,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
  InternalServerErrorException,
  Logger,
  UseGuards
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { Request, Response } from 'express'
import {
  AuthenticatedRequest,
  AuthNotNeededIfOpenSpace,
  type JwtTokens
} from '@libs/auth'
import { REFRESH_TOKEN_COOKIE_OPTIONS } from '@libs/constants'
import {
  InvalidJwtTokenException,
  UnidentifiedException
} from '@libs/exception'
import { AuthService } from './auth.service'
import { LoginUserDto } from './dto/login-user.dto'
import type { GithubUser } from './interface/social-user.interface'

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name)

  constructor(private readonly authService: AuthService) {}

  setJwtResponse = (res: Response, jwtTokens: JwtTokens) => {
    res.setHeader('authorization', `Bearer ${jwtTokens.accessToken}`)
    res.cookie(
      'refresh_token',
      jwtTokens.refreshToken,
      REFRESH_TOKEN_COOKIE_OPTIONS
    )
  }

  @AuthNotNeededIfOpenSpace()
  @Post('login')
  async login(
    @Body() loginUserDto: LoginUserDto,
    @Res({ passthrough: true }) res: Response
  ) {
    try {
      const jwtTokens = await this.authService.issueJwtTokens(loginUserDto)
      this.setJwtResponse(res, jwtTokens)
    } catch (error) {
      if (error instanceof UnidentifiedException) {
        throw new UnauthorizedException(error.message)
      }
      this.logger.error(error)
      throw new InternalServerErrorException('Login failed')
    }
  }

  @Post('logout')
  async logout(
    @Req() req: AuthenticatedRequest,
    @Res({ passthrough: true }) res: Response
  ) {
    try {
      await this.authService.deleteRefreshToken(req.user.id)
      res.clearCookie('refresh_token', REFRESH_TOKEN_COOKIE_OPTIONS)
    } catch (error) {
      this.logger.error(error)
      throw new InternalServerErrorException()
    }
  }

  @AuthNotNeededIfOpenSpace()
  @Get('reissue')
  async reIssueJwtTokens(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ) {
    const refreshToken = req.cookies['refresh_token']
    if (!refreshToken) throw new UnauthorizedException('Invalid Token')

    try {
      const newJwtTokens = await this.authService.updateJwtTokens(refreshToken)
      this.setJwtResponse(res, newJwtTokens)
    } catch (error) {
      if (error instanceof InvalidJwtTokenException) {
        throw new UnauthorizedException(error.message)
      }
      this.logger.error(error)
      throw new InternalServerErrorException('Failed to reissue tokens')
    }
  }

  @AuthNotNeededIfOpenSpace()
  @Get('github')
  @UseGuards(AuthGuard('github'))
  async moveToGithubLogin() {
    /* 자동으로 github login page로 redirection */
  }

  /** github login page에서 로그인에 성공한 후 이 endpoint로 redirection */
  @AuthNotNeededIfOpenSpace()
  @Get('github-callback')
  @UseGuards(AuthGuard('github'))
  async githubLogin(
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request
  ) {
    try {
      const githubUser = req.user as GithubUser
      return await this.authService.githubLogin(res, githubUser)
    } catch (error) {
      if (error instanceof UnidentifiedException) {
        throw new UnauthorizedException(error.message)
      }
      this.logger.error(error)
      throw new InternalServerErrorException('Login failed')
    }
  }
}
