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

  /**
   * 새로운 강좌(Course)를 생성합니다.
   *
   * @param input - 강좌 생성 정보 (제목, 설명, 학기, 설정 등)
   * @param user - 요청한 사용자 (생성 권한이 필요함)
   * @returns 생성된 강좌 객체 (Partial)
   *
   * @throws EntityNotExistException - 사용자가 존재하지 않는 경우
   * @throws ForbiddenAccessException - 사용자가 강좌 생성 권한(canCreateCourse)을 가지고 있지 않은 경우
   * @throws UnprocessableDataException - 강좌 생성 중 DB 에러 발생 시
   */
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

  /**
   * 강좌(Course) 목록을 조회합니다.
   *
   * @param cursor - 페이지네이션 커서 (이전 페이지의 마지막 ID)
   * @param take - 가져올 항목의 개수
   * @returns 강좌 목록과 각 강좌의 멤버 수(memberNum)
   *
   * @remarks
   * 성능 최적화를 위해 `userGroup` 전체 관계를 로드하는 대신 `_count`를 사용하여 멤버 수를 조회합니다.
   */
  async getCourses(cursor: number | null, take: number) {
    const paginator = this.prisma.getPaginator(cursor)

    const groups = await this.prisma.group.findMany({
      ...paginator,
      take,
      where: {
        groupType: GroupType.Course
      },
      select: {
        id: true,
        groupName: true,
        config: true,
        courseInfo: true,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        _count: {
          select: { userGroup: true }
        }
      }
    })

    return groups.map(({ _count, ...rest }) => ({
      ...rest,
      memberNum: _count.userGroup
    }))
  }

  /**
   * 사용자가 리더(Leader)로 속해 있는 그룹 목록을 조회합니다.
   *
   * @param userId - 사용자 ID
   * @param groupType - 조회할 그룹 타입 (예: GroupType.Course)
   * @returns 그룹 목록과 각 그룹의 멤버 수(memberNum)
   *
   * @remarks
   * `getCourses`와 마찬가지로 `_count`를 사용하여 멤버 수를 효율적으로 조회합니다.
   */
  async getGroupsUserLead(userId: number, groupType: GroupType) {
    return (
      await this.prisma.userGroup.findMany({
        where: {
          userId,
          isGroupLeader: true,
          group: {
            groupType
          }
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
    ).map(({ group }) => {
      const { _count, ...rest } = group
      return {
        ...rest,
        memberNum: _count.userGroup
      }
    })
  }

  /**
   * 특정 강좌의 상세 정보를 조회합니다.
   *
   * @param id - 조회할 강좌 ID
   * @returns 강좌 상세 정보, 멤버 수, 초대 코드(존재 시)
   *
   * @throws EntityNotExistException - 강좌가 존재하지 않는 경우
   *
   * @remarks
   * - Redis 캐시를 확인하여 유효한 초대 코드(invitation)가 있다면 함께 반환합니다.
   * - `include` 대신 `_count`를 사용하여 멤버 수를 조회합니다.
   */
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

  /**
   * 강좌 정보를 수정합니다.
   *
   * @param id - 수정할 강좌 ID
   * @param input - 변경할 강좌 정보 (설정, CourseInfo 포함)
   * @returns 수정된 강좌 객체
   *
   * @throws UnprocessableDataException - 업데이트 중 DB 에러 발생 시
   *
   * @remarks
   * `showOnList` 설정이 false일 경우 `allowJoinFromSearch`도 강제로 false로 설정됩니다.
   */
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

  /**
   * 그룹(또는 강좌)을 삭제합니다.
   *
   * @param id - 삭제할 그룹 ID
   * @param groupType - 그룹 타입 (Course인 경우 연관된 CourseInfo도 함께 삭제 처리됨)
   * @param user - 요청한 사용자
   * @returns 삭제된 그룹 객체
   *
   * @throws ForbiddenAccessException - 요청한 사용자가 그룹 리더가 아닌 경우
   *
   * @remarks
   * 그룹의 리더(Group Leader)만이 삭제 권한을 가집니다.
   */
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

  /**
   * 기존 강좌를 복제하여 새로운 강좌를 생성합니다.
   *
   * @param groupId - 복제할 원본 강좌의 ID
   * @param userId - 복제를 요청한 관리자(User)의 ID
   * @returns 복제된 강좌 정보, 원본 과제 ID 목록, 복제된 과제 ID 목록
   *
   * @throws EntityNotExistException - 사용자가 존재하지 않는 경우
   * @throws ForbiddenAccessException - 강좌 생성 권한이 없는 경우
   * @throws UnprocessableDataException - 원본 강좌의 CourseInfo가 유효하지 않은 경우
   *
   * @remarks
   * - `include`로 모든 연관 데이터를 가져온 후, 불필요한 필드(id, createTime 등)를 제외하고 복사합니다.
   * - 과제(Assignment)와 문제(AssignmentProblem)도 함께 복제됩니다.
   */
  async duplicateCourse(groupId: number, userId: number) {
    const userWithCanCreateCourse = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { canCreateCourse: true }
    })
    if (!userWithCanCreateCourse) {
      throw new EntityNotExistException('User not found')
    }
    if (!userWithCanCreateCourse.canCreateCourse) {
      throw new ForbiddenAccessException('No Access to create course')
    }

    const originCourse = await this.prisma.group.findUniqueOrThrow({
      where: { id: groupId },
      select: {
        groupName: true,
        groupType: true,
        courseInfo: true,
        config: true,
        assignment: {
          include: {
            assignmentProblem: {
              select: {
                order: true,
                problemId: true,
                score: true
              }
            }
          }
        }
      }
    })

    if (!originCourse.courseInfo) {
      throw new UnprocessableDataException('Invalid groupId for a course')
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { groupId: _, ...duplicatedCourseInfo } = originCourse.courseInfo

    return await this.prisma.$transaction(async (tx) => {
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
          user: { connect: { id: userId } },
          group: { connect: { id: duplicatedCourse.id } },
          isGroupLeader: true
        }
      })

      const copiedAssignments: number[] = []
      const originAssignmentIds: number[] = []

      const now = new Date()

      for (const assignment of originCourse.assignment) {
        originAssignmentIds.push(assignment.id)

        const isVisible =
          assignment.startTime <= now && now <= assignment.endTime

        // prettier-ignore
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, createTime, updateTime, groupId, assignmentProblem, ...assignmentData } = assignment

        const newAssignment = await tx.assignment.create({
          data: {
            ...assignmentData,
            createdById: userId,
            groupId: duplicatedCourse.id,
            isVisible
          }
        })

        copiedAssignments.push(newAssignment.id)

        if (assignmentProblem && assignmentProblem.length > 0) {
          await tx.assignmentProblem.createMany({
            data: assignmentProblem.map((ap) => ({
              order: ap.order,
              assignmentId: newAssignment.id,
              problemId: ap.problemId,
              score: ap.score
            }))
          })
        }
      }

      return {
        duplicatedCourse,
        originAssignments: originAssignmentIds,
        copiedAssignments
      }
    })
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

    const qna = await this.prisma.courseQnA.findUnique({
      where: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        groupId_order: {
          groupId,
          order
        }
      },
      select: { id: true }
    })

    if (!qna) {
      throw new EntityNotExistException('CourseQnA')
    }

    return await this.prisma.courseQnA.update({
      where: { id: qna.id },
      data
    })
  }

  async deleteCourseQnA(groupId: number, order: number) {
    const qna = await this.prisma.courseQnA.findUnique({
      where: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        groupId_order: {
          groupId,
          order
        }
      },
      select: { id: true }
    })

    if (!qna) {
      throw new EntityNotExistException('CourseQnA')
    }

    return await this.prisma.courseQnA.delete({ where: { id: qna.id } })
  }

  async createCourseQnAComment(
    userId: number,
    groupId: number,
    order: number,
    content: string
  ) {
    const qna = await this.prisma.courseQnA.findUnique({
      where: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        groupId_order: {
          groupId,
          order
        }
      },
      select: { id: true, readBy: true }
    })

    if (!qna) {
      throw new EntityNotExistException('CourseQnA')
    }

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
          isCourseStaff: true,
          order: newOrder
        }
      })

      const isAlreadyRead = qna.readBy.includes(userId)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updateData: any = { isResolved: true }

      if (!isAlreadyRead) {
        updateData.readBy = { push: userId }
      }

      await tx.courseQnA.update({
        where: { id: qna.id },
        data: updateData
      })
      return comment
    })
  }

  async updateCourseQnAComment(
    groupId: number,
    qnaOrder: number,
    commentOrder: number,
    content: string
  ) {
    const qna = await this.prisma.courseQnA.findUnique({
      where: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        groupId_order: {
          groupId,
          order: qnaOrder
        }
      },
      select: { id: true }
    })

    if (!qna) {
      throw new EntityNotExistException('CourseQnA')
    }

    // Comment ID 조회
    const comment = await this.prisma.courseQnAComment.findUnique({
      where: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        courseQnAId_order: { courseQnAId: qna.id, order: commentOrder }
      },
      select: { id: true }
    })

    if (!comment) {
      throw new EntityNotExistException('CourseQnAComment')
    }

    return await this.prisma.courseQnAComment.update({
      where: { id: comment.id },
      data: { content }
    })
  }

  async deleteCourseQnAComment(
    groupId: number,
    qnaOrder: number,
    commentOrder: number
  ) {
    const qna = await this.prisma.courseQnA.findFirst({
      where: {
        groupId,
        order: qnaOrder
      },
      select: {
        id: true
      }
    })

    if (!qna) {
      throw new EntityNotExistException('CourseQnA')
    }
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
