import { Injectable } from '@nestjs/common'
import { Group } from '@prisma/client'
import { UserGroup } from '@prisma/client'
import {
  EntityNotExistException,
  InvalidUserException
} from 'src/common/exception/business.exception'
import { PrismaService } from 'src/prisma/prisma.service'
import { UserGroupData } from './interface/user-group-data.interface'
import { UserGroupInterface } from './interface/user-group.interface'

function returnIsNotAllowed(userId: number, groupId: number): string {
  return `Group ${groupId} is not allowed to User ${userId}`
}

@Injectable()
export class GroupService {
  constructor(private readonly prisma: PrismaService) {}

  async getGroup(userId: number, groupId: number): Promise<Partial<Group>> {
    const group = await this.prisma.group.findUnique({
      where: {
        id: groupId
      },
      select: {
        id: true,
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

  async getGroupJoinById(
    userId: number,
    groupId: number
  ): Promise<UserGroupInterface> {
    const group = await this.prisma.group.findFirst({
      where: {
        id: groupId,
        private: false
      },
      select: {
        id: true,
        group_name: true,
        description: true
      },
      rejectOnNotFound: () => new EntityNotExistException('group')
    })

    const groupMemberNum = await this.prisma.userGroup.count({
      where: {
        group_id: groupId,
        is_registered: true
      }
    })

    return {
      ...group,
      memberNum: groupMemberNum
    }
  }

  async getGroupJoinByInvt(
    userId: number,
    invitationCode: string
  ): Promise<UserGroupInterface> {
    const group = await this.prisma.group.findFirst({
      where: {
        invitation_code: invitationCode,
        private: true
      },
      select: {
        id: true,
        group_name: true,
        description: true
      },
      rejectOnNotFound: () => new EntityNotExistException('group')
    })

    const groupMemberNum = await this.prisma.userGroup.count({
      where: {
        group_id: group.id,
        is_registered: true
      }
    })

    return {
      ...group,
      memberNum: groupMemberNum
    }
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
