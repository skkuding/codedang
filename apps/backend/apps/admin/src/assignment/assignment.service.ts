import { CACHE_MANAGER } from '@nestjs/cache-manager'
import {
  Inject,
  Injectable,
  UnprocessableEntityException
} from '@nestjs/common'
import {
  Assignment,
  ResultStatus,
  Submission,
  AssignmentProblem
} from '@generated'
import { Cache } from 'cache-manager'
import {
  OPEN_SPACE_ID,
  PUBLICIZING_REQUEST_EXPIRE_TIME,
  PUBLICIZING_REQUEST_KEY,
  MIN_DATE,
  MAX_DATE
} from '@libs/constants'
import {
  ConflictFoundException,
  EntityNotExistException,
  UnprocessableDataException
} from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import type { AssignmentWithScores } from './model/assignment-with-scores.model'
import type { CreateAssignmentInput } from './model/assignment.input'
import type { UpdateAssignmentInput } from './model/assignment.input'
import type { AssignmentProblemScoreInput } from './model/problem-score.input'
import type { AssignmentPublicizingRequest } from './model/publicizing-request.model'
import type { AssignmentPublicizingResponse } from './model/publicizing-response.output'

@Injectable()
export class AssignmentService {
  constructor(
    private readonly prisma: PrismaService,
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

  async getAssignment(assignmentId: number) {
    const assignment = await this.prisma.assignment.findFirst({
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
      return await this.prisma.assignment.create({
        data: {
          createdById: userId,
          groupId,
          ...assignment
        }
      })
    } catch (error) {
      throw new UnprocessableDataException(error.message)
    }
  }

  async updateAssignment(
    groupId: number,
    assignment: UpdateAssignmentInput
  ): Promise<Assignment> {
    const assignmentFound = await this.prisma.assignment.findFirst({
      where: {
        id: assignment.id,
        groupId
      },
      select: {
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
    const isEndTimeChanged =
      assignment.endTime && assignment.endTime !== assignmentFound.endTime
    assignment.startTime = assignment.startTime || assignmentFound.startTime
    assignment.endTime = assignment.endTime || assignmentFound.endTime
    if (assignment.startTime >= assignment.endTime) {
      throw new UnprocessableDataException(
        'The start time must be earlier than the end time'
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
    const assignment = await this.prisma.assignment.findFirst({
      where: {
        id: assignmentId,
        groupId
      },
      select: {
        assignmentProblem: {
          select: {
            problemId: true
          }
        }
      }
    })
    if (!assignment) {
      throw new EntityNotExistException('assignment')
    }

    const problemIds = assignment.assignmentProblem.map(
      (problem) => problem.problemId
    )
    if (problemIds.length) {
      await this.removeProblemsFromAssignment(groupId, assignmentId, problemIds)
    }

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

  async getPublicizingRequests() {
    const requests = await this.cacheManager.get<
      AssignmentPublicizingRequest[]
    >(PUBLICIZING_REQUEST_KEY)

    if (!requests) {
      return []
    }

    const filteredRequests = requests.filter(
      (req) => new Date(req.expireTime) > new Date()
    )

    if (requests.length != filteredRequests.length) {
      await this.cacheManager.set(
        PUBLICIZING_REQUEST_KEY,
        filteredRequests,
        PUBLICIZING_REQUEST_EXPIRE_TIME
      )
    }

    return filteredRequests
  }

  async handlePublicizingRequest(assignmentId: number, isAccepted: boolean) {
    const requests = (await this.cacheManager.get(
      PUBLICIZING_REQUEST_KEY
    )) as Array<AssignmentPublicizingRequest>
    if (!requests) {
      throw new EntityNotExistException('AssignmentPublicizingRequest')
    }

    const request = requests.find((req) => req.assignmentId === assignmentId)
    if (!request || new Date(request.expireTime) < new Date()) {
      throw new EntityNotExistException('AssignmentPublicizingRequest')
    }

    await this.cacheManager.set(
      PUBLICIZING_REQUEST_KEY,
      requests.filter((req) => req.assignmentId != assignmentId),
      PUBLICIZING_REQUEST_EXPIRE_TIME
    )

    if (isAccepted) {
      try {
        await this.prisma.assignment.update({
          where: {
            id: assignmentId
          },
          data: {
            groupId: OPEN_SPACE_ID
          }
        })
      } catch (error) {
        throw new UnprocessableDataException(error.message)
      }
    }

    return {
      assignmentId,
      isAccepted
    } as AssignmentPublicizingResponse
  }

  async createPublicizingRequest(groupId: number, assignmentId: number) {
    if (groupId == OPEN_SPACE_ID) {
      throw new UnprocessableEntityException(
        'This assignment is already publicized'
      )
    }

    const assignment = await this.prisma.assignment.findFirst({
      where: {
        id: assignmentId,
        groupId
      }
    })
    if (!assignment) {
      throw new EntityNotExistException('assignment')
    }

    let requests = (await this.cacheManager.get(
      PUBLICIZING_REQUEST_KEY
    )) as Array<AssignmentPublicizingRequest>
    if (!requests) {
      requests = []
    }

    const duplicatedRequest = requests.find(
      (req) => req.assignmentId == assignmentId
    )
    if (duplicatedRequest) {
      throw new ConflictFoundException('duplicated publicizing request')
    }

    const newRequest: AssignmentPublicizingRequest = {
      assignmentId,
      userId: assignment.createdById!, // TODO: createdById가 null일 경우 예외처리
      expireTime: new Date(Date.now() + PUBLICIZING_REQUEST_EXPIRE_TIME)
    }
    requests.push(newRequest)

    await this.cacheManager.set(
      PUBLICIZING_REQUEST_KEY,
      requests,
      PUBLICIZING_REQUEST_EXPIRE_TIME
    )

    return newRequest
  }

  async importProblemsToAssignment(
    groupId: number,
    assignmentId: number,
    problemIdsWithScore: AssignmentProblemScoreInput[]
  ) {
    const assignment = await this.prisma.assignment.findUnique({
      where: {
        id: assignmentId,
        groupId
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

    const assignmentProblems: AssignmentProblem[] = []

    for (const { problemId, score } of problemIdsWithScore) {
      const isProblemAlreadyImported =
        await this.prisma.assignmentProblem.findFirst({
          where: {
            assignmentId,
            problemId
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
          })
        ])
        assignmentProblems.push(assignmentProblem)
      } catch (error) {
        throw new UnprocessableDataException(error.message)
      }
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
        id: assignmentId,
        groupId
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
    const [assignmentProblems, rawSubmissions] = await Promise.all([
      this.prisma.assignmentProblem.findMany({
        where: {
          assignmentId
        }
      }),
      this.prisma.submission.findMany({
        where: {
          userId,
          assignmentId
        },
        orderBy: {
          createTime: 'desc'
        }
      })
    ])

    // 오직 현재 Assignment에 남아있는 문제들의 제출에 대해서만 ScoreSummary 계산
    const assignmentProblemIds = assignmentProblems.map(
      (assignmentProblem) => assignmentProblem.problemId
    )
    const submissions = rawSubmissions.filter((submission) =>
      assignmentProblemIds.includes(submission.problemId)
    )

    if (!submissions.length) {
      return {
        submittedProblemCount: 0,
        totalProblemCount: assignmentProblems.length,
        userAssignmentScore: 0,
        assignmentPerfectScore: assignmentProblems.reduce(
          (total, { score }) => total + score,
          0
        ),
        problemScores: []
      }
    }

    // 하나의 Problem에 대해 여러 개의 Submission이 존재한다면, 마지막에 제출된 Submission만을 점수 계산에 반영함
    const latestSubmissions: {
      [problemId: string]: {
        result: ResultStatus
        score: number // Problem에서 획득한 점수 (maxScore 만점 기준)
        maxScore: number // Assignment에서 Problem이 갖는 배점(만점)
      }
    } = await this.getlatestSubmissions(submissions)

    const problemScores: {
      problemId: number
      score: number
      maxScore: number
    }[] = []

    for (const problemId in latestSubmissions) {
      problemScores.push({
        problemId: parseInt(problemId),
        score: latestSubmissions[problemId].score,
        maxScore: latestSubmissions[problemId].maxScore
      })
    }

    const scoreSummary = {
      submittedProblemCount: Object.keys(latestSubmissions).length, // Assignment에 존재하는 문제 중 제출된 문제의 개수
      totalProblemCount: assignmentProblems.length, // Assignment에 존재하는 Problem의 총 개수
      userAssignmentScore: problemScores.reduce(
        (total, { score }) => total + score,
        0
      ), // Assignment에서 유저가 받은 점수
      assignmentPerfectScore: assignmentProblems.reduce(
        (total, { score }) => total + score,
        0
      ), // Assignment의 만점
      problemScores // 개별 Problem의 점수 리스트 (각 문제에서 몇 점을 획득했는지)
    }

    return scoreSummary
  }

  async getlatestSubmissions(submissions: Submission[]) {
    const latestSubmissions: {
      [problemId: string]: {
        result: ResultStatus
        score: number // Problem에서 획득한 점수
        maxScore: number // Assignment에서 Problem이 갖는 배점
      }
    } = {}

    for (const submission of submissions) {
      const problemId = submission.problemId
      if (problemId in latestSubmissions) continue

      const assignmentProblem = await this.prisma.assignmentProblem.findUnique({
        where: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          assignmentId_problemId: {
            assignmentId: submission.assignmentId!,
            problemId: submission.problemId
          }
        },
        select: {
          score: true
        }
      })

      if (!assignmentProblem) {
        throw new EntityNotExistException('assignmentProblem')
      }

      const maxScore = assignmentProblem.score

      latestSubmissions[problemId] = {
        result: submission.result as ResultStatus,
        score: (submission.score / 100) * maxScore, // assignment에 할당된 Problem의 총점에 맞게 계산
        maxScore
      }
    }

    return latestSubmissions
  }

  async getAssignmentScoreSummaries(
    assignmentId: number,
    take: number,
    cursor: number | null,
    searchingName?: string
  ) {
    const paginator = this.prisma.getPaginator(cursor)

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

  async getAssignmentsByProblemId(problemId: number) {
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
}
