import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { User } from '@prisma/client'
import { UserService } from 'src/user/user.service'
import { Cache } from 'cache-manager'

import { refreshTokenCacheKey } from '../common/cache/keys'
import {
  InvalidUserException,
  InvalidJwtTokenException
} from '../common/exception/business.exception'
import { validate } from '../common/hash'

import {
  ACCESS_TOKEN_EXPIRATION_SEC,
  REFRESH_TOKEN_EXPIRATION_SEC
} from './constants/jwt.constants'
import { LoginUserDto } from './dto/login-user.dto'
import { JwtPayload, JwtTokens } from './interface/jwt.interface'

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
  ) {}

  async issueJwtTokens(loginUserDto: LoginUserDto): Promise<JwtTokens> {
    const user = await this.userService.getUserCredential(loginUserDto.username)
    if (!this.validateUser(user, loginUserDto.password)) {
      throw new InvalidUserException('Incorrect username or password')
    }
    return await this.createJwtTokens(user.id, user.username)
  }

  async validateUser(user: User, password: string) {
    if (!user || !(await validate(user.password, password))) {
      return false
    }
    return true
  }

  async updateJwtTokens(refreshToken: string): Promise<JwtTokens> {
    let decodedRefreshToken
    try {
      decodedRefreshToken = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.config.get('JWT_SECRET')
      })
    } catch (error) {
      throw new InvalidJwtTokenException(error.message)
    }

    const cachedRefreshToken = await this.cacheManager.get(
      refreshTokenCacheKey(decodedRefreshToken.userId)
    )

    if (cachedRefreshToken !== refreshToken) {
      throw new InvalidJwtTokenException('unidentified refresh token')
    }

    return await this.createJwtTokens(
      decodedRefreshToken.userId,
      decodedRefreshToken.username
    )
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

  async deleteRefreshToken(userId: number) {
    return await this.cacheManager.del(refreshTokenCacheKey(userId))
  }
}
