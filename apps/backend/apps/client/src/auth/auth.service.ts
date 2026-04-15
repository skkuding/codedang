import { HttpService } from '@nestjs/axios'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Inject, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService, type JwtVerifyOptions } from '@nestjs/jwt'
import { Role, type Provider } from '@prisma/client'
import { Cache } from 'cache-manager'
import type { Response } from 'express'
import { JwtAuthService, type JwtPayload } from '@libs/auth'
import { refreshTokenCacheKey } from '@libs/cache'
import {
  ACCESS_TOKEN_EXPIRE_TIME,
  OAUTH_TOKEN_EXPIRE_TIME,
  REFRESH_TOKEN_COOKIE_OPTIONS,
  REFRESH_TOKEN_EXPIRE_TIME
} from '@libs/constants'
import {
  DuplicateFoundException,
  EntityNotExistException,
  InvalidJwtTokenException,
  UnidentifiedException
} from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import { UserService } from '@client/user/user.service'
import type { LoginUserDto } from './dto/login-user.dto'
import type { SocialLinkDto } from './dto/social-link.dto'
import type {
  GithubUser,
  KakaoUser,
  OAuthTokenPayload
} from './interface/social-user.interface'

@Injectable()
export class AuthService {
  constructor(
    private readonly config: ConfigService,
    private readonly jwtService: JwtService,
    private readonly jwtAuthService: JwtAuthService,
    private readonly userService: UserService,
    private readonly prisma: PrismaService,
    private readonly httpService: HttpService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
  ) {}

  async issueJwtTokens(loginUserDto: LoginUserDto, isSocialUser?: boolean) {
    const user = await this.userService.getUserCredential(loginUserDto.username)
    if (!user) {
      throw new UnidentifiedException('username or password')
    }

    const isValidUser = await this.jwtAuthService.isValidUser(
      user,
      loginUserDto.password,
      isSocialUser
    )

    if (!isValidUser) {
      throw new UnidentifiedException('username or password')
    }

    const isValidRole =
      user.role && Object.values(Role).includes(user.role as Role)

    if (!isValidRole) {
      throw new UnidentifiedException('invalid or empty role')
    }

    await this.userService.updateLastLogin(user.username)

    return await this.createJwtTokens(user.id, user.username, user.role)
  }

  async updateJwtTokens(refreshToken: string) {
    const { userId, username, userRole } =
      await this.verifyJwtToken(refreshToken)
    if (!(await this.isValidRefreshToken(refreshToken, userId))) {
      throw new InvalidJwtTokenException('Unidentified refresh token')
    }
    return await this.createJwtTokens(userId, username, userRole)
  }

  async verifyJwtToken(token: string, options: JwtVerifyOptions = {}) {
    const jwtVerifyOptions = {
      secret: this.config.get('JWT_SECRET'),
      ...options
    }
    try {
      return await this.jwtService.verifyAsync(token, jwtVerifyOptions)
    } catch (error) {
      throw new InvalidJwtTokenException(error.message)
    }
  }

  async isValidRefreshToken(refreshToken: string, userId: number) {
    const cachedRefreshToken = await this.cacheManager.get(
      refreshTokenCacheKey(userId, refreshToken)
    )
    if (cachedRefreshToken !== 1) {
      return false
    }
    return true
  }

