import { Injectable } from '@nestjs/common'
import type { User } from '@prisma/client'
import { hash, verify } from 'argon2'
import { randomBytes } from 'crypto'
import { ARGON2_HASH_OPTION } from '@libs/constants'

@Injectable()
export class JwtAuthService {
  private readonly dummyHash = hash(
    randomBytes(32).toString('hex'),
    ARGON2_HASH_OPTION
  )

  /**
   * 존재하지 않는 사용자의 로그인 요청도 같은 시간이 걸리도록 Argon2 검증을 수행합니다.
   *
   * @param {string} password 입력된 비밀번호
   */
  async verifyAgainstDummy(password: string) {
    await verify(await this.dummyHash, password)
  }

  async isValidUser(user: User, password: string, isSocialUser?: boolean) {
    if (isSocialUser) {
      return true
    }

    if (!user || !(await verify(user.password, password))) {
      return false
    }
    return true
  }
}
