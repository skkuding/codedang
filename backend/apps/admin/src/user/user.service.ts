import { CACHE_MANAGER } from '@nestjs/cache-manager'
import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException
} from '@nestjs/common'
import { Role } from '@prisma/client'
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

  async getMembers(
    groupId: number,
    cursor: number,
    take: number,
    isGroupLeader: boolean
  ): Promise<GroupMember[]> {
    const groupMembers = await this.prisma.userGroup.findMany({
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

    const processedGroupMembers = groupMembers.map((userGroup) => {
      return {
        studentId: userGroup.user.username,
        userId: userGroup.user.id,
        name: userGroup.user.userProfile?.realName
          ? userGroup.user.userProfile.realName
          : '',
        email: userGroup.user.email
      }
    })
    return processedGroupMembers
  }

  async updateGroupMemberRole(
    userId: number,
    groupId: number,
    isGroupLeader: boolean
  ): Promise<UserGroup> {
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

  async upgradeMember(userId: number, groupId: number): Promise<UserGroup> {
    return await this.updateGroupMemberRole(userId, groupId, true)
  }

  async downgradeManager(userId: number, groupId: number): Promise<UserGroup> {
    const groupManagers = (
      await this.prisma.userGroup.findMany({
        where: {
          groupId: groupId,
          isGroupLeader: true
        },
        select: {
          user: {
            select: {
              id: true
            }
          }
        }
      })
    ).map((userGroup) => {
      return {
        userId: userGroup.user.id
      }
    })
    // should check if the member is in
    if (groupManagers.length <= 1) {
      throw new BadRequestException()
    }
    return await this.updateGroupMemberRole(userId, groupId, false)
  }

  async deleteGroupMember(userId: number, groupId: number): Promise<UserGroup> {
    const groupManagers = (
      await this.prisma.userGroup.findMany({
        where: {
          groupId: groupId
        },
        select: {
          isGroupLeader: true,
          user: {
            select: {
              id: true
            }
          }
        }
      })
    ).map((userGroup) => {
      return {
        isGroupLeader: userGroup.isGroupLeader,
        userId: userGroup.user.id
      }
    })

    const isItManager = groupManagers.some((groupMember) => {
      return groupMember.isGroupLeader === true && groupMember.userId === userId
    })

    if (groupManagers.length <= 1 && isItManager) {
      throw new BadRequestException()
    } else {
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
    if (joinGroupRequest === undefined) {
      throw new InternalServerErrorException()
    }
    if (!joinGroupRequest.includes(userId)) {
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
