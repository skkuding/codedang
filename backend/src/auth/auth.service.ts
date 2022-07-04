import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common'
import { JwtService, JwtVerifyOptions } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { User } from '@prisma/client'
import { UserService } from 'src/user/user.service'
import { Cache } from 'cache-manager'

import {
  jwtBlackListCacheKey,
  refreshTokenCacheKey
} from '../common/cache/keys'
import {
  PasswordNotMatchException,
  InvalidJwtTokenException
} from '../common/exception/business.exception'
import { validate } from '../common/hash'

import {
  ACCESS_TOKEN_EXPIRATION_SEC,
  REFRESH_TOKEN_EXPIRATION_SEC
} from './config/jwt.config'
import { LoginUserDto } from './dto/login-user.dto'
import { JwtObject, JwtPayload, JwtTokens } from './type/jwt.type'

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
  ) {}

  async issueJwtTokens(loginUserDto: LoginUserDto): Promise<JwtTokens> {
    const user = await this.validateUser(loginUserDto)
    return await this.createTokens(user.id, user.username)
  }

  async validateUser(loginUserDto: LoginUserDto): Promise<User> {
    const user = await this.userService.getUserCredential(loginUserDto.username)
    if (!user || !(await validate(loginUserDto.password, user.password))) {
      throw new PasswordNotMatchException('Password does not match')
    }
    return user
  }

  async createTokens(userId: number, username: string): Promise<JwtTokens> {
    const payload: JwtPayload = { userId, username }
    const accessToken = await this.jwtService.signAsync({
      ...payload,
      expiresIn: ACCESS_TOKEN_EXPIRATION_SEC
    })
    const refreshToken = await this.jwtService.signAsync({
      ...payload,
      expiresIn: REFRESH_TOKEN_EXPIRATION_SEC
    })

    await this.cacheManager.set(refreshTokenCacheKey(userId), refreshToken, {
      ttl: REFRESH_TOKEN_EXPIRATION_SEC
    })

    return { accessToken, refreshToken }
  }

  async updateAccessToken(jwtTokens: JwtTokens): Promise<string> {
    const decodedAccessToken = await this.validateToken(jwtTokens.accessToken, {
      ignoreExpiration: true
    })
    const decodedRefreshToken = await this.validateToken(jwtTokens.refreshToken)
    const cachedRefreshToken = await this.cacheManager.get(
      refreshTokenCacheKey(decodedRefreshToken.userId)
    )
    //TODO: 기존의 access token은 blacklist에 추가

    if (
      decodedAccessToken.username !== decodedRefreshToken.username ||
      cachedRefreshToken !== jwtTokens.refreshToken
    ) {
      throw new InvalidJwtTokenException('Invalid Token')
    }

    const payload: JwtPayload = (({ userId, username }) => ({
      userId,
      username
    }))(decodedRefreshToken)
    return await this.jwtService.signAsync({
      ...payload,
      expiresIn: ACCESS_TOKEN_EXPIRATION_SEC
    })
  }

  async validateToken(
    token: string,
    options: JwtVerifyOptions = {}
  ): Promise<JwtObject> {
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

  async disableJwtTokens(userId: number, accessToken: string) {
    await this.cacheManager.del(refreshTokenCacheKey(userId))
    await this.cacheManager.set(
      jwtBlackListCacheKey(accessToken),
      accessToken,
      { ttl: 180 }
      //TODO: ttl설정 변경
    )
  }

  async isUnavailableToken(token: string): Promise<boolean> {
    //TODO: implement
    return false
  }
}
