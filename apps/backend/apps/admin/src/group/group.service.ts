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
import type {
  CreateCourseNoticeInput,
  UpdateCourseNoticeInput
} from './model/course-notice.input'
import type { UpdateCourseQnAInput } from './model/course-qna.input'
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
export class CourseNoticeService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   *  한 강의 공지사항에 대해 모든 유저의 읽음 기록을 초기화합니다.
   *
   * @param {number} groupId
   * @param {number} courseNoticeId
   */
  async markAsUnread(groupId: number, courseNoticeId: number) {
    const userIds = await this.prisma.userGroup.findMany({
      where: {
        groupId
      },
      select: {
        userId: true
      }
    })

    if (userIds.length == 0) {
      throw new EntityNotExistException('course user is not found')
    }

    await this.prisma.courseNotice.update({
      where: {
        id: courseNoticeId
      },
      data: {
        readBy: {
          set: []
        }
      }
    })
  }

  /**
   * 공지사항을 1개 만듭니다.
   *
   * @param {number} userId 접근하려는 유저 아이디
   * @param {CreateCourseNoticeInput} createCourseNoticeInput 공지사항 내용 (groupId, title, content, isFixed, isPublic)
   * @returns {CourseNotice}
   */
  async createCourseNotice(
    userId: number,
    createCourseNoticeInput: CreateCourseNoticeInput
  ) {
    const courseNotice = await this.prisma.courseNotice.create({
      data: {
        createdById: userId,
        ...createCourseNoticeInput
      }
    })

    return courseNotice
  }

  /**
   * 강의 내 공지 1개를 삭제합니다.
   *
   * @param {number} courseNoticeId 강의 공지 아이디
   * @returns {CourseNotice}
   */
  async deleteCourseNotice(courseNoticeId: number) {
    return await this.prisma.courseNotice.delete({
      where: {
        id: courseNoticeId
      }
    })
  }

  /**
   * 강의 내 공지 1개를 수정합니다.
   * (읽음 기록을 초기화합니다.)
   *
   * @param {number} courseNoticeId 강의 공지 아이디
   * @param {UpdateCourseNoticeInput} updateCourseNoticeInput 수정할 공지사항 내용 (title, content, isFixed, isPublic 등 옵셔널)
   * @returns {CourseNotice}
   */
  async updateCourseNotice(
    courseNoticeId: number,
    updateCourseNoticeInput: UpdateCourseNoticeInput
  ) {
    const courseNotice = await this.prisma.courseNotice.findUnique({
      where: {
        id: courseNoticeId
      },
      select: {
        groupId: true
      }
    })

    if (!courseNotice) {
      throw new EntityNotExistException('CourseNotice')
    }

    await this.markAsUnread(courseNotice.groupId, courseNoticeId)

    return await this.prisma.courseNotice.update({
      where: {
        id: courseNoticeId
      },
      data: updateCourseNoticeInput
    })
  }

  /**
   * 한 강의 내 공지사항 여러 개를 다른 강의로 복제합니다.
   *
   * @param {number} userId 유저 아이디 (복제된 공지의 작성자로 설정됩니다.)
   * @param {number[]} courseNoticeIds 복제할 공지 아이디 목록
   * @param {number} cloneToId 복제해 넣을 강의 아이디
   * @returns {CourseNotice[]}
   */
  async cloneCourseNotice(
    userId: number,
    courseNoticeIds: number[],
    cloneToId: number
  ) {
    const originals = await this.prisma.courseNotice.findMany({
      where: {
        id: {
          in: courseNoticeIds
        }
      },
      select: {
        title: true,
        content: true,
        isFixed: true,
        isPublic: true
      }
    })

    if (originals.length == 0) {
      throw new EntityNotExistException('CourseNotice')
    }

    const clones = await this.prisma.courseNotice.createManyAndReturn({
      data: originals.map((original) => {
        return {
          createdById: userId,
          groupId: cloneToId,
          title: original.title,
          content: original.content,
          isFixed: original.isFixed,
          isPublic: original.isPublic
        }
      })
    })

    return clones
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

@Injectable()
export class CourseService {
  constructor(private readonly prisma: PrismaService) {}

  async getCourseQnAs(groupId: number, cursor: number | null, take: number) {
    const paginator = this.prisma.getPaginator(cursor) // PrismaService의 헬퍼 사용

    return await this.prisma.courseQnA.findMany({
      ...paginator,
      take,
      where: { groupId },
      include: { createdBy: { select: { username: true } } },
      orderBy: { order: 'desc' }
    })
  }

  async getCourseQnA(groupId: number, order: number) {
    const qna = await this.prisma.courseQnA.findUnique({
      where: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        groupId_order: { groupId, order }
      },
      include: {
        createdBy: { select: { username: true } },
        comments: {
          include: { createdBy: { select: { username: true } } },
          orderBy: { order: 'asc' }
        }
      }
    })
    if (!qna) {
      throw new EntityNotExistException('CourseQnA')
    }
    return qna
  }

  async updateCourseQnA(groupId: number, input: UpdateCourseQnAInput) {
    const { order, ...data } = input
    const qna = await this.getCourseQnA(groupId, order)

    return await this.prisma.courseQnA.update({
      where: { id: qna.id },
      data
    })
  }

  async deleteCourseQnA(groupId: number, order: number) {
    const qna = await this.getCourseQnA(groupId, order)
    return await this.prisma.courseQnA.delete({ where: { id: qna.id } })
  }

  async createCourseQnAComment(
    userId: number,
    groupId: number,
    order: number,
    content: string
  ) {
    const qna = await this.getCourseQnA(groupId, order)

    return await this.prisma.$transaction(async (tx) => {
      const maxOrder = await tx.courseQnAComment.aggregate({
        where: { courseQnAId: qna.id },
        // eslint-disable-next-line @typescript-eslint/naming-convention
        _max: { order: true }
      })
      const newOrder = (maxOrder._max?.order ?? 0) + 1

      const comment = await tx.courseQnAComment.create({
        data: {
          content,
          courseQnAId: qna.id,
          createdById: userId,
          isCourseStaff: true, // Admin API에서는 항상 true
          order: newOrder
        }
      })

      await tx.courseQnA.update({
        where: { id: qna.id },
        data: {
          isResolved: true,
          readBy: { set: [userId] }
        }
      })
      return comment
    })
  }

  async deleteCourseQnAComment(
    groupId: number,
    qnaOrder: number,
    commentOrder: number
  ) {
    const qna = await this.getCourseQnA(groupId, qnaOrder)
    const comment = await this.prisma.courseQnAComment.findUnique({
      where: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        courseQnAId_order: { courseQnAId: qna.id, order: commentOrder }
      }
    })

    if (!comment) {
      throw new EntityNotExistException('CourseQnAComment')
    }

    return await this.prisma.$transaction(async (tx) => {
      const deletedComment = await tx.courseQnAComment.delete({
        where: { id: comment.id }
      })

      const lastComment = await tx.courseQnAComment.findFirst({
        where: { courseQnAId: qna.id },
        orderBy: { order: 'desc' },
        select: { isCourseStaff: true }
      })

      const isResolved = lastComment ? lastComment.isCourseStaff : false
      await tx.courseQnA.update({
        where: { id: qna.id },
        data: { isResolved }
      })

      return deletedComment
    })
  }
}
