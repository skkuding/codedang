import { Injectable } from '@nestjs/common'
import { Group, UserGroup } from '@prisma/client'
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

  async getNonPrivateGroups(): Promise<UserGroupInterface[]> {
    //TODO: update number of members
    const groups = await (
      await this.prisma.group.findMany({
        where: {
          private: false
        },
        select: {
          created_by: {
            select: {
              username: true
            }
          },
          id: true,
          group_name: true,
          description: true
        }
      })
    ).filter((group) => group.id != 1)

    return groups
  }

  async getMyGroups(userId: number): Promise<Partial<UserGroup>[]> {
    //TODO: update number of members
    const groups = await this.prisma.userGroup.findMany({
      where: {
        user_id: userId,
        is_registered: true
      },
      select: {
        id: true,
        group: {
          select: {
            created_by: {
              select: {
                username: true
              }
            },
            group_name: true,
            description: true
          }
        }
      }
    })

    return groups
  }

  async joinGroupByInvt(
    userId: number,
    groupId: number,
    invitationCode: string
  ) {
    await this.prisma.group.findFirst({
      where: {
        id: groupId,
        invitation_code: invitationCode
      },
      rejectOnNotFound: () => new EntityNotExistException('group')
    })

    await this.prisma.userGroup.create({
      data: {
        user: {
          connect: { id: userId }
        },
        group: {
          connect: { id: groupId }
        }
      }
    })
  }

  async leaveGroup(userId: number, groupId: number) {
    const membershipId = await this.prisma.userGroup.findFirst({
      where: {
        user_id: userId,
        group_id: groupId,
        is_registered: true
      },
      select: {
        id: true
      },
      rejectOnNotFound: () => new EntityNotExistException('membership')
    })

    await this.prisma.userGroup.delete({
      where: {
        id: membershipId.id
      }
    })
  }

  async joinGroupById(userId: number, groupId: number) {
    await this.prisma.group.findUnique({
      where: {
        id: groupId
      },
      rejectOnNotFound: () => new EntityNotExistException('group')
    })

    await this.prisma.userGroup.create({
      data: {
        user: {
          connect: { id: userId }
        },
        group: {
          connect: { id: groupId }
        }
      }
    })
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
