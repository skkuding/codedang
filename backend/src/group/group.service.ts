/* eslint-disable */
import { Injectable } from '@nestjs/common'
import { Group, UserGroup } from '@prisma/client'
import { EntityNotExistException } from 'src/common/exception/business.exception'
import { PrismaService } from 'src/prisma/prisma.service'
import { UserGroupData } from './interface/user-group-data.interface'
import { GroupData } from './interface/group-data.interface'

@Injectable()
export class GroupService {
  constructor(private readonly prisma: PrismaService) {}

  async getGroup(groupId: number): Promise<Partial<Group>> {
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

  async getGroupJoinById(groupId: number): Promise<GroupData> {
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

    return {
      id: group.id,
      groupName: group.groupName,
      description: group.description,
      createdBy: group.createdBy.userProfile.realName,
      memberNum: group.userGroup.length,
      leaders: await this.getGroupLeaders(groupId)
    }
  }

  async getGroupLeaders(groupId: number): Promise<string[]> {
    const leaders = (
      await this.prisma.userGroup.findMany({
        where: {
          groupId: groupId,
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

    return leaders
  }

  async getGroupMembers(groupId: number): Promise<string[]> {
    const members = (
      await this.prisma.userGroup.findMany({
        where: {
          groupId: groupId,
          isGroupLeader: false
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
    ).map((member) => member.user.userProfile.realName)

    return members
  }

  async getGroups(): Promise<GroupData[]> {
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
          id: group.id,
          groupName: group.groupName,
          description: group.description,
          createdBy: group.createdBy.userProfile.realName,
          memberNum: group.userGroup.length
        }
      })

    return groups
  }

  async getJoinedGroups(userId: number): Promise<GroupData[]> {
    const groupIds = (
      await this.prisma.userGroup.findMany({
        where: {
          userId: userId
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
        id: group.id,
        groupName: group.groupName,
        description: group.description,
        createdBy: group.createdBy.userProfile.realName,
        memberNum: group.userGroup.length
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
      isGroupLeader: false
    }

    await this.createUserGroup(userGroupData)
  }

  async leaveGroup(userId: number, groupId: number) {
    await this.prisma.userGroup.delete({
      where: {
        userId_groupId: {
          userId: userId,
          groupId: groupId
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
        isGroupLeader: true
      }
    })
  }

  async getUserGroupLeaderList(userId: number): Promise<number[]> {
    return (
      await this.prisma.userGroup.findMany({
        where: {
          userId: userId,
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
        isGroupLeader: userGroupData.isGroupLeader
      }
    })
  }
}
