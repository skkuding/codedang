import { Injectable } from '@nestjs/common'
import type { User } from '@prisma/client'
import { verify } from 'argon2'

@Injectable()
export class JwtAuthService {
  async isValidUser(user: User, password: string) {
    if (!user || !(await verify(user.password, password))) {
      return false
    }
    return true
  }
}
