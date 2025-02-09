import {
  Controller,
  Body,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
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
import { AuthService } from './auth.service'
import { LoginUserDto } from './dto/login-user.dto'
import type { GithubUser, KakaoUser } from './interface/social-user.interface'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  setJwtResponse = (res: Response, jwtTokens: JwtTokens) => {
    res.setHeader('authorization', `Bearer ${jwtTokens.accessToken}`)
    res.cookie(
      'refresh_token',
      jwtTokens.refreshToken,
      REFRESH_TOKEN_COOKIE_OPTIONS
    )
  }

  /**
   * 유저가 로그인할 때 호출됨. JWT 토큰을 발급하고 리스폰스에 설정함.
   * @param {LoginUserDto} loginUserDto - 로그인 유저의 정보
   * @param {Response} res - 리스폰스 객체
   */
  @AuthNotNeededIfOpenSpace()
  @Post('login')
  async login(
    @Body() loginUserDto: LoginUserDto,
    @Res({ passthrough: true }) res: Response
  ) {
    const jwtTokens = await this.authService.issueJwtTokens(loginUserDto)
    this.setJwtResponse(res, jwtTokens)
  }

  /**
   * 유저가 로그아웃할 때 호출됨. refreshToken을 제거하고 쿠키를 삭제.
   * @param {AuthenticatedRequest} req - 인증된 리퀘스트 객체
   * @param {Response} res - 리스폰스 객체
   * @returns {Promise<void>}
   */
  @Post('logout')
  async logout(
    @Req() req: AuthenticatedRequest,
    @Res({ passthrough: true }) res: Response
  ) {
    const refreshToken = req.cookies['refresh_token']
    // FIX ME: refreshToken이 없을 때 에러를 던지는 것이 맞는지 확인
    // 일단은 refreshToken이 없을 때는 무시하도록 함
    if (!refreshToken) return

    await this.authService.deleteRefreshToken(req.user.id, refreshToken)
    res.clearCookie('refresh_token', REFRESH_TOKEN_COOKIE_OPTIONS)
  }

  /**
   * refreshToken을 기반으로 새로운 JWT 토큰을 재발급.
   * @param {Request} req
   * @param {Response} res
   * @returns {Promise<void>}
   * @throws {UnauthorizedException} refreshToken이 없거나 유효하지 않은 경우 예외 던짐.
   */
  @AuthNotNeededIfOpenSpace()
  @Get('reissue')
  async reIssueJwtTokens(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ) {
    const refreshToken = req.cookies['refresh_token']
    if (!refreshToken) throw new UnauthorizedException('Invalid Token')

    const newJwtTokens = await this.authService.updateJwtTokens(refreshToken)
    this.setJwtResponse(res, newJwtTokens)
  }

  /**
   * GitHub 로그인 페이지로 이동.
   */
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
    const githubUser = req.user as GithubUser
    return await this.authService.githubLogin(res, githubUser)
  }

  /** Kakao Login page로 이동 */
  @AuthNotNeededIfOpenSpace()
  @Get('kakao')
  @UseGuards(AuthGuard('kakao'))
  async moveToKakaoLogin() {
    /* 자동으로 kakao login page로 redirection */
  }

  /** Kakao login page에서 로그인에 성공한 후 이 endpoint로 redirection */
  @AuthNotNeededIfOpenSpace()
  @Get('kakao-callback')
  @UseGuards(AuthGuard('kakao'))
  async kakaoLogin(
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request
  ) {
    const kakaoUser = req.user as KakaoUser
    return await this.authService.kakaoLogin(res, kakaoUser)
  }
}
