import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { BadRequestException, Inject, Injectable } from '@nestjs/common'
import { GroupType, UserGroup, type User } from '@generated'
import { Role } from '@prisma/client'
import { Cache } from 'cache-manager'
import { joinGroupCacheKey } from '@libs/cache'
import { JOIN_GROUP_REQUEST_EXPIRE_TIME } from '@libs/constants'
import {
  ConflictFoundException,
  EntityNotExistException,
  UnprocessableDataException
} from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import type { GroupJoinRequest } from '@libs/types'
import type { UpdateCreationPermissionsInput } from './model/creationPermission.model'

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async getUser(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId
      }
    })

    if (user == null) {
      throw new EntityNotExistException('User')
    }
    return user
  }

  async getUsers({ cursor, take }: { cursor: number | null; take: number }) {
    const paginator = this.prisma.getPaginator(cursor)

    return await this.prisma.user.findMany({
      ...paginator,
      take,
      include: {
        userProfile: true
      }
    })
  }

  async getUserByEmailOrStudentId(
    email?: string,
    studentId?: string
  ): Promise<User[]> {
    const whereOption = email ? { email } : { studentId }
    return await this.prisma.user.findMany({
      where: whereOption,
      include: {
        userProfile: true
      }
    })
  }

  async updateCreationPermissions(input: UpdateCreationPermissionsInput) {
    const { userId, ...data } = input
    return await this.prisma.user.update({
      where: {
        id: userId
      },
      data,
      select: {
        id: true,
        role: true,
        canCreateCourse: true,
        canCreateContest: true
      }
    })
  }
}

