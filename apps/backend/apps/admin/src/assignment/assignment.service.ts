import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Inject, Injectable } from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { Assignment, AssignmentProblem } from '@generated'
import { Prisma, ResultStatus } from '@prisma/client'
import { Cache } from 'cache-manager'
import { MAX_DATE, MIN_DATE } from '@libs/constants'
import {
  EntityNotExistException,
  ForbiddenAccessException,
  UnprocessableDataException
} from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import type { UpdateAssignmentProblemRecordInput } from './model/assignment-problem-record-input'
import type { AssignmentProblemInput } from './model/assignment-problem.input'
import type {
  CreateAssignmentInput,
  UpdateAssignmentInput
} from './model/assignment.input'

@Injectable()
export class AssignmentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
  ) {}

  async getAssignments(
    take: number,
    groupId: number,
    cursor: number | null,
    isExercise: boolean
  ) {
    const paginator = this.prisma.getPaginator(cursor)

    const assignments = await this.prisma.assignment.findMany({
      ...paginator,
      where: { groupId, isExercise },
      take,
      include: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        _count: {
          select: { assignmentRecord: true }
        }
      }
    })

    return assignments.map((assignment) => {
      const { _count, ...data } = assignment
      return {
        ...data,
        participants: _count.assignmentRecord
      }
    })
  }

  async getAssignment(assignmentId: number, groupId: number) {
    const assignment = await this.prisma.assignment.findUnique({
      where: {
        id: assignmentId
      },
      include: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        _count: {
          select: { assignmentRecord: true }
        }
      }
    })

    if (!assignment) {
      throw new EntityNotExistException('Assignment')
    }

    if (groupId !== assignment.groupId) {
      throw new ForbiddenAccessException(
        'You can only access assignment in your own group'
      )
    }

    const { _count, ...data } = assignment

    return {
      ...data,
      participants: _count.assignmentRecord
    }
  }

  async createAssignment(
    groupId: number,
    userId: number,
    assignment: CreateAssignmentInput
  ): Promise<Assignment> {
    if (assignment.startTime >= assignment.endTime) {
      throw new UnprocessableDataException(
        'The startTime must be earlier than the endTime'
      )
    }

    if (
      assignment.dueTime !== null &&
      assignment.startTime >= assignment.dueTime
    ) {
      throw new UnprocessableDataException(
        'The startTime must be earlier than the dueTime'
      )
    }

    const group = await this.prisma.group.findUnique({
      where: {
        id: groupId
      }
    })
    if (!group) {
      throw new EntityNotExistException('Group')
    }

    try {
      const createdAssignment = await this.prisma.assignment.create({
        data: {
          createdById: userId,
          groupId,
          ...assignment
        }
      })

      this.inviteAllCourseMembersToAssignment(createdAssignment.id, groupId)

      this.eventEmitter.emit('assignment.created', {
        assignmentId: createdAssignment.id,
        dueTime: createdAssignment.dueTime ?? createdAssignment.endTime
      })

      return createdAssignment
    } catch (error) {
      throw new UnprocessableDataException(error.message)
    }
  }

  async updateAssignment(
    groupId: number,
    assignment: UpdateAssignmentInput
  ): Promise<Assignment> {
    const assignmentFound = await this.prisma.assignment.findUnique({
      where: {
        id: assignment.id
      },
      select: {
        groupId: true,
        startTime: true,
        endTime: true,
        dueTime: true,
        isFinalScoreVisible: true,
        assignmentProblem: {
          select: {
            problemId: true
          }
        }
      }
    })

    if (!assignmentFound) {
      throw new EntityNotExistException('Assignment')
    }

    if (groupId !== assignmentFound.groupId) {
      throw new ForbiddenAccessException(
        'You can only access assignment in your own group'
      )
    }

    const isEndTimeChanged =
      assignment.endTime && assignment.endTime !== assignmentFound.endTime

    assignment.startTime = assignment.startTime || assignmentFound.startTime
    assignment.endTime = assignment.endTime || assignmentFound.endTime
    if (assignment.startTime >= assignment.endTime) {
      throw new UnprocessableDataException(
        'The startTime must be earlier than the endTime'
      )
    }

    assignment.dueTime = assignment.dueTime || assignmentFound.dueTime
    if (
      assignment.dueTime !== null &&
      assignment.startTime >= assignment.dueTime
    ) {
      throw new UnprocessableDataException(
        'The startTime must be earlier than the dueTime'
      )
    }

    const problemIds = assignmentFound.assignmentProblem.map(
      (problem) => problem.problemId
    )
    if (problemIds.length && isEndTimeChanged) {
      for (const problemId of problemIds) {
        try {
          // 문제가 포함된 대회 중 가장 늦게 끝나는 대회의 종료시각으로 visibleLockTime 설정
          let visibleLockTime = assignment.endTime

          const assignmentIds = (
            await this.prisma.assignmentProblem.findMany({
              where: {
                problemId
              }
            })
          )
            .filter(
              (assignmentProblem) =>
                assignmentProblem.assignmentId !== assignment.id
            )
            .map((assignmentProblem) => assignmentProblem.assignmentId)

          if (assignmentIds.length) {
            const latestAssignment =
              await this.prisma.assignment.findFirstOrThrow({
                where: {
                  id: {
                    in: assignmentIds
                  }
                },
                orderBy: {
                  endTime: 'desc'
                },
                select: {
                  endTime: true
                }
              })
            if (assignment.endTime < latestAssignment.endTime)
              visibleLockTime = latestAssignment.endTime
          }

          await this.prisma.problem.update({
            where: {
              id: problemId
            },
            data: {
              visibleLockTime
            }
          })
        } catch {
          continue
        }
      }
    }

    try {
      const updatedAssignment = await this.prisma.assignment.update({
        where: {
          id: assignment.id
        },
        data: {
          title: assignment.title,
          ...assignment
        }
      })

      const isRevealingFinalScore =
        assignment.isFinalScoreVisible &&
        assignment.isFinalScoreVisible !== assignmentFound.isFinalScoreVisible

      if (isRevealingFinalScore) {
        this.eventEmitter.emit('assignment.graded', {
          assignmentId: assignment.id
        })
      }

      const isDueTimeChanged =
        assignment.dueTime !== undefined &&
        assignment.dueTime !== assignmentFound.dueTime

      if (isDueTimeChanged) {
        this.eventEmitter.emit('assignment.updated', {
          assignmentId: assignment.id,
          dueTime: assignment.dueTime ?? assignment.endTime
        })
      }

      return updatedAssignment
    } catch (error) {
      throw new UnprocessableDataException(error.message)
    }
  }

  async deleteAssignment(groupId: number, assignmentId: number) {
    const assignment = await this.prisma.assignment.findUnique({
      where: {
        id: assignmentId
      },
      select: {
        assignmentProblem: {
          select: {
            problemId: true
          }
        },
        groupId: true
      }
    })

    if (!assignment) {
      throw new EntityNotExistException('Assignment')
    }

    if (groupId !== assignment.groupId) {
      throw new ForbiddenAccessException(
        'You can only access assignment in your own group'
      )
    }

    const problemIds = assignment.assignmentProblem.map(
      (problem) => problem.problemId
    )
    if (problemIds.length) {
      await this.removeProblemsFromAssignment(groupId, assignmentId, problemIds)
    }

    try {
      const deletedAssignment = await this.prisma.assignment.delete({
        where: {
          id: assignmentId
        }
      })

      this.eventEmitter.emit('assignment.deleted', deletedAssignment.id)

      return deletedAssignment
    } catch (error) {
      throw new UnprocessableDataException(error.message)
    }
  }

  async importProblemsToAssignment(
    groupId: number,
    assignmentId: number,
    assignmentProblemInput: AssignmentProblemInput[]
  ) {
    const assignment = await this.prisma.assignment.findUnique({
      where: {
        id: assignmentId
      },
      include: {
        submission: {
          select: {
            id: true
          }
        }
      }
    })

    if (!assignment) {
      throw new EntityNotExistException('Assignment')
    }

    if (groupId !== assignment.groupId) {
      throw new ForbiddenAccessException(
        'You can only access assignment in your own group'
      )
    }

    const assignmentProblems: AssignmentProblem[] = []

    for (const {
      problemId,
      score,
      solutionReleaseTime
    } of assignmentProblemInput) {
      const isProblemAlreadyImported =
        await this.prisma.assignmentProblem.findUnique({
          where: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            assignmentId_problemId: {
              assignmentId,
              problemId
            }
          }
        })
      if (isProblemAlreadyImported) {
        continue
      }

      try {
        const [assignmentProblem] = await this.prisma.$transaction([
          this.prisma.assignmentProblem.create({
            data: {
              // 원래 id: 'temp'이었는데, assignmentProblem db schema field가 바뀌어서
              // 임시 방편으로 order: 0으로 설정합니다.
              order: 0,
              assignmentId,
              problemId,
              score,
              solutionReleaseTime
            }
          }),
          this.prisma.problem.updateMany({
            where: {
              id: problemId,
              OR: [
                {
                  visibleLockTime: {
                    equals: MIN_DATE
                  }
                },
                {
                  visibleLockTime: {
                    equals: MAX_DATE
                  }
                },
                {
                  visibleLockTime: {
                    lte: assignment.endTime
                  }
                }
              ]
            },
            data: {
              visibleLockTime: assignment.endTime
            }
          }),
          this.prisma.problem.update({
            where: {
              id: problemId
            },
            data: {
              sharedGroups: {
                connect: [{ id: groupId }]
              }
            }
          })
        ])
        assignmentProblems.push(assignmentProblem)
      } catch (error) {
        throw new UnprocessableDataException(error.message)
      }

      const assignmentParticipants =
        await this.prisma.assignmentRecord.findMany({
          where: {
            assignmentId
          },
          select: {
            userId: true
          }
        })

      const assignmentProblemRecordsData = assignmentParticipants.map(
        ({ userId }) => ({ assignmentId, userId: userId!, problemId })
      )

      await this.prisma.assignmentProblemRecord.createMany({
        data: assignmentProblemRecordsData,
        skipDuplicates: true
      })
    }

    return assignmentProblems
  }

  async removeProblemsFromAssignment(
    groupId: number,
    assignmentId: number,
    problemIds: number[]
  ) {
    const assignment = await this.prisma.assignment.findUnique({
      where: {
        id: assignmentId
      },
      include: {
        submission: {
          select: {
            id: true
          }
        }
      }
    })
    if (!assignment) {
      throw new EntityNotExistException('Assignment')
    }

    if (groupId !== assignment.groupId) {
      throw new ForbiddenAccessException(
        'You can only access assignment in your own group'
      )
    }

    const assignmentProblems: AssignmentProblem[] = []

    for (const problemId of problemIds) {
      // 문제가 포함된 대회 중 가장 늦게 끝나는 대회의 종료시각으로 visibleLockTime 설정 (없을시 비공개 전환)
      let visibleLockTime = MAX_DATE

      const assignmentIds = (
        await this.prisma.assignmentProblem.findMany({
          where: {
            problemId
          }
        })
      )
        .filter(
          (assignmentProblem) => assignmentProblem.assignmentId !== assignmentId
        )
        .map((assignmentProblem) => assignmentProblem.assignmentId)

      if (assignmentIds.length) {
        const latestAssignment = await this.prisma.assignment.findFirst({
          where: {
            id: {
              in: assignmentIds
            }
          },
          orderBy: {
            endTime: 'desc'
          },
          select: {
            endTime: true
          }
        })

        if (!latestAssignment) {
          throw new EntityNotExistException('Assignment')
        }

        visibleLockTime = latestAssignment.endTime
      }

      try {
        const [, assignmentProblem] = await this.prisma.$transaction([
          this.prisma.problem.updateMany({
            where: {
              id: problemId,
              visibleLockTime: {
                lte: assignment.endTime
              }
            },
            data: {
              visibleLockTime
            }
          }),
          this.prisma.assignmentProblem.delete({
            where: {
              // eslint-disable-next-line @typescript-eslint/naming-convention
              assignmentId_problemId: {
                assignmentId,
                problemId
              }
            }
          }),
          this.prisma.problem.update({
            where: {
              id: problemId
            },
            data: {
              sharedGroups: {
                disconnect: [{ id: groupId }]
              }
            }
          })
        ])

        assignmentProblems.push(assignmentProblem)
      } catch (error) {
        throw new UnprocessableDataException(error.message)
      }
    }

    return assignmentProblems
  }

  async getAssignmentSubmissionSummaryByUserId({
    take,
    assignmentId,
    userId,
    problemId,
    cursor
  }: {
    take: number
    assignmentId: number
    userId: number
    problemId: number | null
    cursor: number | null
  }) {
    const paginator = this.prisma.getPaginator(cursor)
    const submissions = await this.prisma.submission.findMany({
      ...paginator,
      take,
      where: {
        userId,
        assignmentId,
        problemId: problemId ?? undefined
      },
      include: {
        problem: {
          select: {
            title: true,
            assignmentProblem: {
              where: {
                assignmentId,
                problemId: problemId ?? undefined
              }
            }
          }
        },
        user: {
          select: {
            username: true,
            studentId: true
          }
        }
      }
    })

    const mappedSubmission = submissions.map((submission) => {
      return {
        assignmentId: submission.assignmentId,
        problemTitle: submission.problem.title,
        username: submission.user?.username,
        studentId: submission.user?.studentId,
        submissionResult: submission.result,
        language: submission.language,
        submissionTime: submission.createTime,
        codeSize: submission.codeSize,
        ip: submission.userIp,
        id: submission.id,
        problemId: submission.problemId,
        order: submission.problem.assignmentProblem.length
          ? submission.problem.assignmentProblem[0].order
          : null
      }
    })

    const scoreSummary = await this.getAssignmentScoreSummary(
      userId,
      assignmentId
    )

    return {
      scoreSummary,
      submissions: mappedSubmission
    }
  }

  /**
   * Duplicate assignment with assignment problems and users who participated in the assignment
   * Not copied: submission
   * @param groupId group to duplicate assignment
   * @param assignmentId assignment to duplicate
   * @param userId user who tries to duplicates the assignment
   * @returns
   */
  async duplicateAssignment(
    groupId: number,
    assignmentId: number,
    userId: number
  ) {
    const [assignmentFound, assignmentProblemsFound, userAssignmentRecords] =
      await Promise.all([
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
        }),
        this.prisma.assignmentRecord.findMany({
          where: {
            assignmentId
          }
        })
      ])

    if (!assignmentFound) {
      throw new EntityNotExistException('Assignment')
    }

    // if assignment status is ongoing, visible would be true. else, false
    const now = new Date()
    let newVisible = false
    if (assignmentFound.startTime <= now && now <= assignmentFound.endTime) {
      newVisible = true
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, createTime, updateTime, title, ...assignmentDataToCopy } =
      assignmentFound

    try {
      const [newAssignment, newAssignmentProblems, newAssignmentRecords] =
        await this.prisma.$transaction(async (tx) => {
          // 1. copy assignment
          const newAssignment = await tx.assignment.create({
            data: {
              ...assignmentDataToCopy,
              title: 'Copy of ' + title,
              createdById: userId,
              groupId,
              isVisible: newVisible
            }
          })

          // 2. copy assignment problems
          const newAssignmentProblems = await Promise.all(
            assignmentProblemsFound.map((assignmentProblem) =>
              tx.assignmentProblem.create({
                data: {
                  order: assignmentProblem.order,
                  assignmentId: newAssignment.id,
                  problemId: assignmentProblem.problemId,
                  score: assignmentProblem.score,
                  solutionReleaseTime: assignmentProblem.solutionReleaseTime
                }
              })
            )
          )

          // 3. copy assignment records (users who participated in the assignment)
          const newAssignmentRecords = await Promise.all(
            userAssignmentRecords.map((userAssignmentRecord) =>
              tx.assignmentRecord.create({
                data: {
                  assignmentId: newAssignment.id,
                  userId: userAssignmentRecord.userId
                }
              })
            )
          )

          return [newAssignment, newAssignmentProblems, newAssignmentRecords]
        })

      return {
        assignment: newAssignment,
        problems: newAssignmentProblems,
        records: newAssignmentRecords
      }
    } catch (error) {
      throw new UnprocessableDataException(error.message)
    }
  }

  /**
   * 특정 user의 특정 Assignment에 대한 총점, 통과한 문제 개수와 각 문제별 테스트케이스 통과 개수를 불러옵니다.
   */
  async getAssignmentScoreSummary(userId: number, assignmentId: number) {
    const [assignmentProblems, rawAssignmentProblemRecords] = await Promise.all(
      [
        this.prisma.assignmentProblem.findMany({
          where: {
            assignmentId
          }
        }),
        this.prisma.assignmentProblemRecord.findMany({
          where: {
            userId,
            assignmentId
          }
        })
      ]
    )

    // 오직 현재 Assignment에 남아있는 문제들의 제출에 대해서만 ScoreSummary 계산
    const assignmentProblemIds = assignmentProblems.map(
      (assignmentProblem) => assignmentProblem.problemId
    )
    const assignmentProblemRecords = rawAssignmentProblemRecords.filter(
      (record) => assignmentProblemIds.includes(record.problemId)
    )

    const maxScoreMap = assignmentProblems.reduce(
      (map, problem) => {
        map[problem.problemId] = problem.score
        return map
      },
      {} as Record<number, number>
    )

    const problemScores = assignmentProblemRecords.map((record) => ({
      problemId: record.problemId,
      score: record.score,
      maxScore: maxScoreMap[record.problemId],
      finalScore: record.finalScore
    }))

    const testcaseCounts = await this.prisma.problemTestcase.groupBy({
      by: ['problemId'],
      where: {
        problemId: { in: assignmentProblemIds },
        isOutdated: false
      },
      // eslint-disable-next-line @typescript-eslint/naming-convention
      _count: {
        problemId: true
      }
    })

    /**
     * 각 문제 별 Testcase 개수
     */
    const testcaseCountMap = testcaseCounts.reduce(
      (map, { problemId, _count }) => {
        map[problemId] = _count.problemId
        return map
      },
      {} as Record<number, number>
    )

    const submissions = await this.prisma.submission.findMany({
      where: {
        assignmentId,
        userId,
        problemId: { in: assignmentProblemIds }
      },
      select: {
        id: true,
        problemId: true,
        createTime: true,
        result: true,
        submissionResult: {
          select: {
            result: true,
            problemTestcaseId: true,
            problemTestcase: {
              select: { isHidden: true }
            }
          }
        }
      },
      orderBy: [{ createTime: 'desc' }, { id: 'desc' }]
    })

    const latestSubmissionMap = new Map<number, (typeof submissions)[number]>()

    for (const submission of submissions) {
      if (!latestSubmissionMap.has(submission.problemId)) {
        latestSubmissionMap.set(submission.problemId, submission)
      }
    }

    /**
     * 문제 별 Accepted된 testcase의 개수 (latestSubmission 기준)
     */
    const acceptedCountsByProblem = assignmentProblemIds.reduce(
      (map, problemId) => {
        const latestSubmission = latestSubmissionMap.get(problemId)
        if (!latestSubmission) {
          map[problemId] = 0
          return map
        }

        const acceptedCount = latestSubmission.submissionResult.reduce(
          (acc, testcaseResult) =>
            testcaseResult.result === ResultStatus.Accepted ? acc + 1 : acc,
          0
        )

        map[problemId] = acceptedCount
        return map
      },
      {} as Record<number, number>
    )

    /**
     * 문제 별 score과 testcase 개수(전체, 정답)에 대한 집합 배열
     */
    const scoreSummaryByProblem = assignmentProblemIds.map((problemId) => {
      const problemScore =
        problemScores.find((score) => score.problemId === problemId) ?? null

      const acceptedTestcaseCount = acceptedCountsByProblem[problemId] ?? 0
      const totalTestcaseCount = testcaseCountMap[problemId] ?? 0

      return {
        problemId,
        score: problemScore?.score ?? new Prisma.Decimal(0),
        maxScore: problemScore?.maxScore ?? 0,
        finalScore: problemScore?.finalScore ?? null,
        acceptedTestcaseCount,
        totalTestcaseCount
      }
    })

    const scoreSummary = {
      submittedProblemCount: assignmentProblemRecords.filter(
        (record) => record.isSubmitted
      ).length, // Assignment에 존재하는 문제 중 제출된 문제의 개수
      totalProblemCount: assignmentProblems.length, // Assignment에 존재하는 Problem의 총 개수
      userAssignmentScore: problemScores.reduce(
        (total, { score }) => total.plus(score),
        new Prisma.Decimal(0)
      ), // Assignment에서 유저가 받은 점수
      assignmentPerfectScore: assignmentProblems.reduce(
        (total, { score }) => total + score,
        0
      ), // Assignment의 만점
      userAssignmentFinalScore: assignmentProblemRecords.reduce(
        (total, { finalScore }) => total.plus(finalScore ?? 0),
        new Prisma.Decimal(0)
      ),
      scoreSummaryByProblem // 개별 Problem의 점수 및 테스트케이스 개수(정답, 전체) 리스트
    }

    return scoreSummary
  }

  async getAssignmentScoreSummaries(
    assignmentId: number,
    groupId: number,
    take: number,
    cursor: number | null,
    searchingName?: string
  ) {
    const paginator = this.prisma.getPaginator(cursor)
    const assignment = await this.prisma.assignment.findUnique({
      where: {
        id: assignmentId
      }
    })

    if (!assignment) {
      throw new EntityNotExistException('Assignment')
    }

    if (groupId !== assignment.groupId) {
      throw new ForbiddenAccessException(
        'You can only access assignment in your own group'
      )
    }

    const [courseMemberCount, assignmentParticipantCount] = await Promise.all([
      this.prisma.userGroup.count({ where: { groupId } }),
      this.prisma.assignmentRecord.count({ where: { assignmentId } })
    ])

    if (courseMemberCount > assignmentParticipantCount) {
      await this.inviteAllCourseMembersToAssignment(assignmentId, groupId)
    }

    const assignmentRecords = await this.prisma.assignmentRecord.findMany({
      ...paginator,
      where: {
        assignmentId,
        userId: {
          not: null
        },
        user: searchingName
          ? {
              userProfile: {
                realName: {
                  contains: searchingName,
                  mode: 'insensitive'
                }
              }
            }
          : undefined
      },
      take,
      include: {
        user: {
          select: {
            username: true,
            studentId: true,
            userProfile: {
              select: {
                realName: true
              }
            },
            major: true
          }
        }
      },
      orderBy: {
        user: {
          studentId: 'asc'
        }
      }
    })

    const assignmentRecordsWithScoreSummary = await Promise.all(
      assignmentRecords.map(async (record) => {
        return {
          userId: record.userId,
          username: record.user?.username,
          studentId: record.user?.studentId,
          realName: record.user?.userProfile?.realName,
          major: record.user?.major,
          ...(await this.getAssignmentScoreSummary(
            record.userId as number,
            assignmentId
          ))
        }
      })
    )

    return assignmentRecordsWithScoreSummary
  }

  async getAssignmentsByProblemId(problemId: number, userId: number) {
    const problem = await this.prisma.problem.findFirstOrThrow({
      where: { id: problemId },
      include: {
        sharedGroups: {
          select: {
            id: true
          }
        }
      }
    })

    if (problem.createdById !== userId) {
      const leaderGroupIds = (
        await this.prisma.userGroup.findMany({
          where: {
            userId,
            isGroupLeader: true
          }
        })
      ).map((group) => group.groupId)
      const sharedGroupIds = problem.sharedGroups.map((group) => group.id)
      const hasShared = sharedGroupIds.some((v) =>
        new Set(leaderGroupIds).has(v)
      )
      if (!hasShared) {
        throw new ForbiddenAccessException(
          'User can only edit problems they created or were shared with'
        )
      }
    }

    const assignmentProblems = await this.prisma.assignmentProblem.findMany({
      where: {
        problemId
      },
      select: {
        assignment: {
          include: {
            group: {
              select: {
                id: true,
                groupName: true,
                courseInfo: {
                  select: {
                    courseNum: true,
                    classNum: true
                  }
                }
              }
            }
          }
        },
        score: true
      }
    })

    const assignments = await Promise.all(
      assignmentProblems.map(async (assignmentProblem) => {
        return {
          ...assignmentProblem.assignment,
          problemScore: assignmentProblem.score,
          totalScore: await this.getTotalScoreOfAssignment(
            assignmentProblem.assignment.id
          )
        }
      })
    )

    const now = new Date()

    const assignmentsGroupedByStatus = assignments.reduce(
      (acc, assignment) => {
        if (assignment.endTime > now) {
          if (assignment.startTime <= now) {
            acc.ongoing.push(assignment)
          } else {
            acc.upcoming.push(assignment)
          }
        } else {
          acc.finished.push(assignment)
        }
        return acc
      },
      {
        upcoming: [] as typeof assignments,
        ongoing: [] as typeof assignments,
        finished: [] as typeof assignments
      }
    )

    return assignmentsGroupedByStatus
  }

  async getTotalScoreOfAssignment(assignmentId: number) {
    const assignmentProblemScores =
      await this.prisma.assignmentProblem.findMany({
        where: {
          assignmentId
        },
        select: {
          score: true
        }
      })

    return assignmentProblemScores.reduce(
      (total, problem) => total + problem.score,
      0
    )
  }

  async updateAssignmentProblemRecord(
    groupId: number,
    input: UpdateAssignmentProblemRecordInput
  ) {
    const now = new Date()

    const assignmentProblem = await this.prisma.assignmentProblem.findUnique({
      where: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        assignmentId_problemId: {
          assignmentId: input.assignmentId,
          problemId: input.problemId
        }
      },
      include: {
        assignment: {
          select: {
            groupId: true,
            dueTime: true,
            endTime: true
          }
        }
      }
    })

    if (!assignmentProblem || !assignmentProblem.assignment) {
      throw new EntityNotExistException('AssignmentProblem')
    }

    const assignment = assignmentProblem.assignment

    if (groupId !== assignment.groupId) {
      throw new ForbiddenAccessException(
        'You can only access assignment in your own group'
      )
    }

    if (now < (assignment.dueTime ?? assignment.endTime)) {
      throw new UnprocessableDataException(
        'Assignments can only be graded after their due time'
      )
    }

    if (
      input.finalScore !== undefined &&
      input.finalScore > assignmentProblem.score
    ) {
      throw new UnprocessableDataException(
        'The score cannot be greater than the maximum score'
      )
    }

    const updatedProblemRecord = await this.prisma.$transaction(
      async (prisma) => {
        const updatedRecord = await prisma.assignmentProblemRecord.update({
          where: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            assignmentId_userId_problemId: {
              assignmentId: input.assignmentId,
              userId: input.userId,
              problemId: input.problemId
            }
          },
          data: {
            finalScore: input.finalScore,
            comment: input.comment
          }
        })

        const problemRecords = await prisma.assignmentProblemRecord.findMany({
          where: {
            assignmentId: input.assignmentId,
            userId: input.userId
          },
          select: {
            finalScore: true
          }
        })

        const totalFinalScore = problemRecords.reduce(
          (total, { finalScore }) => total.plus(finalScore ?? 0),
          new Prisma.Decimal(0)
        )

        await prisma.assignmentRecord.update({
          where: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            assignmentId_userId: {
              assignmentId: input.assignmentId,
              userId: input.userId
            }
          },
          data: {
            finalScore: totalFinalScore
          }
        })

        return updatedRecord
      }
    )

    return updatedProblemRecord
  }

  async getAssignmentProblemRecord({
    groupId,
    userId,
    assignmentId,
    problemId
  }: {
    groupId: number
    userId: number
    assignmentId: number
    problemId: number
  }) {
    const [assignmentProblemRecord, assignment] = await Promise.all([
      this.prisma.assignmentProblemRecord.findUnique({
        where: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          assignmentId_userId_problemId: {
            assignmentId,
            userId,
            problemId
          }
        }
      }),
      this.prisma.assignment.findUnique({
        where: {
          id: assignmentId
        }
      })
    ])

    if (!assignmentProblemRecord) {
      throw new EntityNotExistException('AssignmentProblemRecord')
    }

    if (!assignment) {
      throw new EntityNotExistException('Assignment')
    }

    if (groupId !== assignment.groupId) {
      throw new ForbiddenAccessException(
        'You can only access assignment in your own group'
      )
    }

    return assignmentProblemRecord
  }

  async isAllAssignmentProblemGraded(assignmentId: number, userId: number) {
    const problemRecords = await this.prisma.assignmentProblemRecord.findMany({
      where: {
        assignmentId,
        userId
      },
      select: {
        finalScore: true
      }
    })

    const isAllProblemGraded = problemRecords.every(
      (record) => record.finalScore !== null && record.finalScore !== undefined
    )

    return isAllProblemGraded
  }

  async autoFinalizeScore(groupId: number, assignmentId: number) {
    const assignment = await this.prisma.assignment.findUnique({
      where: { id: assignmentId },
      select: { groupId: true, dueTime: true, endTime: true }
    })

    if (!assignment) {
      throw new EntityNotExistException('Assignment')
    }

    if (assignment.groupId !== groupId) {
      throw new ForbiddenAccessException(
        'You can only access assignment in your own group'
      )
    }

    if ((assignment.dueTime ?? assignment.endTime) > new Date()) {
      throw new UnprocessableDataException(
        'Assignments can only be graded after their due time'
      )
    }

    return await this.prisma.$executeRaw`
      UPDATE "assignment_problem_record"
      SET "final_score" = "score"
      WHERE "assignmentId" = ${assignmentId};
    `
  }

  private async inviteAllCourseMembersToAssignment(
    assignmentId: number,
    groupId: number
  ) {
    const courseMembers = await this.prisma.userGroup.findMany({
      where: { groupId },
      select: { userId: true }
    })

    if (courseMembers.length === 0) {
      throw new EntityNotExistException('Course Member')
    }

    const assignmentParticipants = await this.prisma.assignmentRecord.findMany({
      where: { assignmentId },
      select: { userId: true }
    })

    const participantIds = new Set(
      assignmentParticipants.map((participant) => participant.userId)
    )

    const nonParticipants = courseMembers.filter(
      ({ userId }) => !participantIds.has(userId)
    )

    const assignmentProblems = await this.prisma.assignmentProblem.findMany({
      where: { assignmentId },
      select: { problemId: true }
    })

    const assignmentProblemData = nonParticipants.flatMap(({ userId }) =>
      assignmentProblems.map(({ problemId }) => ({
        assignmentId,
        userId,
        problemId
      }))
    )

    await this.prisma.$transaction(async (prisma) => {
      await prisma.assignmentRecord.createMany({
        data: nonParticipants.map(({ userId }) => ({ userId, assignmentId })),
        skipDuplicates: true
      })

      await prisma.assignmentProblemRecord.createMany({
        data: assignmentProblemData,
        skipDuplicates: true
      })
    })
  }
}
