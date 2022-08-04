import { Injectable } from '@nestjs/common'
import { UserGroup } from '@prisma/client'
import {
  EntityNotExistException,
  InvalidUserException
} from 'src/common/exception/business.exception'
import { PrismaService } from 'src/prisma/prisma.service'
import { UserGroupData } from './interface/user-group-data.interface'

function returnIsNotAllowed(userId: number, groupId: number): string {
  return `Group ${groupId} is not allowed to User ${userId}`
}

@Injectable()
export class GroupService {
  constructor(private readonly prisma: PrismaService) {}

  async getGroupById(userId: number, groupId: number) {
    const group = await this.prisma.group.findUnique({
      where: {
        id: groupId
      },
      select: {
        group_name: true,
        description: true
      },
      rejectOnNotFound: () => new EntityNotExistException('group')
    })

    await this.prisma.userGroup.findFirst({
      where: {
        user_id: userId,
        group_id: groupId,
        is_registered: true
      },
      rejectOnNotFound: () =>
        new InvalidUserException(returnIsNotAllowed(userId, groupId))
    })

    return group
  }

  async getUserGroupMembershipInfo(userId: number, groupId: number) {
    return await this.prisma.userGroup.findFirst({
      where: {
        userId: userId,
        groupId: groupId
      },
      select: {
        isRegistered: true,
        isGroupLeader: true
      }
    })
  }

  async getUserGroupLeaderList(userId: number): Promise<number[]> {
    return (
      await this.prisma.userGroup.findMany({
        where: {
          userId: userId,
          isRegistered: true,
          isGroupLeader: true
        },
        select: {
          groupId: true
        }
      })
    ).map((group) => group.groupId)
  }

  async createUserGroup(userGroupData: UserGroupData): Promise<UserGroup> {
    return await this.prisma.userGroup.create({
      data: {
        user: {
          connect: { id: userGroupData.userId }
        },
        group: {
          connect: { id: userGroupData.groupId }
        },
        isRegistered: userGroupData.isRegistered,
        isGroupLeader: userGroupData.isGroupLeader
      }
    })
  }
}
