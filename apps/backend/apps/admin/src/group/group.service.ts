import { CACHE_MANAGER } from '@nestjs/cache-manager'
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException
} from '@nestjs/common'
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

  async getCourses(cursor: number | null, take: number) {
    const paginator = this.prisma.getPaginator(cursor)

    return (
      await this.prisma.group.findMany({
        ...paginator,
        take,
        where: {
          groupType: GroupType.Course
        },
        select: {
          id: true,
          groupName: true,
          config: true,
          userGroup: true,
          courseInfo: true
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

  async getCourse(id: number) {
    const group = await this.prisma.group.findUnique({
      where: { id },
      include: {
        courseInfo: true,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        _count: { select: { userGroup: true } }
      }
    })

    if (!group) {
      throw new EntityNotExistException('Group')
    }

    const code = await this.cacheManager.get<string>(invitationGroupKey(id))

    return {
      ...group,
      memberNum: group._count.userGroup,
      ...(code && { invitation: code })
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

  async updateCourse(id: number, input: CourseInput) {
    if (id === OPEN_SPACE_ID) {
      throw new ForbiddenAccessException('Open space cannot be updated')
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

  async deleteGroup(id: number, groupType: GroupType) {
    if (id === OPEN_SPACE_ID) {
      throw new ForbiddenAccessException('Open space cannot be deleted')
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

  async allowCourseCreation(userId: number) {
    return await this.prisma.user.update({
      where: {
        id: userId
      },
      data: {
        canCreateCourse: true
      },
      select: {
        id: true,
        role: true,
        canCreateCourse: true
      }
    })
  }

  async revokeCourseCreation(userId: number) {
    return await this.prisma.user.update({
      where: {
        id: userId
      },
      data: {
        canCreateCourse: false
      },
      select: {
        id: true,
        role: true,
        canCreateCourse: true
      }
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

  async inviteUser(groupId: number, userId: number, isGroupLeader: boolean) {
    try {
      return await this.prisma.userGroup.create({
        data: {
          user: {
            connect: { id: userId }
          },
          group: {
            connect: { id: groupId }
          },
          isGroupLeader
        }
      })
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('User or Group not found')
      } else if (error.code === 'P2002') {
        throw new UnprocessableDataException('Already a member')
      }
    }
  }

  async kickUser(groupId: number, userId: number) {
    try {
      const isGroupLeader = await this.prisma.userGroup.findUniqueOrThrow({
        where: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          userId_groupId: {
            userId,
            groupId
          }
        },
        select: {
          isGroupLeader: true
        }
      })

      if (isGroupLeader) {
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

      return await this.prisma.userGroup.delete({
        where: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          userId_groupId: {
            userId,
            groupId
          }
        }
      })
    } catch {
      throw new UnprocessableDataException('Not a member')
    }
  }

  async updateIsGroupLeader(
    groupId: number,
    userId: number,
    isGroupLeader: boolean
  ) {
    try {
      if (!isGroupLeader) {
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

      return await this.prisma.userGroup.update({
        where: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          userId_groupId: {
            userId,
            groupId
          }
        },
        data: {
          isGroupLeader
        }
      })
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('User or Group not found')
      }
    }
  }
}