@Injectable()
export class GroupMemberService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
  ) {}

  async getGroupMembers({
    groupId,
    cursor,
    take,
    leaderOnly
  }: {
    groupId: number
    cursor: number | null
    take: number
    leaderOnly: boolean
  }) {
    const paginator = this.prisma.getPaginator(cursor, (value) => ({
      // eslint-disable-next-line @typescript-eslint/naming-convention
      userId_groupId: {
        userId: value,
        groupId
      }
    }))

    const userGroups = await this.prisma.userGroup.findMany({
      ...paginator,
      take,
      where: {
        groupId,
        isGroupLeader: leaderOnly ? true : undefined
      },
      select: {
        isGroupLeader: true,
        user: {
          select: {
            id: true,
            username: true,
            userProfile: {
              select: {
                realName: true
              }
            },
            email: true,
            studentId: true,
            college: true,
            major: true,
            role: true
          }
        }
      }
    })

    return userGroups.map((userGroup) => {
      return {
        isGroupLeader: userGroup.isGroupLeader,
        username: userGroup.user.username,
        userId: userGroup.user.id,
        name: userGroup.user.userProfile?.realName ?? '',
        email: userGroup.user.email,
        studentId: userGroup.user.studentId,
        college: userGroup.user.college,
        major: userGroup.user.major,
        role: userGroup.user.role
      }
    })
  }

  async getGroupMember(groupId: number, userId: number) {
    const userGroup = await this.prisma.userGroup.findFirst({
      where: {
        groupId,
        userId
      },
      select: {
        isGroupLeader: true,
        user: {
          select: {
            id: true,
            username: true,
            userProfile: {
              select: {
                realName: true
              }
            },
            email: true,
            studentId: true,
            college: true,
            major: true,
            role: true
          }
        }
      }
    })
    if (!userGroup) {
      throw new EntityNotExistException('userGroup')
    }
    return {
      isGroupLeader: userGroup.isGroupLeader,
      username: userGroup.user.username,
      userId: userGroup.user.id,
      name: userGroup.user.userProfile?.realName ?? '',
      email: userGroup.user.email,
      studentId: userGroup.user.studentId,
      college: userGroup.user.college,
      major: userGroup.user.major,
      role: userGroup.user.role
    }
  }

  async updateGroupRole(
    userId: number,
    groupId: number,
    toGroupLeader: boolean
  ) {
    const groupMember = await this.prisma.userGroup.findFirst({
      where: {
        groupId,
        userId
      },
      select: {
        user: {
          select: {
            role: true
          }
        },
        isGroupLeader: true
      }
    })

    if (groupMember === null) {
      throw new EntityNotExistException(
        `userId ${userId} is not a group member of groupId ${groupId}`
      )
    }

    const groupLeaderNum = await this.prisma.userGroup.count({
      where: {
        groupId,
        isGroupLeader: true
      }
    })

    if (groupMember.isGroupLeader && !toGroupLeader) {
      if (groupLeaderNum <= 1) {
        throw new BadRequestException('One or more leaders are required')
      }
    } else if (groupMember.isGroupLeader && toGroupLeader) {
      throw new BadRequestException(`The userId ${userId} is already manager`)
    } else if (!groupMember.isGroupLeader && !toGroupLeader) {
      throw new BadRequestException(`The userId ${userId} is already member`)
    }

    return await this.prisma.userGroup.update({
      where: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        userId_groupId: {
          userId,
          groupId
        }
      },
      data: {
        isGroupLeader: toGroupLeader
      }
    })
  }

  async deleteGroupMember(groupId: number, userId: number): Promise<UserGroup> {
    const userGroup = await this.prisma.userGroup.findUnique({
      where: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        userId_groupId: {
          userId,
          groupId
        }
      },
      select: {
        isGroupLeader: true,
        group: {
          select: {
            groupType: true
          }
        }
      }
    })

    if (!userGroup) {
      throw new UnprocessableDataException('It is not a member')
    }

    if (userGroup.isGroupLeader) {
      const groupLeaderNum = await this.prisma.userGroup.count({
        where: {
          groupId,
          isGroupLeader: true
        }
      })
      if (groupLeaderNum <= 1) {
        throw new BadRequestException('One or more leaders are required')
      }
    }

    if (userGroup.group.groupType === GroupType.Course) {
      const assignmentIds = await this.prisma.assignment.findMany({
        where: {
          groupId
        },
        select: {
          id: true
        }
      })

      await this.prisma.assignmentRecord.deleteMany({
        where: {
          userId,
          assignmentId: {
            in: assignmentIds.map(({ id }) => id)
          }
        }
      })
    }

    return await this.prisma.userGroup.delete({
      where: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        userId_groupId: {
          userId,
          groupId
        }
      }
    })
  }

  async getJoinRequests(groupId: number) {
    const groupJoinRequests = await this.cacheManager.get<GroupJoinRequest[]>(
      joinGroupCacheKey(groupId)
    )
    if (!groupJoinRequests) {
      return []
    }

    const validRequests = groupJoinRequests.filter(
      (req) => req.expiresAt > Date.now()
    )
    const userIds = validRequests.map((req) => req.userId)
    return await this.prisma.user.findMany({
      where: {
        id: {
          in: userIds
        }
      }
    })
  }

  async handleJoinRequest(
    groupId: number,
    userId: number,
    isAccepted: boolean
  ): Promise<UserGroup | number> {
    const groupJoinRequests =
      (await this.cacheManager.get<GroupJoinRequest[]>(
        joinGroupCacheKey(groupId)
      )) || []

    const validRequests = groupJoinRequests.filter(
      (req) => req.expiresAt > Date.now()
    )

    const userRequested = validRequests.find((req) => req.userId === userId)

    if (!userRequested) {
      throw new ConflictFoundException(
        `The userId ${userId} didn't request join to groupId ${groupId}`
      )
    }

    const remainingRequests = validRequests.filter(
      (req) => req.userId !== userId
    )

    await this.cacheManager.set(
      joinGroupCacheKey(groupId),
      remainingRequests,
      JOIN_GROUP_REQUEST_EXPIRE_TIME
    )
    if (isAccepted) {
      const requestedUser = await this.prisma.user.findUnique({
        where: {
          id: userId
        },
        select: {
          role: true
        }
      })

      if (!requestedUser) {
        throw new EntityNotExistException(`userId ${userId}`)
      }

      return await this.prisma.userGroup.create({
        data: {
          user: {
            connect: { id: userId }
          },
          group: {
            connect: { id: groupId }
          },
          isGroupLeader:
            requestedUser.role == Role.Admin ||
            requestedUser.role == Role.SuperAdmin
        }
      })
    } else {
      return userId
    }
  }
}
