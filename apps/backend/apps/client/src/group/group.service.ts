import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Inject, Injectable } from '@nestjs/common'
import { GroupType, Role, type UserGroup } from '@prisma/client'
import { Cache } from 'cache-manager'
import { invitationCodeKey, joinGroupCacheKey } from '@libs/cache'
import { JOIN_GROUP_REQUEST_EXPIRE_TIME, OPEN_SPACE_ID } from '@libs/constants'
import {
  ConflictFoundException,
  EntityNotExistException,
  ForbiddenAccessException
} from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import type { GroupJoinRequest } from '@libs/types'
import type { UserGroupData } from './interface/user-group-data.interface'

@Injectable()
export class GroupService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
  ) {}

  async getCourse(groupId: number, userId: number, invited = false) {
    const isJoined = await this.prisma.userGroup.findUnique({
      where: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        userId_groupId: {
          userId,
          groupId
        }
      },
      select: {
        group: {
          select: {
            id: true,
            groupName: true,
            groupType: true,
            courseInfo: true
          }
        },
        isGroupLeader: true
      }
    })

    if (!isJoined) {
      const filter = invited ? 'allowJoinWithURL' : 'showOnList'
      const group = await this.prisma.group.findUniqueOrThrow({
        where: {
          id: groupId,
          config: {
            path: [filter],
            equals: true
          }
        },
        select: {
          id: true,
          groupName: true,
          groupType: true,
          courseInfo: {
            select: {
              courseNum: true,
              classNum: true,
              professor: true,
              semester: true
            }
          }
        }
      })

      return {
        ...group,
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

  async getGroupByInvitation(code: string, userId: number) {
    const groupId = await this.cacheManager.get<number>(invitationCodeKey(code))
    if (!groupId) {
      throw new EntityNotExistException('Invalid invitation')
    }
    return this.getCourse(groupId, userId, true)
  }

  async getGroupLeaders(groupId: number): Promise<string[]> {
    const leaders = (
      await this.prisma.userGroup.findMany({
        where: {
          groupId,
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
          groupId,
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

  async getGroups(cursor: number | null, take: number) {
    const paginator = this.prisma.getPaginator(cursor)

    const groups = (
      await this.prisma.group.findMany({
        ...paginator,
        take,
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
        memberNum: group.userGroup.length
      }
    })

    const total = await this.prisma.group.count({
      where: {
        NOT: {
          id: 1
        },
        config: {
          path: ['showOnList'],
          equals: true
        }
      }
    })

    return { data: groups, total }
  }

  async getJoinedGroups(userId: number, groupType: GroupType) {
    return (
      await this.prisma.userGroup.findMany({
        where: {
          NOT: {
            groupId: 1
          },
          userId
        },
        select: {
          group: {
            select: {
              id: true,
              groupName: true,
              groupType: true,
              description: groupType === GroupType.Study,
              // eslint-disable-next-line @typescript-eslint/naming-convention
              _count: { select: { userGroup: true } },
              courseInfo: groupType === GroupType.Course
            }
          },
          isGroupLeader: true
        }
      })
    )
      .filter(({ group }) => groupType === group.groupType)
      .map(({ group, isGroupLeader }) => {
        return {
          id: group.id,
          groupName: group.groupName,
          description: group.description,
          memberNum: group._count.userGroup,
          isGroupLeader,
          ...(group.courseInfo && { courseInfo: group.courseInfo })
        }
      })
  }

  async joinGroupById(
    userId: number,
    groupId: number,
    invitation: string
  ): Promise<{ userGroupData: Partial<UserGroup>; isJoined: boolean }> {
    const invitedGroupId = await this.cacheManager.get<number>(
      invitationCodeKey(invitation)
    )
    if (!invitedGroupId || groupId !== invitedGroupId) {
      throw new ForbiddenAccessException('Invalid invitation')
    }

    const filter = invitation ? 'allowJoinWithURL' : 'allowJoinFromSearch'
    const group = await this.prisma.group.findUniqueOrThrow({
      where: {
        id: groupId,
        config: {
          path: [filter],
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
      }
    })

    const isJoined = group.userGroup.some(
      (joinedUser) => joinedUser.userId === userId
    )

    if (isJoined) {
      throw new ConflictFoundException('Already joined this group')
    } else if (group.config?.['requireApprovalBeforeJoin']) {
      const groupJoinRequests =
        (await this.cacheManager.get<GroupJoinRequest[]>(
          joinGroupCacheKey(groupId)
        )) || []

      if (groupJoinRequests) {
        const validRequests = groupJoinRequests.filter(
          (req) => req.expiresAt > Date.now()
        )
        if (validRequests.find((req) => req.userId === userId)) {
          throw new ConflictFoundException(
            'Already requested to join this group'
          )
        }
      }

      const newRequest: GroupJoinRequest = {
        userId,
        expiresAt: Date.now() + JOIN_GROUP_REQUEST_EXPIRE_TIME
      }
      groupJoinRequests.push(newRequest)

      await this.cacheManager.set(
        joinGroupCacheKey(groupId),
        groupJoinRequests,
        JOIN_GROUP_REQUEST_EXPIRE_TIME
      )

      return {
        userGroupData: {
          userId,
          groupId
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
    const groupLeaders = await this.prisma.userGroup.findMany({
      where: {
        isGroupLeader: true,
        groupId
      }
    })
    if (groupLeaders.length == 1 && groupLeaders[0].userId == userId) {
      throw new ConflictFoundException('One or more managers are required')
    }

    const deletedUserGroup = await this.prisma.userGroup.delete({
      where: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        userId_groupId: {
          userId,
          groupId
        }
      }
    })
    return deletedUserGroup
  }

  async createUserGroup(userGroupData: UserGroupData): Promise<UserGroup> {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: {
        id: userGroupData.userId
      }
    })

    if (
      user &&
      (user.role === Role.SuperAdmin || user.role === Role.Admin) &&
      userGroupData.groupId != OPEN_SPACE_ID
    ) {
      userGroupData.isGroupLeader = true
    }

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
