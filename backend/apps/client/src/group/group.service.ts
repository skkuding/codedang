import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Inject, Injectable } from '@nestjs/common'
import type { UserGroup } from '@prisma/client'
import { Cache } from 'cache-manager'
import { joinGroupCacheKey } from '@libs/cache'
import { JOIN_GROUP_REQUEST_EXPIRE_TIME } from '@libs/constants'
import {
  ActionNotAllowedException,
  EntityNotExistException
} from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import type { GroupData } from './interface/group-data.interface'
import type { GroupJoinRequest } from './interface/group-join-request.interface'
import type { UserGroupData } from './interface/user-group-data.interface'

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
        },
        isGroupLeader: true
      }
    })

    if (!isJoined) {
      const group = await this.prisma.group.findFirst({
        where: {
          id: groupId,
          config: {
            path: ['showOnList'],
            equals: true
          }
        },
        select: {
          id: true,
          groupName: true,
          description: true,
          userGroup: true,
          config: true,
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
        allowJoinFromSearch: group.config['allowJoinFromSearch'],
        createdBy: group.createdBy.username,
        memberNum: group.userGroup.length,
        leaders: await this.getGroupLeaders(groupId),
        isJoined: false
      }
    } else {
      return {
        ...isJoined.group,
        isGroupLeader: isJoined.isGroupLeader,
        isJoined: true
      }
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
    return (
      await this.prisma.userGroup.findMany({
        where: {
          NOT: {
            groupId: 1
          },
          userId: userId
        },
        select: {
          group: {
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
          },
          isGroupLeader: true
        }
      })
    ).map((userGroup) => {
      return {
        id: userGroup.group.id,
        groupName: userGroup.group.groupName,
        description: userGroup.group.description,
        memberNum: userGroup.group.userGroup.length,
        createdBy: userGroup.group.createdBy.username,
        isGroupLeader: userGroup.isGroupLeader
      }
    })
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
        // eslint-disable-next-line @typescript-eslint/naming-convention
        userId_groupId: {
          userId: userId,
          groupId: groupId
        }
      }
    })
    return deletedUserGroup
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
