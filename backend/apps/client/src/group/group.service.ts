/* eslint-disable */
import { Inject, Injectable } from '@nestjs/common'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Group, UserGroup } from '@prisma/client'
import {
  ActionNotAllowedException,
  EntityNotExistException
} from '@client/common/exception/business.exception'
import { PrismaService } from '@client/prisma/prisma.service'
import { UserGroupData } from './interface/user-group-data.interface'
import { GroupData } from './interface/group-data.interface'
import { JOIN_GROUP_REQUEST_EXPIRE_TIME } from '../common/constants'
import { joinGroupCacheKey } from '@client/common/cache/keys'
import { Cache } from 'cache-manager'
import { GroupJoinRequest } from './interface/group-join-request.interface'

@Injectable()
export class GroupService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
  ) {}

  async getGroup(userId: number, groupId: number): Promise<Partial<GroupData>> {
    const isJoined = await this.prisma.userGroup.findFirst({
      where: {
        userId: userId,
        groupId: groupId
      },
      select: {
        group: {
          select: {
            id: true,
            groupName: true,
            description: true
          }
        }
      }
    })

    if (!isJoined) {
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
              username: true
            }
          }
        },
        rejectOnNotFound: () => new EntityNotExistException('group')
      })

      return {
        id: group.id,
        groupName: group.groupName,
        description: group.description,
        createdBy: group.createdBy.username,
        memberNum: group.userGroup.length,
        leaders: await this.getGroupLeaders(groupId)
      }
    } else {
      return isJoined.group
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
              username: true
            }
          }
        }
      })
    ).map((leader) => leader.user.username)

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
              username: true
            }
          }
        }
      })
    ).map((member) => member.user.username)

    return members
  }

  async getGroups(cursor: number, take: number): Promise<GroupData[]> {
    const groups = (
      await this.prisma.group.findMany({
        take,
        skip: cursor ? 1 : 0,
        ...(cursor && { cursor: { id: cursor } }),
        where: {
          NOT: {
            id: 1
          },
          config: {
            path: ['showOnList'],
            equals: true
          }
        },
        select: {
          createdBy: {
            select: {
              username: true
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
        createdBy: group.createdBy.username,
        memberNum: group.userGroup.length
      }
    })

    return groups
  }

  async getJoinedGroups(userId: number): Promise<GroupData[]> {
    const groupIds = (
      await this.prisma.userGroup.findMany({
        where: {
          NOT: {
            groupId: 1
          },
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
              username: true
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
        createdBy: group.createdBy.username,
        memberNum: group.userGroup.length
      }
    })

    return groups
  }

  async joinGroupById(
    userId: number,
    groupId: number
  ): Promise<{ userGroupData: Partial<UserGroup>; isJoined: boolean }> {
    const group = await this.prisma.group.findFirst({
      where: {
        id: groupId,
        config: {
          path: ['allowJoinFromSearch'],
          equals: true
        }
      },
      select: {
        config: true,
        userGroup: {
          select: {
            userId: true
          }
        }
      },
      rejectOnNotFound: () => new EntityNotExistException('group')
    })

    const isJoined = group.userGroup.some(
      (joinedUser) => joinedUser.userId === userId
    )

    if (isJoined) {
      throw new ActionNotAllowedException('join request', 'group')
    } else if (group.config['requireApprovalBeforeJoin']) {
      const joinGroupRequest = await this.cacheManager.get(
        joinGroupCacheKey(userId, groupId)
      )
      if (joinGroupRequest) {
        throw new ActionNotAllowedException('duplicated join request', 'group')
      }

      const userGroupValue: GroupJoinRequest = { userId, groupId }
      await this.cacheManager.set(
        joinGroupCacheKey(userId, groupId),
        userGroupValue,
        JOIN_GROUP_REQUEST_EXPIRE_TIME
      )

      return {
        userGroupData: {
          userId: userId,
          groupId: groupId
        },
        isJoined: false
      }
    } else {
      const userGroupData: UserGroupData = {
        userId,
        groupId,
        isGroupLeader: false
      }
      return {
        userGroupData: await this.createUserGroup(userGroupData),
        isJoined: true
      }
    }
  }

  async leaveGroup(userId: number, groupId: number): Promise<UserGroup> {
    const deletedUserGroup = await this.prisma.userGroup.delete({
      where: {
        userId_groupId: {
          userId: userId,
          groupId: groupId
        }
      }
    })
    return deletedUserGroup
  }

  async getUserGroup(userId: number, groupId: number) {
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
