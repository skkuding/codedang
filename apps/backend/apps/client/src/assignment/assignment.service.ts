import { Injectable } from '@nestjs/common'
import {
  Prisma,
  ResultStatus,
  type AssignmentProblem,
  type AssignmentProblemRecord,
  type Submission
} from '@prisma/client'
import {
  ConflictFoundException,
  EntityNotExistException,
  ForbiddenAccessException
} from '@libs/exception'
import { PrismaService } from '@libs/prisma'

const assignmentSelectOption = {
  id: true,
  title: true,
  startTime: true,
  endTime: true,
  group: { select: { id: true, groupName: true } },
  enableCopyPaste: true,
  isJudgeResultVisible: true,
  week: true,
  // eslint-disable-next-line @typescript-eslint/naming-convention
  _count: {
    select: {
      assignmentRecord: true,
      assignmentProblem: true
    }
  }
} satisfies Prisma.AssignmentSelect

export type AssignmentSelectResult = Prisma.AssignmentGetPayload<{
  select: typeof assignmentSelectOption
}>

export type AssignmentResult = Omit<AssignmentSelectResult, '_count'> & {
  participants: number
}

export interface ProblemScore {
  problemId: number
  score: number
  maxScore: number
  finalScore: number | null
}

interface SubmissionResult {
  result: ResultStatus
  score: number
  maxScore: number
}

@Injectable()
export class AssignmentService {
  constructor(private readonly prisma: PrismaService) {}

  async getAssignments(groupId: number, userId: number) {
    const assignments = await this.prisma.assignment.findMany({
      where: {
        groupId,
        isVisible: true
      },
      select: {
        ...assignmentSelectOption,
        assignmentRecord: {
          where: {
            userId
          },
          select: {
            assignmentProblemRecord: {
              where: {
                isSubmitted: true
              },
              select: {
                problemId: true
              }
            }
          }
        }
      },
      orderBy: [{ week: 'asc' }, { startTime: 'asc' }]
    })

    const now = new Date()

    return assignments.map(({ _count, assignmentRecord, ...assignment }) => ({
      ...assignment,
      problemNumber: now < assignment.startTime ? 0 : _count.assignmentProblem,
      submittedNumber: assignmentRecord[0]?.assignmentProblemRecord?.length ?? 0
    }))
  }

  async getAssignment(id: number, userId: number) {
    // check if the user has already registered this assignment
    // initial value is false

    let assignment

    const isRegistered = await this.prisma.assignmentRecord.findUnique({
      // eslint-disable-next-line @typescript-eslint/naming-convention
      where: { assignmentId_userId: { assignmentId: id, userId } }
    })

    if (!isRegistered) {
      throw new ForbiddenAccessException(
        'User not participated in the assignment'
      )
    }
    try {
      assignment = await this.prisma.assignment.findUniqueOrThrow({
        where: {
          id,
          isVisible: true
        },
        select: {
          ...assignmentSelectOption,
          description: true,
          assignmentRecord: {
            where: {
              userId
            },
            select: {
              assignmentProblemRecord: {
                where: {
                  isSubmitted: true
                },
                select: {
                  problemId: true
                }
              }
            }
          }
        }
      })
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new EntityNotExistException('Assignment')
      }
      throw error
    }
    /* HACK: standings 업데이트 로직 수정 후 삭제
    // get assignment participants ranking using AssignmentRecord
    const sortedAssignmentRecordsWithUserDetail =
      await this.prisma.assignmentRecord.findMany({
        where: {
          assignmentId: id
        },
        select: {
          user: {
            select: {
              id: true,
              username: true
            }
          },
          score: true,
          totalPenalty: true
        },
        orderBy: [
          {
            score: 'desc'
          },
          {
            totalPenalty: 'asc'
          }
        ]
      })

    const UsersWithStandingDetail = sortedAssignmentRecordsWithUserDetail.map(
      (assignmentRecord, index) => ({
        ...assignmentRecord,
        standing: index + 1
      })
    )
    */
    // combine assignment and sortedAssignmentRecordsWithUserDetail

    const { _count, assignmentRecord, ...assignmentDetails } = assignment

