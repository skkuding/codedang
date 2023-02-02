/* eslint-disable */
import { Injectable } from '@nestjs/common'
import { Group, UserGroup } from '@prisma/client'
import {
  EntityNotExistException,
  InvalidUserException
} from 'src/common/exception/business.exception'
import { PrismaService } from 'src/prisma/prisma.service'
import { UserGroupData } from './interface/user-group-data.interface'
import { Membership } from './interface/membership.interface'
import { UserGroupInterface } from './interface/user-group.interface'

function returnIsNotAllowed(userId: number, groupId: number): string {
  return `Group ${groupId} is not allowed to User ${userId}`
}

@Injectable()
export class GroupService {
  constructor(private readonly prisma: PrismaService) {}

  async getGroup(userId: number, groupId: number): Promise<Partial<Group>> {
    await this.prisma.userGroup.findFirst({
      where: {
        userId: userId,
        groupId: groupId,
        isRegistered: true
      },
      rejectOnNotFound: () =>
        new InvalidUserException(returnIsNotAllowed(userId, groupId))
    })

    const group = await this.prisma.group.findUnique({
      where: {
        id: groupId
      },
      select: {
        id: true,
        groupName: true,
        description: true
      },
      rejectOnNotFound: () => new EntityNotExistException('group')
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
        config: {
          path: ['allowJoinFromSearch'],
          equals: true
        }
      },
      select: {
        id: true,
        groupName: true,
        description: true,
        userGroup: true,
        createdBy: {
          select: {
            userProfile: {
              select: {
                realName: true
              }
            }
          }
        }
      },
      rejectOnNotFound: () => new EntityNotExistException('group')
    })

    const groupLeaders = (
      await this.prisma.userGroup.findMany({
        where: {
          groupId: groupId,
          isRegistered: true,
          isGroupLeader: true
        },
        select: {
          user: {
            select: {
              userProfile: {
                select: {
                  realName: true
                }
              }
            }
          }
        }
      })
    ).map((leader) => leader.user.userProfile.realName)

    return {
      ...group,
      memberNum: group.userGroup.filter((member) => member.isRegistered).length,
      leaders: groupLeaders
    }
  }

  async getGroupLeaders(
    userId: number,
    groupId: number
  ): Promise<Membership[]> {
    await this.prisma.userGroup.findFirst({
      where: {
        userId: userId,
        groupId: groupId,
        isRegistered: true
      },
      rejectOnNotFound: () =>
        new InvalidUserException(returnIsNotAllowed(userId, groupId))
    })

    const leaders = await this.prisma.userGroup.findMany({
      where: {
        groupId: groupId,
        isRegistered: true,
        isGroupLeader: true
      },
      select: {
        id: true,
        user: {
          select: {
            userProfile: {
              select: {
                realName: true
              }
            }
          }
        },
        isGroupLeader: true
      }
    })

    return leaders
  }

  async getGroupMembers(
    userId: number,
    groupId: number
  ): Promise<Membership[]> {
    await this.prisma.userGroup.findFirst({
      where: {
        userId: userId,
        groupId: groupId,
        isRegistered: true
      },
      rejectOnNotFound: () =>
        new InvalidUserException(returnIsNotAllowed(userId, groupId))
    })

    const members = await this.prisma.userGroup.findMany({
      where: {
        groupId: groupId,
        isRegistered: true,
        isGroupLeader: false
      },
      select: {
        id: true,
        user: {
          select: {
            userProfile: {
              select: {
                realName: true
              }
            }
          }
        },
        isGroupLeader: true
      }
    })

    return members
  }

  async getGroups(): Promise<UserGroupInterface[]> {
    const groups = (
      await this.prisma.group.findMany({
        where: {
          config: {
            path: ['showOnList'],
            equals: true
          }
        },
        select: {
          createdBy: {
            select: {
              userProfile: {
                select: {
                  realName: true
                }
              }
            }
          },
          id: true,
          groupName: true,
          description: true,
          userGroup: true
        }
      })
    )
      .filter((group) => group.id != 1)
      .map((group) => {
        return {
          ...group,
          memberNum: group.userGroup.filter((member) => member.isRegistered)
            .length
        }
      })

    return groups
  }

  async getJoinedGroups(userId: number): Promise<UserGroupInterface[]> {
    const groupIds = (
      await this.prisma.userGroup.findMany({
        where: {
          userId: userId,
          isRegistered: true
        },
        select: {
          groupId: true
        }
      })
    ).map((group) => group.groupId)

    const groups = (
      await this.prisma.group.findMany({
        where: {
          id: {
            in: groupIds
          }
        },
        select: {
          createdBy: {
            select: {
              userProfile: {
                select: {
                  realName: true
                }
              }
            }
          },
          id: true,
          groupName: true,
          description: true,
          userGroup: true
        }
      })
    ).map((group) => {
      return {
        ...group,
        memberNum: group.userGroup.filter((member) => member.isRegistered)
          .length
      }
    })

    return groups
  }

  async joinGroupById(userId: number, groupId: number) {
    const group = await this.prisma.group.findFirst({
      where: {
        id: groupId,
        config: {
          path: ['allowJoinFromSearch'],
          equals: true
        }
      },
      rejectOnNotFound: () => new EntityNotExistException('group')
    })

    const userGroupData: UserGroupData = {
      userId,
      groupId,
      isRegistered: group.config['requireAprrovalBeforeJoin'] ? false : true,
      isGroupLeader: false
    }

    await this.createUserGroup(userGroupData)
  }

  async leaveGroup(userId: number, groupId: number) {
    const membershipId = await this.prisma.userGroup.findFirst({
      where: {
        userId: userId,
        groupId: groupId,
        isRegistered: true
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
