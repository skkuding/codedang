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
    return await this.prisma.userGroup.findUnique({
      where: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        userId_groupId: { userId, groupId }
      },
      select: {
        isGroupLeader: true
      }
    })
  }

  async getUserContest(userId: number, contestId: number) {
    return await this.prisma.userContest.findFirst({
      where: {
        userId,
        contestId
      },
      select: {
        role: true
      }
    })
  }
}
