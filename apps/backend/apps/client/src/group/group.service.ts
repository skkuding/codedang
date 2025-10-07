import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Inject, Injectable, NotAcceptableException } from '@nestjs/common'
import { GroupType, Role, type Prisma, type UserGroup } from '@prisma/client'
import { Cache } from 'cache-manager'
import { invitationCodeKey, joinGroupCacheKey } from '@libs/cache'
import { JOIN_GROUP_REQUEST_EXPIRE_TIME } from '@libs/constants'
import {
  ConflictFoundException,
  EntityNotExistException,
  ForbiddenAccessException,
  UnprocessableDataException
} from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import type { GroupJoinRequest } from '@libs/types'
import type {
  CreateCourseNoticeCommentDto,
  UpdateCourseNoticeCommentDto
} from './dto/courseNotice.dto'
import { CourseNoticeOrder } from './enum/course-notice-order.enum'
import type { UserGroupData } from './interface/user-group-data.interface'

@Injectable()
export class GroupService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
  ) {}

  async getCourse(groupId: number, userId: number, invited = false) {
    const isJoined = await this.prisma.userGroup.findUnique({
      where: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        userId_groupId: {
          userId,
          groupId
        }
      },
      select: {
        group: {
          select: {
            id: true,
            groupName: true,
            groupType: true,
            courseInfo: {
              select: {
                courseNum: true,
                classNum: true,
                professor: true,
                semester: true,
                week: true,
                email: true,
                phoneNum: true,
                office: true,
                website: true
              }
            }
          }
        },
        isGroupLeader: true
      }
    })

    if (!isJoined) {
      const filter = invited ? 'allowJoinWithURL' : 'showOnList'
      const group = await this.prisma.group.findUniqueOrThrow({
        where: {
          id: groupId,
          config: {
            path: [filter],
            equals: true
          }
        },
        select: {
          id: true,
          groupName: true,
          groupType: true,
          courseInfo: {
            select: {
              courseNum: true,
              classNum: true,
              professor: true,
              semester: true
            }
          }
        }
      })

      return {
        ...group,
        isJoined: false
      }
    } else {
      return {
        ...isJoined.group,
        isGroupLeader: isJoined.isGroupLeader,
        isJoined: true
      }
    }
  }

  async getGroupByInvitation(code: string, userId: number) {
    const groupId = await this.cacheManager.get<number>(invitationCodeKey(code))
    if (!groupId) {
      throw new EntityNotExistException('Invalid invitation')
    }
    return this.getCourse(groupId, userId, true)
  }

  async getGroupLeaders(groupId: number): Promise<string[]> {
    const leaders = (
      await this.prisma.userGroup.findMany({
        where: {
          groupId,
          isGroupLeader: true
        },
        select: {
          user: {
            select: {
              username: true
            }
          }
        }
      })
    ).map((leader) => leader.user.username)

    return leaders
  }

  async getGroupMembers(groupId: number): Promise<string[]> {
    const members = (
      await this.prisma.userGroup.findMany({
        where: {
          groupId,
          isGroupLeader: false
        },
        select: {
          user: {
            select: {
              username: true
            }
          }
        }
      })
    ).map((member) => member.user.username)

    return members
  }

  async getGroups(cursor: number | null, take: number) {
    const paginator = this.prisma.getPaginator(cursor)

    const groups = (
      await this.prisma.group.findMany({
        ...paginator,
        take,
        where: {
          NOT: {
            id: 1
          },
          config: {
            path: ['showOnList'],
            equals: true
          }
        },
        select: {
          id: true,
          groupName: true,
          description: true,
          userGroup: true
        }
      })
    ).map((group) => {
      return {
        id: group.id,
        groupName: group.groupName,
        description: group.description,
        memberNum: group.userGroup.length
      }
    })

    const total = await this.prisma.group.count({
      where: {
        NOT: {
          id: 1
        },
        config: {
          path: ['showOnList'],
          equals: true
        }
      }
    })

    return { data: groups, total }
  }

  async getJoinedGroups(userId: number, groupType: GroupType) {
    return (
      await this.prisma.userGroup.findMany({
        where: {
          NOT: {
            groupId: 1
          },
          userId
        },
        select: {
          group: {
            select: {
              id: true,
              groupName: true,
              groupType: true,
              description: groupType === GroupType.Study,
              // eslint-disable-next-line @typescript-eslint/naming-convention
              _count: { select: { userGroup: true } },
              courseInfo: groupType === GroupType.Course
            }
          },
          isGroupLeader: true
        },
        orderBy: { createTime: 'desc' }
      })
    )
      .filter(({ group }) => groupType === group.groupType)
      .map(({ group, isGroupLeader }) => {
        return {
          id: group.id,
          groupName: group.groupName,
          ...(group.description && { description: group.description }),
          memberNum: group._count.userGroup,
          isGroupLeader,
          ...(group.courseInfo && { courseInfo: group.courseInfo })
        }
      })
  }

  async joinGroupById(
    userId: number,
    groupId: number,
    invitation: string
  ): Promise<{ userGroupData: Partial<UserGroup>; isJoined: boolean }> {
    const invitedGroupId = await this.cacheManager.get<number>(
      invitationCodeKey(invitation)
    )
    if (!invitedGroupId || groupId !== invitedGroupId) {
      throw new ForbiddenAccessException('Invalid invitation')
    }

    const filter = invitation ? 'allowJoinWithURL' : 'allowJoinFromSearch'
    const group = await this.prisma.group.findUniqueOrThrow({
      where: {
        id: groupId,
        config: {
          path: [filter],
          equals: true
        }
      },
      select: {
        config: true,
        groupType: true,
        userGroup: {
          select: {
            userId: true
          }
        }
      }
    })

    const isJoined = group.userGroup.some(
      (joinedUser) => joinedUser.userId === userId
    )

    if (isJoined) {
      throw new ConflictFoundException('Already joined this group')
    } else if (group.config?.['requireApprovalBeforeJoin']) {
      const groupJoinRequests =
        (await this.cacheManager.get<GroupJoinRequest[]>(
          joinGroupCacheKey(groupId)
        )) || []

      if (groupJoinRequests) {
        const validRequests = groupJoinRequests.filter(
          (req) => req.expiresAt > Date.now()
        )
        if (validRequests.find((req) => req.userId === userId)) {
          throw new ConflictFoundException(
            'Already requested to join this group'
          )
        }
      }

      const newRequest: GroupJoinRequest = {
        userId,
        expiresAt: Date.now() + JOIN_GROUP_REQUEST_EXPIRE_TIME
      }
      groupJoinRequests.push(newRequest)

      await this.cacheManager.set(
        joinGroupCacheKey(groupId),
        groupJoinRequests,
        JOIN_GROUP_REQUEST_EXPIRE_TIME
      )

      return {
        userGroupData: {
          userId,
          groupId
        },
        isJoined: false
      }
    } else {
      const whitelist = (
        await this.prisma.groupWhitelist.findMany({
          where: {
            groupId
          },
          select: {
            studentId: true
          }
        })
      ).map((list) => list.studentId)

      if (whitelist.length) {
        const { studentId } = await this.prisma.user.findUniqueOrThrow({
          where: { id: userId },
          select: {
            studentId: true
          }
        })

        if (!whitelist.includes(studentId)) {
          throw new ForbiddenAccessException('Whitelist violation')
        }
      }

      const userGroupData: UserGroupData = {
        userId,
        groupId,
        isGroupLeader: false
      }

      return {
        userGroupData: await this.createUserGroup(userGroupData),
        isJoined: true
      }
    }
  }

  async leaveGroup(userId: number, groupId: number): Promise<UserGroup> {
    const groupLeaders = await this.prisma.userGroup.findMany({
      where: {
        isGroupLeader: true,
        groupId
      },
      select: {
        userId: true,
        group: {
          select: {
            groupType: true
          }
        }
      }
    })
    if (groupLeaders.length <= 1 && groupLeaders[0].userId == userId) {
      throw new ConflictFoundException('One or more leaders are required')
    }

    if (groupLeaders[0].group.groupType === GroupType.Course) {
      const assignmentIds = await this.prisma.assignment.findMany({
        where: {
          groupId
        },
        select: {
          id: true
        }
      })

      await this.prisma.assignmentRecord.deleteMany({
        where: {
          userId,
          assignmentId: {
            in: assignmentIds.map(({ id }) => id)
          }
        }
      })
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
  }

  async createUserGroup(userGroupData: UserGroupData): Promise<UserGroup> {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: {
        id: userGroupData.userId
      }
    })

    if (user && (user.role === Role.SuperAdmin || user.role === Role.Admin)) {
      userGroupData.isGroupLeader = true
    }

    const group = await this.prisma.group.findUnique({
      where: {
        id: userGroupData.groupId
      },
      select: {
        groupType: true
      }
    })

    if (!group) {
      throw new EntityNotExistException('Group')
    }

    if (group.groupType !== GroupType.Course) {
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
    } else {
      const assignmentIds = await this.prisma.assignment.findMany({
        where: {
          groupId: userGroupData.groupId
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
              connect: { id: userGroupData.userId }
            },
            group: {
              connect: { id: userGroupData.groupId }
            },
            isGroupLeader: userGroupData.isGroupLeader
          }
        }),
        this.prisma.assignmentRecord.createMany({
          data: assignmentIds.map(({ id }) => ({
            userId: userGroupData.userId,
            assignmentId: id
          }))
        }),
        this.prisma.assignmentProblemRecord.createMany({
          data: assignmentIds.flatMap(({ id, assignmentProblem }) =>
            assignmentProblem.map(({ problemId }) => ({
              userId: userGroupData.userId,
              assignmentId: id,
              problemId
            }))
          )
        })
      ])
      return userGroup
    }
  }

  /* Grade와 Assignment 메뉴의 통합으로 필요없어졌으나..
  추후 여러 Assignment의 grade를 한번에 확인할 API가 필요해질 경우에 대비하여 남겨둠
  async getAssignmentGradeSummary(userId: number, groupId: number) {
    const assignmentRecords = await this.prisma.assignmentRecord.findMany({
      where: { userId, assignment: { groupId } },
      select: { assignmentId: true }
    })

    const assignmentIds = assignmentRecords.map((record) => record.assignmentId)

    const assignments = await this.prisma.assignment.findMany({
      where: {
        id: { in: assignmentIds }
      },
      select: {
        id: true,
        title: true,
        endTime: true,
        isFinalScoreVisible: true,
        isJudgeResultVisible: true,
        autoFinalizeScore: true,
        week: true,
        assignmentProblem: {
          select: {
            problemId: true,
            order: true,
            score: true,
            problem: {
              select: {
                id: true,
                title: true
              }
            }
          },
          orderBy: { order: 'asc' }
        }
      },
      orderBy: [{ week: 'asc' }, { endTime: 'asc' }]
    })

    const allAssignmentProblemRecords =
      await this.prisma.assignmentProblemRecord.findMany({
        where: {
          userId,
          assignmentId: { in: assignmentIds }
        },
        select: {
          assignmentId: true,
          problemId: true,
          isSubmitted: true,
          score: true,
          finalScore: true,
          comment: true
        }
      })

    const problemRecordsByAssignment = allAssignmentProblemRecords.reduce(
      (grouped, record) => {
        if (!grouped[record.assignmentId]) {
          grouped[record.assignmentId] = []
        }
        grouped[record.assignmentId].push(record)
        return grouped
      },
      {} as Record<number, typeof allAssignmentProblemRecords>
    )

    const formattedAssignments = assignments.map((assignment) => {
      const assignmentProblemRecords =
        problemRecordsByAssignment[assignment.id] || []

      const problemRecordMap = assignmentProblemRecords.reduce(
        (map, record) => {
          if (assignment.autoFinalizeScore) {
            record.finalScore = record.score
          }
          map[record.problemId] = {
            finalScore: assignment.isFinalScoreVisible
              ? record.finalScore
              : null,
            score: assignment.isJudgeResultVisible ? record.score : null,
            isSubmitted: record.isSubmitted,
            comment: record.comment
          }
          return map
        },
        {} as Record<
          number,
          {
            finalScore: number | null
            score: number | null
            isSubmitted: boolean
            comment: string
          }
        >
      )

      const problems = assignment.assignmentProblem.map((ap) => ({
        id: ap.problem.id,
        title: ap.problem.title,
        order: ap.order,
        maxScore: ap.score,
        problemRecord: problemRecordMap[ap.problemId] || null
      }))

      const userAssignmentFinalScore = assignmentProblemRecords.some(
        (record) => record.finalScore === null
      )
        ? null
        : assignmentProblemRecords.reduce(
            (total, { finalScore }) => total + (finalScore as number),
            0
          )

      const assignmentPerfectScore = assignment.assignmentProblem.reduce(
        (total, { score }) => total + score,
        0
      )

      const userAssignmentJudgeScore = assignmentProblemRecords.reduce(
        (total, { score }) => total + score,
        0
      )

      return {
        id: assignment.id,
        title: assignment.title,
        endTime: assignment.endTime,
        autoFinalizeScore: assignment.autoFinalizeScore,
        isFinalScoreVisible: assignment.isFinalScoreVisible,
        isJudgeResultVisible: assignment.isJudgeResultVisible,
        week: assignment.week,
        userAssignmentFinalScore: assignment.isFinalScoreVisible
          ? userAssignmentFinalScore
          : null,
        userAssignmentJudgeScore: assignment.isJudgeResultVisible
          ? userAssignmentJudgeScore
          : null,
        assignmentPerfectScore,
        problems
      }
    })

    return formattedAssignments
  }
    */

  /**
   * 유저가 접근할 수 있는 강의 공지사항인지 검사합니다.
   * public한 공지이거나 강의 수강자인 경우 true
   *
   * @param {number} id 강의 공지사항의 아이디
   * @param {number} userId 접근하려는 유저 아이디
   * @returns
   */
  async isForbiddenNotice({ id, userId }: { id: number; userId: number }) {
    const courseNotice = await this.prisma.courseNotice.findUnique({
      where: {
        id
      },
      select: {
        isPublic: true,
        groupId: true
      }
    })

    if (!courseNotice) {
      throw new EntityNotExistException('CourseNotice')
    }

    const isUserInGroup = await this.prisma.userGroup.findUnique({
      where: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        userId_groupId: {
          userId,
          groupId: courseNotice.groupId
        }
      }
    })

    return !isUserInGroup && !courseNotice.isPublic
  }

  /**
   * 한 유저가 접근할 수 있는 공지 중 읽지 않은 공지의 수를 반환합니다.
   *
   * @param {number} userId 유저 아이디
   */
  async getUnreadCourseNoticeCount({ userId }: { userId: number }) {
    const readableCount = await this.prisma.courseNotice.count({
      where: {
        OR: [
          {
            isPublic: true
          },
          {
            group: {
              userGroup: {
                some: {
                  userId
                }
              }
            }
          }
        ]
      }
    })
    const readCount = await this.prisma.courseNotice.count({
      where: {
        readBy: {
          has: userId
        },
        OR: [
          {
            group: {
              userGroup: {
                some: {
                  userId
                }
              }
            }
          },
          {
            isPublic: true
          }
        ]
      }
    })

    return {
      unreadCount: readableCount - readCount
    }
  }

  /**
   * 한 유저가 접근할 수 있는 가장 최근 공지를 띄워줍니다.
   *
   * @param {number} userId 유저 아이디
   */
  async getLatestCourseNotice({ userId }: { userId: number }) {
    const latest = await this.prisma.courseNotice.findFirst({
      where: {
        OR: [
          {
            group: {
              userGroup: {
                some: {
                  userId
                }
              }
            }
          },
          {
            isPublic: true
          }
        ]
      },
      select: {
        id: true,
        title: true,
        groupId: true,
        group: {
          select: {
            groupName: true
          }
        },
        updateTime: true,
        readBy: true
      },
      orderBy: {
        updateTime: 'desc'
      }
    })

    if (!latest) {
      throw new EntityNotExistException('CourseNotice')
    }

    const { readBy, group, ...newLatest } = latest

    return {
      ...newLatest,
      groupName: group.groupName,
      isRead: readBy.includes(userId)
    }
  }

  /**
   * 공지사항을 불러올 때 정렬 방식을 지정합니다.
   *
   * @param {CourseNoticeOrder} order 공지 정렬 방식
   * @returns orderBy로 들어가는 객체를 반환합니다.
   */
  getOrderBy(
    order: CourseNoticeOrder
  ): Prisma.CourseNoticeOrderByWithRelationInput {
    switch (order) {
      case CourseNoticeOrder.updateTimeASC:
        return { updateTime: 'asc' }
      case CourseNoticeOrder.updateTimeDESC:
        return { updateTime: 'desc' }
      case CourseNoticeOrder.createTimeASC:
        return { createTime: 'asc' }
      case CourseNoticeOrder.createTimeDESC:
        return { createTime: 'desc' }
    }
  }

  /**
   * 한 강의 내의 공지 목록을 가져옵니다.
   *
   * @param {number} userId 공지 목록을 요청한 유저 아이디
   * @param {number} groupId 공지 목록을 받아오려는 강의 아이디
   * @param {number | null} cursor 가져올 공지의 시작점
   * @param {number} take 가져올 공지의 수
   * @param {string} search 검색어
   * @param {'all' | 'unread'} readFilter 읽지 않은 공지만 가져올지 여부
   * @param {boolean} fixed 고정된 공지를 가져올지 여부
   * @param {CourseNoticeOrder | undefined} order 공지 정렬 순서
   * @returns 특정 강의 내의 공지 사항들에 대한 대략적인 정보를 반환합니다.
   */
  async getCourseNotices({
    userId,
    groupId,
    cursor,
    take,
    search,
    readFilter,
    fixed = false,
    order
  }: {
    userId: number
    groupId: number
    cursor: number | null
    take: number
    readFilter: 'all' | 'unread'
    search?: string
    fixed?: boolean
    order?: CourseNoticeOrder
  }) {
    const paginator = this.prisma.getPaginator(cursor)
    const courseNotices = await this.prisma.courseNotice.findMany({
      ...paginator,
      where: {
        isFixed: fixed,
        NOT:
          readFilter == 'unread'
            ? {
                readBy: {
                  has: userId
                }
              }
            : undefined,
        title: {
          contains: search,
          mode: 'insensitive'
        },
        groupId,
        OR: [
          {
            group: {
              userGroup: {
                some: {
                  userId
                }
              }
            }
          },
          {
            isPublic: true
          }
        ]
      },
      take,
      select: {
        id: true,
        title: true,
        updateTime: true,
        isFixed: true,
        createdBy: {
          select: {
            username: true
          }
        },
        readBy: true,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        _count: {
          select: {
            CourseNoticeComment: true
          }
        }
      },
      orderBy: order ? this.getOrderBy(order) : undefined
    })

    const data = courseNotices.map((courseNotice) => {
      const { readBy, _count, ...notice } = {
        ...courseNotice,
        commentCount: courseNotice._count.CourseNoticeComment,
        isRead: courseNotice.readBy.includes(userId),
        createdBy: courseNotice.createdBy?.username
      }

      return notice
    })

    const total = await this.prisma.courseNotice.count({
      where: {
        isFixed: fixed,
        title: {
          contains: search,
          mode: 'insensitive'
        }
      }
    })

    return { data, total }
  }

  /**
   * 특정 강의 내의 한 공지에 대해 그 내용과 자세한 정보를 조회합니다.
   *
   * @param {number} userId 조회를 요청한 유저 아이디
   * @param {number} id 강의 공지의 아이디
   * @returns 현재 공지사항의 내용과 이전/이후 공지의 아이디
   */
  async getCourseNoticeByID({ userId, id }: { userId: number; id: number }) {
    const courseNotice = await this.prisma.courseNotice.findUnique({
      where: {
        id
      },
      select: {
        groupId: true,
        isPublic: true,
        title: true,
        content: true,
        createTime: true,
        updateTime: true,
        createdBy: {
          select: {
            username: true
          }
        },
        // eslint-disable-next-line @typescript-eslint/naming-convention
        _count: {
          select: {
            CourseNoticeComment: true
          }
        }
      }
    })

    if (!courseNotice) {
      throw new EntityNotExistException('CourseNotice')
    }

    const isUserIn = await this.prisma.userGroup.findUnique({
      where: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        userId_groupId: {
          userId,
          groupId: courseNotice.groupId
        }
      }
    })

    if (!isUserIn && !courseNotice.isPublic) {
      throw new ForbiddenAccessException('it is not accessible course notice')
    }

    const current = {
      ...courseNotice,
      createdBy: courseNotice.createdBy?.username
    }

    const navigate = (pos: 'prev' | 'next') => {
      type Order = 'asc' | 'desc'
      const options =
        pos === 'prev'
          ? { compare: { lt: id }, order: 'desc' as Order }
          : { compare: { gt: id }, order: 'asc' as Order }
      return {
        where: {
          id: options.compare,
          isPublic: true
        },
        orderBy: {
          id: options.order
        },
        select: {
          id: true,
          title: true
        }
      }
    }

    await this.markAsRead({
      userId,
      courseNoticeId: id
    })

    return {
      current,
      prev: await this.prisma.courseNotice.findFirst(navigate('prev')),
      next: await this.prisma.courseNotice.findFirst(navigate('next'))
    }
  }

  /**
   * 공지사항의 읽음 여부를 기록합니다.
   *
   * @param {number} userId 공지를 조회한 유저 아이디
   * @param {number} courseNoticeId 강의 내 공지의 아이디
   * @returns 공지사항 읽음 기록
   */
  async markAsRead({
    userId,
    courseNoticeId
  }: {
    userId: number
    courseNoticeId: number
  }) {
    const courseNotice = await this.prisma.courseNotice.findUnique({
      where: {
        id: courseNoticeId
      },
      select: {
        readBy: true
      }
    })
    if (!courseNotice) {
      throw new EntityNotExistException('CorseNotice')
    }

    if (!courseNotice.readBy.includes(userId)) {
      await this.prisma.courseNotice.update({
        where: {
          id: courseNoticeId
        },
        data: {
          readBy: {
            push: userId
          }
        }
      })
    }
  }

  /**
   * 한 공지사항 내의 댓글 목록을 가져옵니다.
   * 댓글의 개수(take)는 대댓글을 포함한 댓글의 수입니다.
   *
   * @param {number} id 댓글을 조회하려는 강의 공지사항의 아이디
   * @param {number | null} cursor 가져올 댓글의 시작점
   * @param {number} take 가져올 댓글의 수
   * @returns 댓글과 그 댓글에 대한 대댓글을 구분한 리스트를 반환합니다.
   */
  async getCourseNoticeComments({
    id,
    userId,
    userRole,
    cursor,
    take
  }: {
    id: number
    userId: number
    userRole: Role
    cursor: number | null
    take: number
  }) {
    const paginator = this.prisma.getPaginator(cursor)
    const comments = await this.prisma.courseNoticeComment.findMany({
      where: {
        courseNoticeId: id
      },
      ...paginator,
      take,
      select: {
        id: true,
        createdById: true,
        createdBy: {
          select: {
            username: true,
            studentId: true
          }
        },
        isDeleted: true,
        isSecret: true,
        replyOnId: true,
        content: true,
        createdTime: true,
        updateTime: true
      },
      orderBy: {
        id: 'asc'
      }
    })

    const myRoleInCourse = await this.prisma.userGroup.findFirst({
      where: {
        userId,
        group: {
          CourseNotice: {
            some: {
              id
            }
          }
        }
      },
      select: {
        isGroupLeader: true
      }
    })

    const isPublic = await this.prisma.courseNotice.findUnique({
      where: {
        id
      },
      select: {
        isPublic: true
      }
    })

    if (!myRoleInCourse && !isPublic?.isPublic) {
      throw new ForbiddenAccessException('it is not accessable course notice')
    }

    const isVisibleSecretComment =
      userRole != Role.User || myRoleInCourse?.isGroupLeader

    type Comment = (typeof comments)[number]
    const commentDatas = comments.reduce(
      (acc, comment) => {
        if (
          !isVisibleSecretComment &&
          userId != comment.createdById &&
          comment.isSecret
        ) {
          comment = {
            ...comment,
            content: '',
            createdBy: null,
            createdById: null
          }
        }
        if (!comment.replyOnId) {
          acc.push({
            comment,
            replys: []
          })
        } else {
          const nestedOnId = acc.findIndex(
            (data) => data.comment.id === comment.replyOnId
          )
          if (nestedOnId === -1) {
            throw new UnprocessableDataException('CourseNoticeComment')
          }
          acc[nestedOnId].replys.push(comment)
        }
        return acc
      },
      [] as {
        comment: Comment
        replys: Comment[]
      }[]
    )

    return commentDatas.reverse()
  }

  /**
   * 댓글을 생성합니다.
   *
   * @param {number} userId 댓글을 작성하려는 유저 아이디
   * @param {number} id 댓글을 달려는 강의 공지사항의 아이디
   * @param {CreateCourseNoticeCommentDto} createCourseNoticeCommentDto 댓글의 내용과 대댓글을 달려는 원댓글의 아이디(없으면 대댓글 아님)
   * @returns 생성된 댓글의 정보를 반환합니다.
   * @throws {NotAcceptableException}
   *  - 댓글 내용이 1000자를 넘어갈 때
   *  - 답글에 다시 답글을 달려고 할 때
   */
  async createComment({
    userId,
    id,
    createCourseNoticeCommentDto
  }: {
    userId: number
    id: number
    createCourseNoticeCommentDto: CreateCourseNoticeCommentDto
  }) {
    if (createCourseNoticeCommentDto.content.length > 1000) {
      throw new NotAcceptableException('comment content limit is 1000')
    }

    if (await this.isForbiddenNotice({ id, userId })) {
      throw new ForbiddenAccessException('it is not accessible course notice')
    }

    if (createCourseNoticeCommentDto.replyOnId) {
      const originalComment = await this.prisma.courseNoticeComment.findUnique({
        where: {
          id: createCourseNoticeCommentDto.replyOnId
        },
        select: {
          replyOnId: true
        }
      })

      if (!originalComment) {
        throw new EntityNotExistException('CourseNoticeComment')
      }

      if (originalComment.replyOnId) {
        throw new NotAcceptableException('double replies are not allowed.')
      }
    }
    return await this.prisma.courseNoticeComment.create({
      data: {
        createdById: userId,
        courseNoticeId: id,
        ...createCourseNoticeCommentDto
      }
    })
  }

  /**
   * 댓글을 수정합니다
   *
   * @param {number} userId 댓글을 수정하려는 유저 아이디
   * @param {number} id 댓글이 달려있는 강의 공지사항의 아이디
   * @param {number} commentId 수정하려는 댓글 아이디
   * @param {UpdateCourseNoticeCommentDto} updateCourseNoticeCommentDto 수정할 댓글의 내용
   * @returns 수정된 댓글의 내용
   */
  async updateComment({
    userId,
    id,
    commentId,
    updateCourseNoticeCommentDto
  }: {
    userId: number
    id: number
    commentId: number
    updateCourseNoticeCommentDto: UpdateCourseNoticeCommentDto
  }) {
    if (await this.isForbiddenNotice({ id, userId })) {
      throw new ForbiddenAccessException('it is not accessible course notice')
    }

    return await this.prisma.courseNoticeComment.update({
      where: {
        id: commentId,
        courseNoticeId: id,
        createdById: userId
      },
      data: {
        content: updateCourseNoticeCommentDto.content,
        isSecret: updateCourseNoticeCommentDto.isSecret
      }
    })
  }

  /**
   * 댓글을 삭제합니다.
   *
   * @param {number} userId 댓글을 삭제하려는 유저 아이디
   * @param {number} id 댓글이 달려있는 강의 공지사항의 아이디
   * @param {number} commentId 삭제하려는 댓글의 아이디
   * @returns
   * @throws {NotFoundException}
   * - 댓글 아이디, 강의 아이디, 유저 아이디가 일치하는 댓글이 없을 때
   */
  async deleteComment({
    userId,
    id,
    commentId
  }: {
    userId: number
    id: number
    commentId: number
  }) {
    if (await this.isForbiddenNotice({ id, userId })) {
      throw new ForbiddenAccessException('it is not accessible course notice')
    }

    const comment = await this.prisma.courseNoticeComment.findUnique({
      where: {
        id: commentId,
        courseNoticeId: id,
        createdById: userId
      },
      select: {
        replyOn: {
          select: {
            id: true,
            isDeleted: true,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            _count: {
              select: {
                CourseNoticeComment: true
              }
            }
          }
        },
        // eslint-disable-next-line @typescript-eslint/naming-convention
        _count: {
          select: {
            CourseNoticeComment: true
          }
        }
      }
    })

    if (!comment) {
      // comment가 존재하지 않을 때
      throw new EntityNotExistException('CourseNoticeComment')
    }

    if (comment._count.CourseNoticeComment > 0) {
      // 답글이 존재할 때
      return await this.prisma.courseNoticeComment.update({
        where: {
          id: commentId,
          courseNoticeId: id,
          createdById: userId
        },
        data: {
          isDeleted: true,
          content: 'This is a deleted comment.',
          createdById: null
        }
      })
    }

    if (comment.replyOn != null) {
      if (
        comment.replyOn._count.CourseNoticeComment == 1 &&
        comment.replyOn.isDeleted
      ) {
        // 해당 댓글이 답글이고, 원댓글에 대한 답글이 1개 뿐이며 그 원댓글도 삭제되었을 때 (Cascade로 함께 삭제)
        return await this.prisma.courseNoticeComment.delete({
          where: {
            id: comment.replyOn.id
          }
        })
      }
    }

    // 어떤 경우에도 해당하지 않을 때 (답글이 존재하지 않거나 원댓글이 삭제된 마지막 답글이 아닐 때)
    return await this.prisma.courseNoticeComment.delete({
      where: {
        id: commentId,
        courseNoticeId: id,
        createdById: userId
      }
    })
  }
}
