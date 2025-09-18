import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Inject, Injectable } from '@nestjs/common'
import { Cache } from 'cache-manager'
import type { AuthenticatedUser } from '@libs/auth'
import { invitationCodeKey, invitationGroupKey } from '@libs/cache'
import { INVIATION_EXPIRE_TIME } from '@libs/constants'
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
    const userWithCanCreateCourse = await this.prisma.user.findUnique({
      where: {
        id: user.id
      },
      select: {
        canCreateCourse: true
      }
    })
    if (!userWithCanCreateCourse) {
      throw new EntityNotExistException('User not found')
    }
    if (!userWithCanCreateCourse.canCreateCourse) {
      throw new ForbiddenAccessException('No Access to create course')
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
              week: input.week,
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
      where: { id, groupType: GroupType.Course },
      include: {
        courseInfo: true,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        _count: { select: { userGroup: true } }
      }
    })

    if (!group) {
      throw new EntityNotExistException('Course')
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

  async deleteGroup(id: number, groupType: GroupType, user: AuthenticatedUser) {
    const userGroup = await this.prisma.userGroup.findUnique({
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

    const includeOption =
      groupType === GroupType.Course ? { courseInfo: true } : {}

    if (!userGroup || !userGroup.isGroupLeader) {
      throw new ForbiddenAccessException(
        'Only group leader can delete the group'
      )
    }

    return await this.prisma.group.delete({
      where: {
        id
      },
      include: includeOption
    })
  }

  async duplicateCourse(groupId: number, userId: number) {
    const userWithCanCreateCourse = await this.prisma.user.findUnique({
      where: {
        id: userId
      },
      select: {
        canCreateCourse: true
      }
    })
    if (!userWithCanCreateCourse) {
      throw new EntityNotExistException('User not found')
    }

    if (!userWithCanCreateCourse.canCreateCourse) {
      throw new ForbiddenAccessException('No Access to create course')
    }

    const { courseInfo, ...originCourse } =
      await this.prisma.group.findUniqueOrThrow({
        where: {
          id: groupId
        },
        select: {
          groupName: true,
          groupType: true,
          courseInfo: true,
          config: true,
          assignment: {
            select: {
              id: true
            }
          }
        }
      })

    if (!courseInfo) {
      throw new UnprocessableDataException('Invalid groupId for a course')
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { groupId: _, ...duplicatedCourseInfo } = courseInfo

    const duplicatedCourse = await this.prisma.$transaction(async (tx) => {
      const duplicatedCourse = await tx.group.create({
        data: {
          groupName: originCourse.groupName,
          groupType: originCourse.groupType,
          config: originCourse.config ?? {
            showOnList: true,
            allowJoinFromSearch: true,
            allowJoinWithURL: true,
            requireApprovalBeforeJoin: false
          },
          courseInfo: {
            create: duplicatedCourseInfo
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
      await tx.userGroup.create({
        data: {
          user: {
            connect: { id: userId }
          },
          group: {
            connect: { id: duplicatedCourse.id }
          },
          isGroupLeader: true
        }
      })

      return duplicatedCourse
    })

    let result = await Promise.all(
      originCourse.assignment.map(async ({ id: assignmentId }) => {
        const [assignmentFound, assignmentProblemsFound] = await Promise.all([
          this.prisma.assignment.findFirst({
            where: {
              id: assignmentId,
              groupId
            }
          }),
          this.prisma.assignmentProblem.findMany({
            where: {
              assignmentId
            }
          })
        ])

        if (!assignmentFound) {
          throw new EntityNotExistException('assignment')
        }

        // if assignment status is ongoing, visible would be true. else, false
        const now = new Date()
        let newVisible = false
        if (
          assignmentFound.startTime <= now &&
          now <= assignmentFound.endTime
        ) {
          newVisible = true
        }

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, createTime, updateTime, title, ...assignmentDataToCopy } =
          assignmentFound

        try {
          return await this.prisma.$transaction(async (tx) => {
            const newAssignment = await tx.assignment.create({
              data: {
                ...assignmentDataToCopy,
                title,
                createdById: userId,
                groupId: duplicatedCourse.id,
                isVisible: newVisible
              }
            })

            // 2. copy assignment problems
            await Promise.all(
              assignmentProblemsFound.map((assignmentProblem) =>
                tx.assignmentProblem.create({
                  data: {
                    order: assignmentProblem.order,
                    assignmentId: newAssignment.id,
                    problemId: assignmentProblem.problemId,
                    score: assignmentProblem.score
                  }
                })
              )
            )

            return id
          })
        } catch {
          return null
        }
      })
    )

    result = result.filter((x) => x !== null)

    return {
      duplicatedCourse,
      originAssignments: originCourse.assignment.map(
        (assignment) => assignment.id
      ),
      copiedAssignments: result
    }
  }
}

@Injectable()
export class InvitationService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
  ) {}
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
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
      select: { groupType: true }
    })

    if (!group) {
      throw new EntityNotExistException('Group')
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      throw new EntityNotExistException('User')
    }

    const isAlreadyMember = await this.prisma.userGroup.findUnique({
      where: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        userId_groupId: {
          userId,
          groupId
        }
      }
    })

    if (isAlreadyMember) {
      throw new UnprocessableDataException('Already a member')
    }

    if (group.groupType !== GroupType.Course) {
      return await this.prisma.userGroup.create({
        data: {
          user: {
            connect: { id: userId }
          },
          group: {
            connect: { id: groupId }
          },
          isGroupLeader
        },
        select: {
          userId: true,
          groupId: true,
          isGroupLeader: true,
          user: true
        }
      })
    } else {
      const assignmentIds = await this.prisma.assignment.findMany({
        where: {
          groupId
        },
        select: {
          id: true,
          assignmentProblem: {
            select: { problemId: true }
          }
        }
      })
      const [userGroup] = await this.prisma.$transaction([
        this.prisma.userGroup.create({
          data: {
            user: {
              connect: { id: userId }
            },
            group: {
              connect: { id: groupId }
            },
            isGroupLeader
          },
          select: {
            userId: true,
            groupId: true,
            isGroupLeader: true,
            user: true
          }
        }),
        this.prisma.assignmentRecord.createMany({
          data: assignmentIds.map(({ id }) => ({
            userId,
            assignmentId: id
          }))
        }),
        this.prisma.assignmentProblemRecord.createMany({
          data: assignmentIds.flatMap(({ id, assignmentProblem }) =>
            assignmentProblem.map(({ problemId }) => ({
              userId,
              assignmentId: id,
              problemId
            }))
          )
        })
      ])
      return userGroup
    }
  }
}

@Injectable()
export class WhitelistService {
  constructor(private readonly prisma: PrismaService) {}

  async getWhitelist(groupId: number) {
    return (
      await this.prisma.groupWhitelist.findMany({
        where: {
          groupId
        },
        select: {
          studentId: true
        }
      })
    ).map((whitelist) => whitelist.studentId)
  }

  async createWhitelist(groupId: number, studentIds: [string]) {
    this.deleteWhitelist(groupId)

    const whitelistData = studentIds.map((studentId) => ({
      groupId,
      studentId
    }))

    try {
      return (
        await this.prisma.groupWhitelist.createMany({
          data: whitelistData
        })
      ).count
    } catch (err) {
      if (err.code === 'P2002') {
        throw new UnprocessableDataException('Duplicate studentId(s) detected')
      } else if (err.code === 'P2003') {
        throw new UnprocessableDataException('Invalid groupId')
      } else {
        throw err
      }
    }
  }

  async deleteWhitelist(groupId: number) {
    return (
      await this.prisma.groupWhitelist.deleteMany({
        where: {
          groupId
        }
      })
    ).count
  }
}