    return {
      ...assignmentDetails,
      problemNumber: _count.assignmentProblem,
      submittedNumber: assignmentRecord[0].assignmentProblemRecord.length
    }
  }

  async createAssignmentRecord(
    assignmentId: number,
    userId: number,
    groupId: number
  ) {
    const assignment = await this.prisma.assignment.findUniqueOrThrow({
      where: { id: assignmentId, groupId },
      select: {
        startTime: true,
        assignmentProblem: {
          select: {
            problemId: true
          }
        }
      }
    })

    const hasRegistered = await this.prisma.assignmentRecord.findFirst({
      where: { userId, assignmentId }
    })
    if (hasRegistered) {
      throw new ConflictFoundException('Already participated this assignment')
    }

    const now = new Date()
    if (now < assignment.startTime) {
      throw new ConflictFoundException('Cannot participate upcoming assignment')
    }

    const problemRecordData = assignment.assignmentProblem.map(
      ({ problemId }) => ({ assignmentId, userId, problemId })
    )

    return await this.prisma.$transaction(async (prisma) => {
      const createdAssignmentRecord = await prisma.assignmentRecord.create({
        data: { assignmentId, userId }
      })

      await prisma.assignmentProblemRecord.createMany({
        data: problemRecordData
      })

      return createdAssignmentRecord
    })
  }

  async deleteAssignmentRecord(
    assignmentId: number,
    userId: number,
    groupId: number
  ) {
    const [assignment, assignmentRecord] = await Promise.all([
      this.prisma.assignment.findUnique({
        where: { id: assignmentId, groupId }
      }),
      this.prisma.assignmentRecord.findFirst({
        where: { userId, assignmentId }
      })
    ])

    if (!assignment) {
      throw new EntityNotExistException('Assignment')
    }

    if (!assignmentRecord) {
      throw new EntityNotExistException('Assignment')
    }

    const now = new Date()
    if (now >= assignment.startTime) {
      throw new ForbiddenAccessException(
        'Cannot unregister ongoing or ended assignment'
      )
    }

    return await this.prisma.assignmentRecord.delete({
      // eslint-disable-next-line @typescript-eslint/naming-convention
      where: { assignmentId_userId: { assignmentId, userId } }
    })
  }

  async getAnonymizedScores(assignmentId: number, groupId: number) {
    const assignment = await this.prisma.assignment.findUnique({
      where: { id: assignmentId },
      select: {
        id: true,
        groupId: true,
        title: true,
        endTime: true,
        isFinalScoreVisible: true,
        isJudgeResultVisible: true,
        autoFinalizeScore: true
      }
    })

    if (!assignment) {
      throw new EntityNotExistException('Assignment not found')
    }

    if (assignment.groupId !== groupId) {
      throw new ForbiddenAccessException(
        'Not allowed to access this assignment'
      )
    }

    const now = new Date()
    if (now < assignment.endTime) {
      throw new ForbiddenAccessException(
        'Cannot view scores before assignment ends'
      )
    }

    const assignmentRecords = await this.prisma.assignmentRecord.findMany({
      where: { assignmentId },
      select: {
        userId: true,
        score: true,
        finalScore: true
      }
    })

    const validRecords = assignmentRecords.filter(
      (record) => record.userId !== null
    )

    const result: {
      assignmentId: number
      title: string
      totalParticipants: number
      scores?: number[]
      finalScores?: number[]
      autoFinalizeScore: boolean
      isFinalScoreVisible: boolean
    } = {
      assignmentId: assignment.id,
      title: assignment.title,
      totalParticipants: validRecords.length,
      autoFinalizeScore: assignment.autoFinalizeScore,
      isFinalScoreVisible: assignment.isFinalScoreVisible
    }

    if (assignment.isJudgeResultVisible) {
      result.scores = validRecords.map((record) => record.score)
    }

    if (assignment.isFinalScoreVisible) {
      result.finalScores = validRecords
        .map((record) => record.finalScore)
        .filter((score) => score !== null)
    }

    return result
  }

  async getMyAssignmentProblemRecord(
    assignmentId: number,
    userId: number,
    groupId: number
  ) {
    const assignment = await this.validateAssignment(assignmentId, groupId)

    const now = new Date()
    const isAssignmentEnded = now > assignment.endTime

    if (isAssignmentEnded) {
      const assignmentRecord = await this.prisma.assignmentRecord.findUnique({
        where: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          assignmentId_userId: { assignmentId, userId }
        },
        select: {
          score: true,
          finalScore: true
        }
      })

      const problemRecords = await this.prisma.assignmentProblemRecord.findMany(
        {
          where: {
            assignmentId,
            userId,
            isSubmitted: true
          },
          select: {
            problemId: true,
            score: true,
            finalScore: true,
            isAccepted: true
          }
        }
      )

      // 모든 문제 정보 조회 (배점 등 필요한 정보)
      const assignmentProblems = await this.prisma.assignmentProblem.findMany({
        where: { assignmentId }
      })

      // 저장된 기록이 존재하면 데이터 사용
      if (assignmentRecord?.score !== undefined) {
        // 모든 과제 문제에 대한 점수 정보 생성 (Assignment 끝났으니까, 제출하지 않은 문제는 0점으로 처리)
        const problemScores = assignmentProblems.map((problem) => {
          // 제출한 문제 기록 찾기
          const record = problemRecords.find(
            (rec) => rec.problemId === problem.problemId
          )

          return {
            problemId: problem.problemId,
            score: record?.score ?? 0,
            maxScore: problem.score,
            finalScore: record?.finalScore ?? null
          }
        })

        const assignmentPerfectScore = assignmentProblems.reduce(
          (total, { score }) => total + score,
          0
        )

        return {
          submittedProblemCount: problemRecords.length,
          totalProblemCount: assignmentProblems.length,
          userAssignmentScore: assignmentRecord.score,
          assignmentPerfectScore,
          userAssignmentFinalScore: assignmentRecord.finalScore,
          problemScores
        }
      }
    }

    const {
      assignmentProblems,
      filteredSubmissions,
      assignmentProblemRecords
    } = await this.fetchAssignmentData(assignmentId, userId)

    const finalScoreMap = this.createFinalScoreMap(assignmentProblemRecords)
    const latestSubmissions = this.calculateLatestSubmissions(
      filteredSubmissions,
      assignmentProblems
    )
    const problemScores = this.createProblemScores(
      latestSubmissions,
      finalScoreMap
    )

    const {
      userAssignmentScore,
      assignmentPerfectScore,
      userAssignmentFinalScore
    } = this.calculateTotalScores(
      problemScores,
      assignmentProblems,
      assignmentProblemRecords
    )

    return {
      submittedProblemCount: Object.keys(latestSubmissions).length,
      totalProblemCount: assignmentProblems.length,
      userAssignmentScore,
      assignmentPerfectScore,
      userAssignmentFinalScore,
      problemScores
    }
  }

  private async validateAssignment(assignmentId: number, groupId: number) {
    const assignment = await this.prisma.assignment.findUnique({
      where: { id: assignmentId }
    })

    if (!assignment) {
      throw new EntityNotExistException('Assignment not found')
    }

    if (assignment.groupId !== groupId) {
      throw new ForbiddenAccessException(
        'Not allowed to access this assignment'
      )
    }

    return assignment
  }

  private async fetchAssignmentData(assignmentId: number, userId: number) {
    const [assignmentProblems, allSubmissions, assignmentProblemRecords] =
      await Promise.all([
        this.prisma.assignmentProblem.findMany({
          where: { assignmentId }
        }),

        this.prisma.submission.findMany({
          where: {
            userId,
            assignmentId
          },
          orderBy: {
            createTime: 'desc'
          }
        }),
        this.prisma.assignmentProblemRecord.findMany({
          where: {
            userId,
            assignmentId
          }
        })
      ])

    const assignmentProblemIds = assignmentProblems.map((ap) => ap.problemId)

    const filteredSubmissions = allSubmissions.filter((submission) =>
      assignmentProblemIds.includes(submission.problemId)
    )

    return { assignmentProblems, filteredSubmissions, assignmentProblemRecords }
  }

  private createFinalScoreMap(
    assignmentProblemRecords: AssignmentProblemRecord[]
  ) {
    return assignmentProblemRecords.reduce(
      (map, record) => {
        map[record.problemId] = record.finalScore
        return map
      },
      {} as Record<number, number | null>
    )
  }

  private calculateLatestSubmissions(
    submissions: Submission[],
    assignmentProblems: AssignmentProblem[]
  ) {
    const latestSubmissions: Record<string, SubmissionResult> = {}

    for (const submission of submissions) {
      const problemId = submission.problemId.toString()
      if (problemId in latestSubmissions) continue

      const assignmentProblem = assignmentProblems.find(
        (ap) => ap.problemId === submission.problemId
      )

      if (!assignmentProblem) continue

      const maxScore = assignmentProblem.score
      latestSubmissions[problemId] = {
        result: submission.result as ResultStatus,
        score: (submission.score / 100) * maxScore,
        maxScore
      }
    }

    return latestSubmissions
  }

  private createProblemScores(
    latestSubmissions: Record<string, SubmissionResult>,
    finalScoreMap: Record<number, number | null>
  ): ProblemScore[] {
    return Object.entries(latestSubmissions).map(([problemId, data]) => ({
      problemId: parseInt(problemId),
      score: data.score,
      maxScore: data.maxScore,
      finalScore: finalScoreMap[parseInt(problemId)] ?? null
    }))
  }

  private calculateTotalScores(
    problemScores: ProblemScore[],
    assignmentProblems: AssignmentProblem[],
    assignmentProblemRecords: AssignmentProblemRecord[]
  ) {
    const userAssignmentScore = problemScores.reduce(
      (total, { score }) => total + score,
      0
    )

    const assignmentPerfectScore = assignmentProblems.reduce(
      (total, { score }) => total + score,
      0
    )

    const userAssignmentFinalScore = assignmentProblemRecords.some(
      (record) => record.finalScore === null
    )
      ? null
      : assignmentProblemRecords.reduce(
          (total, { finalScore }) => total + (finalScore as number),
          0
        )

    return {
      userAssignmentScore,
      assignmentPerfectScore,
      userAssignmentFinalScore
    }
  }
}
