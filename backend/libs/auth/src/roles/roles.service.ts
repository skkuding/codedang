import { Injectable } from '@nestjs/common'
import type { User } from '@prisma/client'
import { EntityNotExistException } from '@libs/exception'
import { PrismaService } from '@libs/prisma'

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserRole(userId: number): Promise<Partial<User>> {
    return await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        role: true
      },
      rejectOnNotFound: () => new EntityNotExistException('user')
    })
  }
}
