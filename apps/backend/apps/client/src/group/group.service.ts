import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Inject, Injectable } from '@nestjs/common'
import { GroupType, Role, type UserGroup } from '@prisma/client'
import { Cache } from 'cache-manager'
import { invitationCodeKey, joinGroupCacheKey } from '@libs/cache'
import { JOIN_GROUP_REQUEST_EXPIRE_TIME } from '@libs/constants'
import {
  ConflictFoundException,
  EntityNotExistException,
  ForbiddenAccessException
} from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import type { GroupJoinRequest } from '@libs/types'
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
}
