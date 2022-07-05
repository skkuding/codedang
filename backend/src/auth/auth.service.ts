import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common'
import { JwtService, JwtVerifyOptions } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { User } from '@prisma/client'
import { UserService } from 'src/user/user.service'
import { Cache } from 'cache-manager'

import { refreshTokenCacheKey } from '../common/cache/keys'
import {
  PasswordNotMatchException,
  InvalidJwtTokenException
} from '../common/exception/business.exception'
import { validate } from '../common/hash'

import {
  ACCESS_TOKEN_EXPIRATION_SEC,
  REFRESH_TOKEN_EXPIRATION_SEC
} from './constants/jwt.constants'
import { LoginUserDto } from './dto/login-user.dto'
import { JwtObject, JwtPayload, JwtTokens } from './interface/jwt.interface'

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
    return await this.createJwtTokens(user.id, user.username)
  }

  async validateUser(loginUserDto: LoginUserDto): Promise<User> {
    const user = await this.userService.getUserCredential(loginUserDto.username)
    if (!user || !(await validate(loginUserDto.password, user.password))) {
      throw new PasswordNotMatchException('Password does not match')
    }
    return user
  }

  async createJwtTokens(userId: number, username: string): Promise<JwtTokens> {
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

  async updateJwtTokens(refreshToken: string): Promise<JwtTokens> {
    const decodedRefreshToken = await this.validateJwtToken(refreshToken)
    const cachedRefreshToken = await this.cacheManager.get(
      refreshTokenCacheKey(decodedRefreshToken.userId)
    )

    if (cachedRefreshToken !== refreshToken) {
      throw new InvalidJwtTokenException('Invalid Token')
    }

    return await this.createJwtTokens(
      decodedRefreshToken.userId,
      decodedRefreshToken.username
    )
  }

  async validateJwtToken(
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

  async deleteRefreshToken(userId: number) {
    return await this.cacheManager.del(refreshTokenCacheKey(userId))
  }
}