  async createJwtTokens(userId: number, username: string, userRole: string) {
    const payload: JwtPayload = { userId, username, userRole }
    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: ACCESS_TOKEN_EXPIRE_TIME
    })
    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: REFRESH_TOKEN_EXPIRE_TIME
    })

    // userId: refreshToken을 key로 cache에 저장
    await this.cacheManager.set(
      refreshTokenCacheKey(userId, refreshToken),
      1,
      REFRESH_TOKEN_EXPIRE_TIME * 1000 // milliseconds
    )

    return { accessToken, refreshToken }
  }

  async deleteRefreshToken(userId: number, refreshToken: string) {
    return await this.cacheManager.del(
      refreshTokenCacheKey(userId, refreshToken)
    )
  }

  async socialLink(userId: number, dto: SocialLinkDto) {
    const { oauthId, provider } = await this.verifyOAuthToken(dto.oauthToken)

    const existingProvider = await this.prisma.userOAuth.findUnique({
      where: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        userId_provider: {
          userId,
          provider
        }
      }
    })
    if (existingProvider)
      throw new DuplicateFoundException(`${provider} OAuth provider`)

    const existingOAuth = await this.prisma.userOAuth.findUnique({
      where: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        id_provider: {
          id: oauthId,
          provider
        }
      }
    })
    if (existingOAuth)
      throw new DuplicateFoundException(`${provider} OAuth account`)

    await this.userService.createUserOAuth(userId, provider, oauthId)
  }

  async socialUnlink(userId: number, provider: Provider) {
    const userOAuth = await this.prisma.userOAuth.findUnique({
      where: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        userId_provider: {
          userId,
          provider
        }
      }
    })

    if (!userOAuth)
      throw new EntityNotExistException(`${provider} OAuth provider`)

    if (provider === 'kakao') {
      await this.httpService.axiosRef({
        url: 'https://kapi.kakao.com/v1/user/unlink',
        method: 'POST',
        headers: {
          Authorization: `KakaoAK ${this.config.getOrThrow('KAKAO_ADMIN_KEY')}`,
          // eslint-disable-next-line @typescript-eslint/naming-convention
          'Content-Type': `application/x-www-form-urlencoded;charset=utf-8`
        },

        data: new URLSearchParams({
          // eslint-disable-next-line @typescript-eslint/naming-convention
          target_id_type: 'user_id',
          // eslint-disable-next-line @typescript-eslint/naming-convention
          target_id: userOAuth.id
        })
      })
    }

    await this.prisma.userOAuth.delete({
      where: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        userId_provider: {
          userId,
          provider
        }
      }
    })
  }

  async githubLogin(res: Response, githubUser: GithubUser) {
    const { githubId } = githubUser

    const userOAuth = await this.prisma.userOAuth.findFirst({
      where: {
        id: githubId.toString(),
        provider: 'github'
      }
    })

    if (!userOAuth) {
      // 소셜 회원가입 페이지 url 전달
      // TODO: 소셜 회원가입 페이지 url 확정되면 여기에 삽입
      return {
        signUpUrl: `https://codedang.com/social-signup?provider=github&id=${githubUser.githubId}}&email=${githubUser.email}`
      }
    }

    const user = await this.prisma.user.findFirst({
      where: {
        id: userOAuth.userId
      }
    })

    if (!user) {
      throw new UnidentifiedException('user')
    }

    const jwtTokens = await this.issueJwtTokens(
      {
        username: user.username,
        password: user.password
      },
      true
    )

    res.setHeader('authorization', `Bearer ${jwtTokens.accessToken}`)
    res.cookie(
      'refresh_token',
      jwtTokens.refreshToken,
      REFRESH_TOKEN_COOKIE_OPTIONS
    )
  }

  async kakaoLogin(kakaoUser: KakaoUser) {
    const { kakaoId } = kakaoUser

    const userOAuth = await this.prisma.userOAuth.findUnique({
      where: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        id_provider: {
          id: kakaoId,
          provider: 'kakao'
        }
      }
    })

    if (!userOAuth) {
      const oauthToken = await this.jwtService.signAsync(
        { oauthId: kakaoId, provider: 'kakao' } satisfies OAuthTokenPayload,
        { expiresIn: OAUTH_TOKEN_EXPIRE_TIME }
      )
      return {
        signUpUrl: `https://codedang.com/sign-up?oauthToken=${oauthToken}`,
        oauthToken
      }
    }

    const user = await this.prisma.user.findUnique({
      where: {
        id: userOAuth.userId
      }
    })

    if (!user) {
      throw new UnidentifiedException('user')
    }

    await this.userService.updateLastLogin(user.username)
    const jwtTokens = await this.createJwtTokens(
      user.id,
      user.username,
      user.role
    )

    return { jwtTokens }
  }

  private async verifyOAuthToken(token: string) {
    try {
      return await this.jwtService.verifyAsync<OAuthTokenPayload>(token, {
        secret: this.config.get('JWT_SECRET')
      })
    } catch (error) {
      throw new InvalidJwtTokenException(error.message)
    }
  }
}
