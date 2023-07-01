import { Injectable } from '@nestjs/common'
import type { AuthenticatedUser } from '@libs/auth'
import { ForbiddenAccessException } from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import { UserService } from '@admin/user/user.service'
import type { CreateGroupInput, UpdateGroupInput } from './model/group.input'

@Injectable()
export class GroupService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UserService
  ) {}

  async createGroup(input: CreateGroupInput, userId: number) {
    const group = await this.prisma.group.create({
      data: {
        groupName: input.groupName,
        description: input.description,
        config: JSON.stringify(input.config),
        createdBy: {
          connect: { id: userId }
        }
      }
    })

    await this.prisma.userGroup.create({
      data: {
        user: {
          connect: { id: userId }
        },
        group: {
          connect: { id: group.id }
        },
        isGroupLeader: true
      }
    })
    return group
  }

  async getGroups() {
    return (
      await this.prisma.group.findMany({
        select: {
          id: true,
          groupName: true,
          description: true,
          userGroup: true
        }
      })
    ).map((data) => {
      const { userGroup, ...group } = data
      return {
        ...group,
        memberNum: userGroup.length
      }
    })
  }

  async getGroup(id: number) {
    const { userGroup, ...group } = await this.prisma.group.findUnique({
      where: {
        id
      },
      include: {
        userGroup: true
      }
    })

    const memberNum = userGroup.length
    const managers = (
      await this.userService.getUsers({
        id: {
          in: userGroup
            .filter((member) => member.isGroupLeader)
            .map((manager) => manager.userId)
        }
      })
    ).map((manager) => manager.username)

    return {
      ...group,
      memberNum,
      managers
    }
  }

  async updateGroup(id: number, input: UpdateGroupInput) {
    return await this.prisma.group.update({
      where: {
        id
      },
      data: {
        groupName: input.groupName,
        description: input.description,
        config: JSON.stringify(input.config)
      }
    })
  }

  async deleteGroup(id: number, user: AuthenticatedUser) {
    if (!user.isAdmin() && !user.isSuperAdmin()) {
      const group = await this.prisma.group.findUnique({
        where: { id },
        select: {
          createdById: true
        }
      })
      if (group.createdById !== user.id) {
        throw new ForbiddenAccessException(
          'If not admin, only creator can delete a group'
        )
      }
    }

    await this.prisma.userGroup.deleteMany({
      where: {
        groupId: id
      }
    })
    return 'Group is successfully deleted'
  }
}
