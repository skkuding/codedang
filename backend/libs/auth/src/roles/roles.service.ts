import { Injectable } from '@nestjs/common'
import { PrismaService } from '@libs/prisma'

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserRole(userId: number) {
    return await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: {
        role: true
      }
    })
  }

  async getUserGroup(userId: number, groupId: number) {
    return await this.prisma.userGroup.findFirst({
      where: {
        userId,
        groupId
      },
      select: {
        isGroupLeader: true
      }
    })
  }
}
