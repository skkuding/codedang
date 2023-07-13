import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { BadRequestException, Inject, Injectable } from '@nestjs/common'
import { Cache } from 'cache-manager'
import { joinGroupCacheKey } from '@libs/cache'
import { JOIN_GROUP_REQUEST_EXPIRE_TIME } from '@libs/constants'
import { PrismaService } from '@libs/prisma'
import type { UserGroup } from '@admin/@generated/user-group/user-group.model'
import type { User } from '@admin/@generated/user/user.model'
import type { GroupMember } from './dto/groupMember.dto'

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
  ): Promise<UserGroup> {
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

    const managerNum = groupMembers.filter(
      (member) => true === member.isGroupLeader
    ).length

    const isGroupMember = groupMembers.some(
      (member) => member.userId === userId
    )

    if ((managerNum <= 1 && !isGroupLeader) || !isGroupMember) {
      throw new BadRequestException()
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

    const managerNum = groupMembers.filter(
      (member) => true === member.isGroupLeader
    ).length

    const isGroupMember = groupMembers.some(
      (member) => member.userId === userId
    )

    const isItManager = groupMembers.some((groupMember) => {
      return groupMember.isGroupLeader === true && groupMember.userId === userId
    })

    if ((managerNum <= 1 && isItManager) || !isGroupMember) {
      throw new BadRequestException()
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

  async getNeededApproval(groupId: string): Promise<User[]> {
    const joinGroupRequest: number[] = await this.cacheManager.get(
      joinGroupCacheKey(parseInt(groupId))
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
      throw new BadRequestException()
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
