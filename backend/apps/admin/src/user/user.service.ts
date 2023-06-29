import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { type UserCreateInput } from '../@generated/user/user-create.input'
import { type UserUpdateInput } from '../@generated/user/user-update.input'
import { PrismaService } from '@libs/prisma'
import { type User } from '@admin/@generated/user/user.model'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Cache } from 'cache-manager'
import { type UserGroup } from '@admin/@generated/user-group/user-group.model'
import { type UserGroupData } from './interface/user-group-data.interface'
import { Role } from '@prisma/client'

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
  ) {}

  async createUser(userCreateInput: UserCreateInput) {
    return await this.prisma.user.create({
      data: {
        username: userCreateInput.username,
        password: userCreateInput.password,
        email: userCreateInput.email
      }
    })
  }

  async getAllUsers(): Promise<User[]> {
    return await this.prisma.user.findMany()
  }

  async getUser(id: number): Promise<User> {
    return await this.prisma.user.findUnique({
      where: {
        id: id
      }
    })
  }

  async getUsers(groupId: number, role: Role, cursor: number, take: number) {
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
          username,
          userId,
          realName: '',
          email
        }
      } else {
        return {
          username,
          userId,
          realName: userProfile.realName,
          email
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
        username: userGroup.user.username,
        userId: userGroup.user.id,
        realName: userGroup.user.userProfile.realName,
        email: userGroup.user.email
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
      console.log('Invalid request')
      throw new NotFoundException()
    }
    const returnVal = await this.prisma.userGroup.update({
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
    console.log(returnVal)
    return returnVal
  }

  async updateUser(
    id: number,
    userUpdateInput: UserUpdateInput
  ): Promise<User> {
    return await this.prisma.user.update({
      where: {
        id: id
      },
      data: {
        username: userUpdateInput.username,
        password: userUpdateInput.password,
        email: userUpdateInput.email
      }
    })
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

  async registerNewMembers(
    groupId: number,
    managers: number[],
    members: number[]
  ) {
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
          }
        }
      })
    ).map((userGroup) => {
      return {
        userId: userGroup.user.id
      }
    })

    managers.forEach(async (userId) => {
      if (!(userId in groupMembers)) {
        const userGroupData: UserGroupData = {
          userId,
          groupId,
          isGroupLeader: true
        }
        await this.createUserGroup(userGroupData)
      }
    })

    members.forEach(async (userId) => {
      if (!(userId in groupMembers)) {
        const userGroupData: UserGroupData = {
          userId,
          groupId,
          isGroupLeader: false
        }
        await this.createUserGroup(userGroupData)
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

  // async getGroupMEmbersNeededApproval(groupId: string) {

  // }
}
