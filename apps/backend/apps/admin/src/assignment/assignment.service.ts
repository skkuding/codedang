import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { SchedulerRegistry } from '@nestjs/schedule'
import { Assignment, AssignmentProblem } from '@generated'
import { Cache } from 'cache-manager'
import { CronJob } from 'cron'
import { MIN_DATE, MAX_DATE } from '@libs/constants'
import {
  ConflictFoundException,
  EntityNotExistException,
  ForbiddenAccessException,
  UnprocessableDataException
} from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import type { UpdateAssignmentProblemRecordInput } from './model/assignment-problem-record-input'
import type { AssignmentWithScores } from './model/assignment-with-scores.model'
import type { CreateAssignmentInput } from './model/assignment.input'
import type { UpdateAssignmentInput } from './model/assignment.input'
import type { AssignmentProblemScoreInput } from './model/problem-score.input'

@Injectable()
export class AssignmentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly schedulerRegistry: SchedulerRegistry,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
  ) {}

  async getAssignments(take: number, groupId: number, cursor: number | null) {
    const paginator = this.prisma.getPaginator(cursor)

    const assignments = await this.prisma.assignment.findMany({
      ...paginator,
      where: { groupId },
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
      throw new EntityNotExistException('assignment')
    }

    if (groupId !== assignment.groupId) {
      throw new ForbiddenAccessException('Forbidden Resource')
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
        'The start time must be earlier than the end time'
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

      const endTime = new Date(assignment.endTime)

      if (endTime.getTime() >= Date.now()) {
        const cronExpression = `${endTime.getSeconds()} ${endTime.getMinutes()} ${endTime.getHours()} ${endTime.getDate()} ${endTime.getMonth() + 1} *`

        const job = new CronJob(cronExpression, () => {
          this.endTimeReached(createdAssignment.id, groupId)
          this.schedulerRegistry.deleteCronJob(String(createdAssignment.id))
        })

        this.schedulerRegistry.addCronJob(String(createdAssignment.id), job)
        job.start()
      } else {
        this.endTimeReached(createdAssignment.id, groupId)
      }
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
        assignmentProblem: {
          select: {
            problemId: true
          }
        }
      }
    })

    if (!assignmentFound) {
      throw new EntityNotExistException('assignment')
    }

    if (groupId !== assignmentFound.groupId) {
      throw new ForbiddenAccessException('Forbidden Resource')
    }

    const isEndTimeChanged =
      assignment.endTime && assignment.endTime !== assignmentFound.endTime
    assignment.startTime = assignment.startTime || assignmentFound.startTime
    assignment.endTime = assignment.endTime || assignmentFound.endTime
    if (assignment.startTime >= assignment.endTime) {
      throw new UnprocessableDataException(
        'The start time must be earlier than the end time'
      )
    }

    if (isEndTimeChanged) {
      try {
        this.schedulerRegistry.deleteCronJob(String(assignment.id))
        // eslint-disable-next-line no-empty
      } catch {}

      const endTime = new Date(assignment.endTime)

      if (endTime.getTime() >= Date.now()) {
        const cronExpression = `${endTime.getSeconds()} ${endTime.getMinutes()} ${endTime.getHours()} ${endTime.getDate()} ${endTime.getMonth() + 1} *`

        const job = new CronJob(cronExpression, () => {
          this.endTimeReached(assignment.id, groupId)
          this.schedulerRegistry.deleteCronJob(String(assignment.id))
        })

        this.schedulerRegistry.addCronJob(String(assignment.id), job)
        job.start()
      } else {
        this.endTimeReached(assignment.id, groupId)
      }
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
      return await this.prisma.assignment.update({
        where: {
          id: assignment.id
        },
        data: {
          title: assignment.title,
          ...assignment
        }
      })
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
      throw new EntityNotExistException('assignment')
    }

    if (groupId !== assignment.groupId) {
      throw new ForbiddenAccessException('Forbidden Resource')
    }

    const problemIds = assignment.assignmentProblem.map(
      (problem) => problem.problemId
    )
    if (problemIds.length) {
      await this.removeProblemsFromAssignment(groupId, assignmentId, problemIds)
    }

    try {
      this.schedulerRegistry.deleteCronJob(String(assignmentId))
      // eslint-disable-next-line no-empty
    } catch {}

    try {
      return await this.prisma.assignment.delete({
        where: {
          id: assignmentId
        }
      })
    } catch (error) {
      throw new UnprocessableDataException(error.message)
    }
  }

  async importProblemsToAssignment(
    groupId: number,
    assignmentId: number,
    problemIdsWithScore: AssignmentProblemScoreInput[]
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
      throw new EntityNotExistException('assignment')
    }

    if (groupId !== assignment.groupId) {
      throw new ForbiddenAccessException('Forbidden Resource')
    }

    const assignmentProblems: AssignmentProblem[] = []

    for (const { problemId, score } of problemIdsWithScore) {
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
              score
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
        data: assignmentProblemRecordsData
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
      throw new EntityNotExistException('assignment')
    }

    if (groupId !== assignment.groupId) {
      throw new ForbiddenAccessException('Forbidden Resource')
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
          throw new EntityNotExistException('assignment')
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

  async getAssignmentSubmissionSummaryByUserId(
    take: number,
    assignmentId: number,
    userId: number,
    problemId: number | null,
    cursor: number | null
  ) {
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
      throw new EntityNotExistException('assignment')
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
                  score: assignmentProblem.score
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

    const scoreSummary = {
      submittedProblemCount: assignmentProblemRecords.filter(
        (record) => record.isSubmitted
      ).length, // Assignment에 존재하는 문제 중 제출된 문제의 개수
      totalProblemCount: assignmentProblems.length, // Assignment에 존재하는 Problem의 총 개수
      userAssignmentScore: problemScores.reduce(
        (total, { score }) => total + score,
        0
      ), // Assignment에서 유저가 받은 점수
      assignmentPerfectScore: assignmentProblems.reduce(
        (total, { score }) => total + score,
        0
      ), // Assignment의 만점
      userAssignmentFinalScore: assignmentProblemRecords.some(
        (record) => record.finalScore === null
      )
        ? null
        : assignmentProblemRecords.reduce(
            (total, { finalScore }) => total + finalScore!,
            0
          ),
      problemScores // 개별 Problem의 점수 리스트 (각 문제에서 몇 점을 획득했는지)
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
      throw new ForbiddenAccessException('Forbidden Resource')
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
        assignment: true,
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
        upcoming: [] as AssignmentWithScores[],
        ongoing: [] as AssignmentWithScores[],
        finished: [] as AssignmentWithScores[]
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
            endTime: true
          }
        }
      }
    })

    if (!assignmentProblem || !assignmentProblem.assignment) {
      throw new EntityNotExistException('Assignment Problem')
    }

    const assignment = assignmentProblem.assignment

    if (groupId !== assignment.groupId) {
      throw new ForbiddenAccessException('Forbidden Resource')
    }

    if (now <= assignment.endTime) {
      throw new ConflictFoundException('Can grade only finished assignments')
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
          (total, { finalScore }) => total + (finalScore ?? 0),
          0
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
      throw new EntityNotExistException('Assignment Problem Record')
    }

    if (!assignment) {
      throw new EntityNotExistException('Assignment')
    }

    if (groupId !== assignment.groupId) {
      throw new ForbiddenAccessException('Forbidden Resource')
    }

    return assignmentProblemRecord
  }

  async endTimeReached(assignmentId: number, groupId: number) {
    const courseMembers = await this.prisma.userGroup.findMany({
      where: { groupId, isGroupLeader: false },
      select: { userId: true }
    })

    if (courseMembers.length === 0) {
      throw new NotFoundException('Course Member')
    }

    const assignmentParticipants = await this.prisma.assignmentRecord.findMany({
      where: { assignmentId },
      select: { userId: true }
    })

    const nonParticipants = courseMembers.filter(
      ({ userId }) =>
        !assignmentParticipants
          .map((participant) => participant.userId)
          .includes(userId)
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
        data: nonParticipants.map(({ userId }) => ({ userId, assignmentId }))
      })

      await prisma.assignmentProblemRecord.createMany({
        data: assignmentProblemData
      })
    })
  }
}
