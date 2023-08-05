import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { BadRequestException, Inject, Injectable } from '@nestjs/common'
import { Cache } from 'cache-manager'
import { joinGroupCacheKey } from '@libs/cache'
import { JOIN_GROUP_REQUEST_EXPIRE_TIME } from '@libs/constants'
import { PrismaService } from '@libs/prisma'
import type { UserGroup } from '@admin/@generated/user-group/user-group.model'
import type { User } from '@admin/@generated/user/user.model'
import type { GroupMember } from './model/groupMember.model'
import type { UpdateUserGroup } from './model/userGroup-update.model'

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
  ): Promise<GroupMember[]> {
    cursor = cursor ? cursor : cursor - 1
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
  ): Promise<UpdateUserGroup> {
    const groupMembers = (
      await this.prisma.userGroup.findMany({
        where: {
          groupId: groupId
        },
        select: {
          user: {
            select: {
              id: true
            }
          },
          isGroupLeader: true
        }
      })
    ).map((userGroup) => {
      return {
        userId: userGroup.user.id,
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
      },
      select: {
        userId: true,
        groupId: true,
        isGroupLeader: true
      }
    })
  }

  async deleteGroupMember(userId: number, groupId: number): Promise<UserGroup> {
    const groupMembers = (
      await this.prisma.userGroup.findMany({
        where: {
          groupId: groupId
        },
        select: {
          user: {
            select: {
              id: true
            }
          },
          isGroupLeader: true
        }
      })
    ).map((userGroup) => {
      return {
        userId: userGroup.user.id,
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

  async getNeededApproval(groupId: number): Promise<User[]> {
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
      return await this.prisma.userGroup.create({
        data: {
          user: {
            connect: { id: userId }
          },
          group: {
            connect: { id: groupId }
          },
          isGroupLeader: false
        }
      })
    } else {
      return userId
    }
  }
}
