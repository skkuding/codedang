import { Injectable } from '@nestjs/common'
import { Group, UserGroup } from '@prisma/client'
import { PrismaService } from 'src/prisma/prisma.service'
import { RequestGroupDto } from './dto/request-group.dto'
import {
  ActionNotAllowedException,
  EntityNotExistException
} from 'src/common/exception/business.exception'
import { AdminGroup } from './interface/admin-group.interface'
import { Membership } from './interface/membership.interface'
import { CreateMemberDto } from './dto/create-member.dto'
import { randomBytes } from 'crypto'

const DEPRECATED = 0

@Injectable()
export class GroupService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserGroupMembershipInfo(
    userId: number,
    groupId: number
  ): Promise<Partial<UserGroup>> {
    return await this.prisma.userGroup.findFirst({
      where: {
        userId: userId,
        groupId: groupId
      },
      select: {
        isRegistered: true,
        isGroupManager: true
      }
    })
  }

  async getManagingGroupIds(userId: number): Promise<number[]> {
    return (
      await this.prisma.userGroup.findMany({
        where: {
          userId: userId,
          isRegistered: true,
          isGroupManager: true
        },
        select: {
          groupId: true
        }
      })
    ).map((group) => group.groupId)
  }

  async createGroup(userId: number, groupDto: RequestGroupDto): Promise<Group> {
    return await this.prisma.group.create({
      data: {
        groupName: groupDto.groupName,
        private: groupDto.private,
        invitationCode: this.createCode(),
        description: groupDto.description,
        createdBy: {
          connect: { id: userId }
        }
      }
    })
  }

  createCode(): string {
    return randomBytes(6).toString('base64').padStart(8, 'A')
  }

  async getAdminGroups(userId: number): Promise<AdminGroup[]> {
    const groupIds = await this.getManagingGroupIds(userId)

    return (
      await this.prisma.group.findMany({
        where: {
          id: {
            in: groupIds
          }
        },
        select: {
          id: true,
          groupName: true,
          private: true,
          description: true,
          UserGroup: true
        }
      })
    ).map((group) => {
      return {
        ...group,
        totalMember: group.UserGroup.filter((member) => member.isRegistered)
          .length
      }
    })
  }

  async getAdminGroup(id: number): Promise<AdminGroup> {
    const group = await this.prisma.group.findUnique({
      where: {
        id: id
      },
      select: {
        id: true,
        groupName: true,
        private: true,
        invitationCode: true,
        description: true,
        createTime: true,
        updateTime: true,
        UserGroup: true
      },
      rejectOnNotFound: () => new EntityNotExistException('group')
    })

    return {
      ...group,
      totalMember: group.UserGroup.filter((member) => member.isRegistered)
        .length,
      managers: (await this.getAdminManagers(id)).map(
        (manager) => manager.user.username
      )
    }
  }

  async updateGroup(id: number, groupDto: RequestGroupDto): Promise<Group> {
    await this.prisma.group.findUnique({
      where: {
        id: id
      },
      rejectOnNotFound: () => new EntityNotExistException('group')
    })

    return await this.prisma.group.update({
      where: {
        id: id
      },
      data: {
        ...groupDto
      }
    })
  }

  async deleteGroup(id: number) {
    const group = await this.prisma.group.findUnique({
      where: {
        id: id
      },
      select: {
        Problem: {
          select: {
            id: true
          }
        },
        Contest: {
          select: {
            id: true
          }
        },
        Workbook: {
          select: {
            id: true
          }
        }
      },
      rejectOnNotFound: () => new EntityNotExistException('group')
    })

    await this.prisma.group.delete({
      where: {
        id: id
      }
    })

    await this.prisma.userGroup.deleteMany({
      where: {
        groupId: id
      }
    })

    const deprecate = async (query: {
      model: string
      related: { id: number }[]
    }) => {
      await this.prisma[query.model].update({
        where: {
          id: {
            in: query.related.map((record) => record.id)
          }
        },
        data: {
          group: {
            connect: { id: DEPRECATED }
          }
        }
      })
    }
    ;[
      {
        model: 'problem',
        related: group.Problem
      },
      {
        model: 'contest',
        related: group.Contest
      },
      {
        model: 'workbook',
        related: group.Workbook
      }
    ].forEach((query) => deprecate(query))
  }

  async createMembers(
    groupId: number,
    memberDtos: CreateMemberDto[]
  ): Promise<UserGroup[]> {
    const members = memberDtos.map(async (memberDto) => {
      const id = (
        await this.prisma.user.findUnique({
          where: {
            studentId: memberDto.studentId
          },
          select: {
            id: true
          }
        })
      ).id
      return this.prisma.userGroup.create({
        data: {
          user: {
            connect: { id: id }
          },
          group: {
            connect: { id: groupId }
          },
          isGroupManager: memberDto.isGroupManager
        }
      })
    })

    return await Promise.all(members)
  }

  async getAdminManagers(groupId: number): Promise<Membership[]> {
    return await this.prisma.userGroup.findMany({
      where: {
        groupId: groupId,
        isRegistered: true,
        isGroupManager: true
      },
      select: {
        id: true,
        user: {
          select: {
            username: true,
            studentId: true,
            email: true,
            UserProfile: {
              select: {
                realName: true
              }
            }
          }
        }
      }
    })
  }

  async getAdminMembers(groupId: number, skip: number): Promise<Membership[]> {
    return await this.prisma.userGroup.findMany({
      where: {
        groupId: groupId,
        isRegistered: true
      },
      select: {
        id: true,
        user: {
          select: {
            username: true,
            studentId: true,
            email: true,
            UserProfile: {
              select: {
                realName: true
              }
            }
          }
        },
        isGroupManager: true
      },
      skip: skip,
      take: 10
    })
  }

  async getAdminPendingMembers(
    groupId: number,
    skip: number
  ): Promise<Membership[]> {
    return await this.prisma.userGroup.findMany({
      where: {
        groupId: groupId,
        isRegistered: false
      },
      select: {
        id: true,
        user: {
          select: {
            username: true,
            studentId: true,
            email: true,
            UserProfile: {
              select: {
                realName: true
              }
            }
          }
        }
      },
      skip: skip,
      take: 10
    })
  }

  async gradeMember(id: number, role: boolean): Promise<UserGroup> {
    const currentRole = (
      await this.prisma.userGroup.findUnique({
        where: {
          id: id
        },
        select: {
          isGroupManager: true
        },
        rejectOnNotFound: () => new EntityNotExistException('membership')
      })
    ).isGroupManager

    if (currentRole === role) {
      if (role) throw new ActionNotAllowedException('upgrade', 'manager')
      else throw new ActionNotAllowedException('downgrade', 'member')
    }

    return await this.prisma.userGroup.update({
      where: {
        id: id
      },
      data: {
        isGroupManager: role
      }
    })
  }

  async registerMembers(ids: number[]): Promise<{ count: number }> {
    return await this.prisma.userGroup.updateMany({
      where: {
        id: {
          in: ids
        }
      },
      data: {
        isRegistered: true
      }
    })
  }

  async deleteMember(id: number) {
    await this.prisma.userGroup.findFirst({
      where: {
        id: id
      },
      rejectOnNotFound: () => new EntityNotExistException('membership')
    })

    await this.prisma.userGroup.delete({
      where: {
        id: id
      }
    })
  }
}
