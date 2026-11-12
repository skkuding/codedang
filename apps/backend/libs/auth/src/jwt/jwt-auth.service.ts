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

  // Keeps login timing for unknown users close to that of wrong passwords.
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
