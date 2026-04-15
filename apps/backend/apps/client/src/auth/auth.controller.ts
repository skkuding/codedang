import {
  Controller,
  Body,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
  Delete,
  Param,
  ParseEnumPipe
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { Provider } from '@prisma/client'
import { Request, Response } from 'express'
import {
  AuthenticatedRequest,
  AuthNotNeededIfPublic,
  type JwtTokens
} from '@libs/auth'
import { REFRESH_TOKEN_COOKIE_OPTIONS } from '@libs/constants'
import { AuthService } from './auth.service'
import { LoginUserDto } from './dto/login-user.dto'
import { SocialLinkDto } from './dto/social-link.dto'
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
  @AuthNotNeededIfPublic()
  @Post('login')
  async login(
    @Body() loginUserDto: LoginUserDto,
    @Res({ passthrough: true }) res: Response
  ) {
    const jwtTokens = await this.authService.issueJwtTokens(loginUserDto)
    this.setJwtResponse(res, jwtTokens)
  }

  /**
   * 로그인된 유저의 계정에 소셜 계정을 연동함.
   * @param {SocialLinkDto} socialLinkDto - 소셜 로그인 콜백에서 발급된 oauthToken
   * @param {AuthenticatedRequest} req - 인증된 리퀘스트 객체
   * @throws {InvalidJwtTokenException} oauthToken이 유효하지 않거나 만료된 경우
   * @throws {DuplicateFoundException} 해당 provider가 이미 연동되어 있거나, 해당 소셜 계정이 다른 유저에게 이미 연동된 경우
   */
  @Post('social-link')
  async socialLink(
    @Body() socialLinkDto: SocialLinkDto,
    @Req() req: AuthenticatedRequest
  ) {
    await this.authService.socialLink(req.user.id, socialLinkDto)
  }

  /**
   * 로그인된 유저의 계정에서 소셜 계정 연동을 해제함.
   * Kakao의 경우 Kakao Admin API를 통해 서버 측에서도 연동 해제 처리함.
   * @param {AuthenticatedRequest} req - 인증된 리퀘스트 객체
   * @param {Provider} provider - 연동 해제할 소셜 플랫폼
   * @throws {EntityNotExistException} 해당 provider가 연동되어 있지 않은 경우
   */
  @Delete('social-link/:provider')
  async socialUnlink(
    @Req() req: AuthenticatedRequest,
    // NestJS Swagger의 Prisma Enum 순환 참조 에러 방지를 위해 string 타입 사용
    @Param('provider', new ParseEnumPipe(Provider)) provider: string
  ) {
    await this.authService.socialUnlink(req.user.id, provider as Provider)
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
  @AuthNotNeededIfPublic()
  @Get('reissue')
  async reIssueJwtTokens(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ) {
    const refreshToken = req.cookies['refresh_token']
    if (!refreshToken) throw new UnauthorizedException('This is Invalid Token')

    const newJwtTokens = await this.authService.updateJwtTokens(refreshToken)
    this.setJwtResponse(res, newJwtTokens)
  }

  /**
   * GitHub 로그인 페이지로 이동.
   */
  @AuthNotNeededIfPublic()
  @Get('github')
  @UseGuards(AuthGuard('github'))
  async moveToGithubLogin() {
    /* 자동으로 github login page로 redirection */
  }

  /** github login page에서 로그인에 성공한 후 이 endpoint로 redirection */
  @AuthNotNeededIfPublic()
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
  @AuthNotNeededIfPublic()
  @Get('kakao')
  @UseGuards(AuthGuard('kakao'))
  async moveToKakaoLogin() {
    /* 자동으로 kakao login page로 redirection */
  }

  /** Kakao login page에서 로그인에 성공한 후 이 endpoint로 redirection */
  @AuthNotNeededIfPublic()
  @Get('kakao-callback')
  @UseGuards(AuthGuard('kakao'))
  async kakaoLogin(
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request
  ) {
    const kakaoUser = req.user as KakaoUser
    const result = await this.authService.kakaoLogin(kakaoUser)

    if ('signUpUrl' in result) return result

    this.setJwtResponse(res, result.jwtTokens)
  }
}
