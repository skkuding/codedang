import {
  CACHE_MANAGER,
  HttpException,
  Inject,
  Injectable
} from '@nestjs/common'
import { Cache } from 'cache-manager'
import { JwtService, JwtSignOptions, JwtVerifyOptions } from '@nestjs/jwt'
import { User } from '@prisma/client'
import { UserService } from 'src/user/user.service'
import { refreshTokenCacheKey } from '../common/cache/keys'

import {
  ACCESS_TOKEN_EXPIRATION_SEC,
  REFRESH_TOKEN_EXPIRATION_SEC,
  SECRET_KEY
} from './config/jwt.config'

import { JwtObject, JwtPayload } from './type/jwt.type'

// TODO: implement decrpyt logic. Errors related with decryption should be thrown here
function decryptPassword(password): string {
  return password
}

export function validatePassword(input, password): boolean {
  if (input === decryptPassword(password)) {
    return true
  }
  return false
}

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
  ) {}

  /**
   * TODO: TEST: findUniqueForLogin, validatePassword를 mocking,
   * */
  async validateUser(
    username: string,
    password: string
  ): Promise<Partial<User> | null> {
    const user = await this.userService.getUserCredential(username)
    // user가 없으면 예외처리? 아래 chaining 제거
    if (user?.password && validatePassword(password, user.password)) {
      const { password, ...result } = user
      return result
    }
    return null
  }

  // TODO: signToken, validatToken은 jwt constants랑 같이 묶을거 묶어서 따로 뺴기
  async signToken(payload: JwtPayload, options: JwtSignOptions = {}) {
    return await this.jwtService.signAsync(payload, options)
  }

  async issueTokens(username: string, userId: number) {
    const payload = { username, userId }
    const accessToken = await this.signToken(payload, {
      expiresIn: ACCESS_TOKEN_EXPIRATION_SEC
    })
    const refreshToken = await this.signToken(payload, {
      expiresIn: REFRESH_TOKEN_EXPIRATION_SEC
    })

    await this.cacheManager.set(refreshTokenCacheKey(userId), refreshToken, {
      ttl: REFRESH_TOKEN_EXPIRATION_SEC
    })

    return { accessToken, refreshToken }
  }

  async validateToken(
    token: string,
    options: JwtVerifyOptions = {}
  ): Promise<JwtObject> {
    const jwtVerifyOptions = { secret: SECRET_KEY, ...options }
    try {
      return await this.jwtService.verifyAsync(token, jwtVerifyOptions)
    } catch (error) {
      // TODO: enable logging
      throw new HttpException(error.message, 401)
    }
  }

  async updateAccessToken(
    accessToken: string,
    refreshToken: string
  ): Promise<string> {
    const decodedAccessToken = await this.validateToken(accessToken, {
      ignoreExpiration: true
    })
    const decodedRefreshToken = await this.validateToken(refreshToken)
    const cachedRefreshToken = await this.cacheManager.get(
      refreshTokenCacheKey(decodedRefreshToken.userId)
    )

    if (
      decodedAccessToken.username !== decodedRefreshToken.username ||
      cachedRefreshToken !== refreshToken
    ) {
      throw new HttpException('Invalid Token', 401)
    }

    const { iat, exp, ...payload } = decodedRefreshToken
    return await this.signToken(payload, {
      expiresIn: ACCESS_TOKEN_EXPIRATION_SEC
    })
  }
}
