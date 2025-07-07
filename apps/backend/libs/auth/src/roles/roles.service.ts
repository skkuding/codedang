import { Injectable } from '@nestjs/common'
import type { ContestRole } from '@prisma/client'
import type { PrismaService } from '@libs/prisma'

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserRole(userId: number) {
    return await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: {
        role: true,
        canCreateCourse: true,
        canCreateContest: true
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

  async findLeaderGroup(userId: number) {
    return await this.prisma.userGroup.findFirst({
      where: {
        userId,
        isGroupLeader: true
      },
      select: {
        groupId: true
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

  async findUserContestByRole(userId: number, roles: ContestRole[]) {
    return await this.prisma.userContest.findFirst({
      where: {
        userId,
        role: {
          in: roles
        }
      },
      select: {
        id: true
      }
    })
  }
}
