import { Injectable } from '@nestjs/common'
import { Group, UserGroup } from '@prisma/client'
import { PrismaService } from 'src/prisma/prisma.service'
import { RequestGroupDto } from './dto/request-group.dto'
import { encrypt } from 'src/common/hash'
import {
  ActionNotAllowedException,
  EntityNotExistException
} from 'src/common/exception/business.exception'
import { AdminGroup } from './interface/admin-group.interface'
import { Membership } from './interface/membership'
import { CreateMemberDto } from './dto/create-member.dto'

// TODO: group id 확정 필요
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
    const code = (await encrypt(userId + groupDto.group_name)).split('$')[5]

    return await this.prisma.group.create({
      data: {
        group_name: groupDto.group_name,
        private: groupDto.private,
        invitation_code: code,
        description: groupDto.description,
        created_by: {
          connect: { id: userId }
        }
      }
    })
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
          group_name: true,
          private: true,
          description: true,
          UserGroup: true
        }
      })
    ).map((group) => {
      return {
        ...group,
        UserGroup: group.UserGroup.length
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
        group_name: true,
        private: true,
        invitation_code: true,
        description: true,
        create_time: true,
        update_time: true,
        UserGroup: true
      },
      rejectOnNotFound: () => new EntityNotExistException('group')
    })

    return {
      ...group,
      UserGroup: group.UserGroup.length,
      ManagerGroup: (await this.getAdminManagers(id)).map(
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
        group_id: id
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
        await this.prisma.userProfile.findUnique({
          where: {
            user_id: memberDto.user_id
          },
          select: {
            id: true
          }
        })
      ).id
      return await this.prisma.userGroup.create({
        data: {
          user: {
            connect: { id: id }
          },
          group: {
            connect: { id: groupId }
          },
          is_group_manager: memberDto.is_group_manager
        }
      })
    })

    return Promise.all(members)
  }

  async getAdminManagers(groupId: number): Promise<Membership[]> {
    return await this.prisma.userGroup.findMany({
      where: {
        group_id: groupId,
        is_registered: true,
        is_group_manager: true
      },
      select: {
        id: true,
        user: {
          select: {
            username: true,
            email: true,
            UserProfile: {
              select: {
                user_id: true,
                real_name: true
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
        group_id: groupId,
        is_registered: true
      },
      select: {
        id: true,
        user: {
          select: {
            username: true,
            email: true,
            UserProfile: {
              select: {
                user_id: true,
                real_name: true
              }
            }
          }
        },
        is_group_manager: true
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
        group_id: groupId,
        is_registered: false
      },
      select: {
        id: true,
        user: {
          select: {
            username: true,
            email: true,
            UserProfile: {
              select: {
                user_id: true,
                real_name: true
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
          is_group_manager: true
        },
        rejectOnNotFound: () => new EntityNotExistException('membership')
      })
    ).is_group_manager

    if (currentRole === role) {
      if (role) throw new ActionNotAllowedException('upgrade', 'manager')
      else throw new ActionNotAllowedException('downgrade', 'member')
    }

    return await this.prisma.userGroup.update({
      where: {
        id: id
      },
      data: {
        is_group_manager: role
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
        is_registered: true
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
