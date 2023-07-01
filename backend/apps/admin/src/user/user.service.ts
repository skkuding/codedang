import { CACHE_MANAGER } from '@nestjs/cache-manager'
import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException
} from '@nestjs/common'
import { Role } from '@prisma/client'
import { Cache } from 'cache-manager'
import { joinGroupCacheKey } from '@libs/cache'
import { JOIN_GROUP_REQUEST_EXPIRE_TIME } from '@libs/constants'
import { PrismaService } from '@libs/prisma'
import type { UserGroup } from '@admin/@generated/user-group/user-group.model'
import type { User } from '@admin/@generated/user/user.model'

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
  ) {}

  async getUsers(groupId: number, role: Role, cursor: number, take: number) {
    if (role != Role.Manager && role != Role.User)
      throw new BadRequestException()

    const isGroupLeader = role == Role.Manager
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
      const { username, id: userId, email, userProfile } = userGroup.user

      if (userProfile == null) {
        return {
          studentId: username,
          userId,
          name: '',
          email
        }
      } else {
        return {
          studentId: username,
          userId,
          name: userProfile.realName
        }
      }
    })
    return processedGroupMembers
  }

  async upOrDowngradeManager(
    userId: number,
    groupId: number,
    isUpgrade: boolean
  ): Promise<UserGroup> {
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

    const doesTheManagerExist = groupManagers.some(
      (groupManager) => groupManager.userId === userId
    )

    let upgradeOrDowngrade = true
    if (doesTheManagerExist == true && isUpgrade == false) {
      upgradeOrDowngrade = false
    } else if (doesTheManagerExist == false && isUpgrade == true) {
      upgradeOrDowngrade = true
    } else {
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
        isGroupLeader: upgradeOrDowngrade
      }
    })
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

    const doesTheMemberExist = groupManagers.some(
      (groupMember) => groupMember.userId === userId
    )

    let managerNum = 0
    groupManagers.forEach((groupMember) => {
      if (groupMember.isGroupLeader) managerNum += 1
    })

    const isItManager = groupManagers.some((groupMember) => {
      return groupMember.isGroupLeader === true && groupMember.userId === userId
    })

    if (groupManagers.length <= 1 || !doesTheMemberExist || managerNum <= 1) {
      throw new NotFoundException()
    } else if (!isItManager || (isItManager && managerNum > 1)) {
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

  async acceptJoin(groupId: number, userId: number): Promise<UserGroup> {
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
  }

  async rejectJoin(groupId: number, userId: number): Promise<number> {
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
    return userId
  }
}
