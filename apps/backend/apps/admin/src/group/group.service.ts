import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Inject, Injectable } from '@nestjs/common'
import { Cache } from 'cache-manager'
import type { AuthenticatedUser } from '@libs/auth'
import { invitationCodeKey, invitationGroupKey } from '@libs/cache'
import { INVIATION_EXPIRE_TIME, OPEN_SPACE_ID } from '@libs/constants'
import {
  ConflictFoundException,
  EntityNotExistException,
  ForbiddenAccessException,
  UnprocessableDataException
} from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import { GroupType, type Group } from '@admin/@generated'
import type { CourseInput } from './model/group.input'

@Injectable()
export class GroupService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
  ) {}

  async createCourse(
    input: CourseInput,
    user: AuthenticatedUser
  ): Promise<Partial<Group>> {
    if (!user.isAdmin() && !user.isSuperAdmin()) {
      const { canCreateCourse } = await this.prisma.user.findUniqueOrThrow({
        where: {
          id: user.id
        },
        select: {
          canCreateCourse: true
        }
      })

      if (!canCreateCourse) {
        throw new ForbiddenAccessException('Forbidden Access')
      }
    }
    try {
      const createdCourse = await this.prisma.group.create({
        data: {
          groupName: input.courseTitle,
          groupType: GroupType.Course,
          config: JSON.parse(JSON.stringify(input.config)),
          courseInfo: {
            create: {
              courseNum: input.courseNum,
              classNum: input.classNum,
              professor: input.professor,
              semester: input.semester,
              email: input.email,
              website: input.website,
              office: input.office,
              phoneNum: input.phoneNum
            }
          }
        },
        select: {
          id: true,
          groupName: true,
          groupType: true,
          config: true,
          courseInfo: true
        }
      })
      await this.prisma.userGroup.create({
        data: {
          user: {
            connect: { id: user.id }
          },
          group: {
            connect: { id: createdCourse.id }
          },
          isGroupLeader: true
        }
      })
      return createdCourse
    } catch (error) {
      throw new UnprocessableDataException(error.message)
    }
  }

  async getGroups(cursor: number | null, take: number) {
    const paginator = this.prisma.getPaginator(cursor)

    return (
      await this.prisma.group.findMany({
        ...paginator,
        take,
        select: {
          id: true,
          groupName: true,
          description: true,
          config: true,
          userGroup: true
        }
      })
    ).map((data) => {
      const { userGroup, ...group } = data
      return {
        ...group,
        memberNum: userGroup.length
      }
    })
  }

  async getGroupsUserLead(userId: number, groupType: GroupType) {
    return (
      await this.prisma.userGroup.findMany({
        where: {
          userId,
          isGroupLeader: true
        },
        select: {
          group: {
            select: {
              id: true,
              groupName: true,
              groupType: true,
              courseInfo: true,
              // eslint-disable-next-line @typescript-eslint/naming-convention
              _count: { select: { userGroup: true } }
            }
          }
        }
      })
    )
      .filter(({ group }) => group.groupType === groupType)
      .map(({ group }) => ({
        ...group,
        memberNum: group._count.userGroup
      }))
  }

  async getGroup(id: number) {
    const data = await this.prisma.group.findUnique({
      where: {
        id
      },
      include: {
        userGroup: true
      }
    })

    if (!data) {
      throw new EntityNotExistException('Group')
    }

    const { userGroup, ...group } = data
    const code = await this.cacheManager.get<string>(invitationGroupKey(id))

    return {
      ...group,
      memberNum: userGroup.length,
      ...(code && { invitationURL: '/invite/' + code })
    }
  }

  async getGroupById(id: number) {
    const group = await this.prisma.group.findUnique({
      where: {
        id
      }
    })
    if (group == null) {
      throw new EntityNotExistException('Group')
    }
    return group
  }

  async updateCourse(id: number, input: CourseInput, user: AuthenticatedUser) {
    if (id === OPEN_SPACE_ID) {
      throw new ForbiddenAccessException('Open space cannot be updated')
    }

    if (!user.isAdmin() && !user.isSuperAdmin()) {
      const { isGroupLeader } = await this.prisma.userGroup.findUniqueOrThrow({
        where: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          userId_groupId: {
            userId: user.id,
            groupId: id
          }
        },
        select: {
          isGroupLeader: true
        }
      })

      if (!isGroupLeader) {
        throw new ForbiddenAccessException(
          'If not admin, only group leader can update a group'
        )
      }
    }

    if (!input.config.showOnList) {
      input.config.allowJoinFromSearch = false
    }

    try {
      return await this.prisma.group.update({
        where: {
          id
        },
        data: {
          groupName: input.courseTitle,
          groupType: GroupType.Course,
          config: JSON.parse(JSON.stringify(input.config)),
          courseInfo: {
            update: {
              courseNum: input.courseNum,
              classNum: input.classNum,
              professor: input.professor,
              semester: input.semester,
              email: input.email,
              website: input.website,
              office: input.office,
              phoneNum: input.phoneNum
            }
          }
        },
        select: {
          id: true,
          groupName: true,
          groupType: true,
          config: true,
          courseInfo: true
        }
      })
    } catch (error) {
      throw new UnprocessableDataException(error.message)
    }
  }

  async deleteGroup(id: number, user: AuthenticatedUser, groupType: GroupType) {
    if (id === OPEN_SPACE_ID) {
      throw new ForbiddenAccessException('Open space cannot be deleted')
    } else if (!user.isAdmin() && !user.isSuperAdmin()) {
      const { isGroupLeader } = await this.prisma.userGroup.findUniqueOrThrow({
        where: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          userId_groupId: {
            userId: user.id,
            groupId: id
          }
        },
        select: {
          isGroupLeader: true
        }
      })

      if (!isGroupLeader) {
        throw new ForbiddenAccessException(
          'If not admin, only group leader can delete a group'
        )
      }
    }

    const includeOption =
      groupType === GroupType.Course ? { courseInfo: true } : {}

    return await this.prisma.group.delete({
      where: {
        id
      },
      include: includeOption
    })
  }

  async issueInvitation(id: number) {
    const group = await this.prisma.group.findUnique({
      where: { id },
      select: {
        config: true
      }
    })
    if (!group) {
      throw new EntityNotExistException('Group')
    }
    if (!group.config?.['allowJoinWithURL']) {
      throw new ConflictFoundException(
        'Allow join by url in group configuration to make invitation'
      )
    }

    let invitation
    do {
      invitation = Math.floor(Math.random() * 16 ** 6)
        .toString(16)
        .padStart(6, '0')
    } while (await this.cacheManager.get(invitationCodeKey(invitation)))

    await this.revokeInvitation(id)
    await this.cacheManager.set(
      invitationCodeKey(invitation),
      id,
      INVIATION_EXPIRE_TIME
    )
    await this.cacheManager.set(
      invitationGroupKey(id),
      invitation,
      INVIATION_EXPIRE_TIME
    )
    return invitation
  }

  async revokeInvitation(id: number) {
    const invitation = await this.cacheManager.get<string>(
      invitationGroupKey(id)
    )
    if (!invitation) {
      return 'This group has no invitation to be revoked'
    }
    await this.cacheManager.del(invitationCodeKey(invitation))
    await this.cacheManager.del(invitationGroupKey(id))
    return `Revoked invitation code: ${invitation}`
  }
}
