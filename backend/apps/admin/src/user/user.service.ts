import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { BadRequestException, Inject, Injectable } from '@nestjs/common'
import { Role } from '@prisma/client'
import { Cache } from 'cache-manager'
import { joinGroupCacheKey } from '@libs/cache'
import { JOIN_GROUP_REQUEST_EXPIRE_TIME } from '@libs/constants'
import { PrismaService } from '@libs/prisma'
import type { UserGroup } from '@admin/@generated/user-group/user-group.model'

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
  ) {}

  async getGroupMembers(
    groupId: number,
    cursor: number,
    take: number,
    isGroupLeader: boolean
  ) {
    cursor = cursor - 1
    return (
      await this.prisma.userGroup.findMany({
        take,
        skip: cursor ? 1 : 0,
        ...(cursor && {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          cursor: { userId_groupId: { userId: cursor, groupId } }
        }),
        where: {
          groupId: groupId,
          isGroupLeader: isGroupLeader
        },
        select: {
          user: {
            select: {
              id: true,
              username: true,
              userProfile: {
                select: {
                  realName: true
                }
              },
              email: true
            }
          }
        }
      })
    ).map((userGroup) => {
      return {
        studentId: userGroup.user.username,
        userId: userGroup.user.id,
        name: userGroup.user.userProfile?.realName
          ? userGroup.user.userProfile.realName
          : '',
        email: userGroup.user.email
      }
    })
  }

  async updateGroupMemberRole(
    userId: number,
    groupId: number,
    isGroupLeader: boolean
  ) {
    const groupMembers = (
      await this.prisma.userGroup.findMany({
        where: {
          groupId: groupId
        },
        select: {
          userId: true,
          user: {
            select: {
              role: true
            }
          },
          isGroupLeader: true
        }
      })
    ).map((userGroup) => {
      return {
        userId: userGroup.userId,
        userRole: userGroup.user.role,
        isGroupLeader: userGroup.isGroupLeader
      }
    })

    const isGroupMember = groupMembers.some(
      (member) => member.userId === userId
    )

    if (!isGroupMember) {
      throw new BadRequestException(
        `userId ${userId} is not a group member of groupId ${groupId}`
      )
    }

    if (!isGroupLeader) {
      const isAdmin = groupMembers.some(
        (member) =>
          member.userId === userId &&
          (member.userRole == Role.Admin || member.userRole == Role.SuperAdmin)
      )

      if (isAdmin) {
        throw new BadRequestException(`userId ${userId} is admin`)
      }
    }

    const manager = groupMembers
      .filter((member) => true === member.isGroupLeader)
      .map((member) => member.userId)

    if (!manager.includes(userId) && !isGroupLeader) {
      throw new BadRequestException(`userId ${userId} is already member`)
    }

    if (manager.includes(userId) && isGroupLeader) {
      throw new BadRequestException(`userId ${userId} is already manager`)
    }

    if (manager.length <= 1 && !isGroupLeader) {
      throw new BadRequestException('One or more managers are required')
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
        isGroupLeader: isGroupLeader
      }
    })
  }

  async deleteGroupMember(userId: number, groupId: number) {
    const groupMembers = (
      await this.prisma.userGroup.findMany({
        where: {
          groupId: groupId
        },
        select: {
          userId: true,
          isGroupLeader: true
        }
      })
    ).map((userGroup) => {
      return {
        userId: userGroup.userId,
        isGroupLeader: userGroup.isGroupLeader
      }
    })

    const isGroupMember = groupMembers.some(
      (member) => member.userId === userId
    )

    if (!isGroupMember) {
      throw new BadRequestException(
        `userId ${userId} is not a group member of groupId ${groupId}`
      )
    }

    const manager = groupMembers
      .filter((member) => true === member.isGroupLeader)
      .map((member) => member.userId)

    if (manager.length <= 1 && manager.includes(userId)) {
      throw new BadRequestException('One or more managers are required')
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
    const joinGroupRequest: number[] = await this.cacheManager.get(
      joinGroupCacheKey(groupId)
    )
    if (joinGroupRequest === undefined) {
      return []
    }
    return await this.prisma.user.findMany({
      where: {
        id: {
          in: joinGroupRequest
        }
      }
    })
  }

  async handleJoinRequest(
    groupId: number,
    userId: number,
    isAccepted: boolean
  ): Promise<UserGroup | number> {
    const joinGroupRequest: number[] = await this.cacheManager.get(
      joinGroupCacheKey(groupId)
    )
    if (joinGroupRequest === undefined || !joinGroupRequest.includes(userId)) {
      throw new BadRequestException(
        `userId ${userId} didn't request join to groupId ${groupId}`
      )
    }
    const filtered = joinGroupRequest.filter((element) => element !== userId)
    await this.cacheManager.set(
      joinGroupCacheKey(groupId),
      filtered,
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
