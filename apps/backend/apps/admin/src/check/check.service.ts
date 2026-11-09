import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException
} from '@nestjs/common'
import type { Language } from '@prisma/client'
import { CheckResultStatus, Prisma } from '@prisma/client'
import { plainToInstance } from 'class-transformer'
import { Span } from 'nestjs-otel'
import type { AuthenticatedUser } from '@libs/auth'
import {
  EntityNotExistException,
  UnprocessableDataException
} from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import { CheckPublicationService } from './check-pub.service'
import { Match } from './model/check-result.dto'
import {
  CreatePlagiarismCheckInput,
  type CreatePlagiarismTargetsInput
} from './model/create-check.input'

@Injectable()
export class CheckService {
  private readonly logger = new Logger(CheckService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly publish: CheckPublicationService
  ) {}

  /**
   * 표절 검사 요청이 수행 가능한지 확인합니다.
   *
   * @param {number} problemId
   * @param {Language} language
   * @param {number[]} assignmentIds 검사 대상 과제 아이디 목록
   * @param {number} contestId 검사 대상 대회 아이디
   * @param {number} workbookId 검사 대상 워크북 아이디
   * @throws {EntityNotExistException} 아래와 같은 경우 발생합니다.
   * - 검사 대상에 제출한 서로 다른 유저가 2명 미만인 경우
   */
  @Span()
  async validateRequest({
    problemId,
    language,
    assignmentIds,
    contestId,
    workbookId
  }: {
    problemId: number
    language: Language
    assignmentIds?: number[]
    contestId?: number
    workbookId?: number
  }) {
    const submissions = await this.prisma.submission.findMany({
      where: {
        problemId,
        language,
        userId: { not: null },
        assignmentId: assignmentIds?.length ? { in: assignmentIds } : undefined,
        contestId,
        workbookId
      },
      select: {
        userId: true
      },
      distinct: ['userId']
    })

    if (submissions.length < 2) {
      throw new EntityNotExistException('There are not enough submissions')
    }
  }

  /**
   * 표절 검사를 수행할 수 있는 과제인지 검증합니다.
   *
   * @param {number} assignmentId
   * @param {number} problemId
   * @param {number} groupId
   * @throws {EntityNotExistException} 아래와 같은 경우 발생합니다.
   * - Assignment가 주어진 group에 존재하지 않을 때
   * - 주어진 아이디의 AssignmentProblem가 존재하지 않을 때
   * - AssignmentDueTime이 존재하지 않을 때
   * @throws {NotFoundException} 아래와 같은 경우 발생합니다.
   * - 과제의 dueTime이 지나기 전일 때
   */
  @Span()
  async validateAssignment({
    assignmentId,
    problemId,
    groupId
  }: {
    assignmentId: number
    problemId: number
    groupId: number
  }) {
    const assignmentProblem = await this.prisma.assignmentProblem.findFirst({
      where: {
        problemId,
        assignment: {
          id: assignmentId,
          groupId
        }
      }
    })
    if (!assignmentProblem) {
      throw new EntityNotExistException('AssignmentProblem')
    }

    const assignmentDueTime = await this.prisma.assignment.findFirst({
      where: {
        id: assignmentId
      },
      select: {
        dueTime: true
      }
    })
    if (!assignmentDueTime || !assignmentDueTime.dueTime) {
      throw new EntityNotExistException('AssignmentDueTime')
    }
    if (assignmentDueTime.dueTime.getTime() > Date.now()) {
      throw new ForbiddenException('Before the Due Time has passed yet.')
    }
  }

  /**
   * 표절검사가 가능한 그룹과 과제 페어인지 확인합니다.
   *
   * @param {number} problemId
   * @param {{ assignmentId: number; groupId: number }} targets
   * @throws {EntityNotExistException} 아래와 같은 경우 발생합니다.
   * - Assignment가 주어진 group에 존재하지 않을 때
   * - 주어진 아이디의 AssignmentProblem가 존재하지 않을 때
   * - AssignmentDueTime이 존재하지 않을 때
   * @throws {ForbiddenException} 아래와 같은 경우 발생합니다.
   * - 과제의 dueTime이 지나기 전일 때
   */
  @Span()
  async validateAssignments({
    problemId,
    targets
  }: {
    problemId: number
    targets: { assignmentId: number; groupId: number }[]
  }) {
    if (targets.length === 0) {
      throw new BadRequestException('At least one assignment is required')
    }

    const assignmentProblems = await this.prisma.assignmentProblem.findMany({
      where: {
        problemId,
        OR: targets.map(({ assignmentId, groupId }) => ({
          assignmentId,
          assignment: {
            groupId
          }
        }))
      },
      select: {
        assignmentId: true,
        assignment: {
          select: {
            groupId: true,
            dueTime: true
          }
        }
      }
    })

    const assignmentMap = new Map(
      assignmentProblems.map((ap) => [
        `${ap.assignmentId}:${ap.assignment.groupId}`,
        ap.assignment.dueTime
      ])
    )

    const now = Date.now()

    for (const { assignmentId, groupId } of targets) {
      const key = `${assignmentId}:${groupId}`

      if (!assignmentMap.has(key)) {
        throw new EntityNotExistException('AssignmentProblem')
      }

      const dueTime = assignmentMap.get(key)

      if (!dueTime) {
        throw new EntityNotExistException('AssignmentDueTime')
      }

      if (dueTime.getTime() > now) {
        throw new ForbiddenException('Before the Due Time has passed yet.')
      }
    }
  }

  /**
   * 한 assignment의 problem에 대해 표절 검사를 요청합니다.
   *
   * @param {number} userId 검사를 요청한 유저의 아이디
   * @param {CreatePlagiarismCheckInput} checkInput 표절 검사 설정
   * @param {number} assignmentId 과제 아이디
   * @param {number} problemId 문제 아이디
   * @returns {CheckRequest} 표절 검사를 요청한 기록을 반환합니다.
   */
  @Span()
  async checkAssignmentProblem({
    user,
    checkInput,
    assignmentId,
    problemId,
    groupId
  }: {
    user: AuthenticatedUser
    checkInput: CreatePlagiarismCheckInput
    assignmentId: number
    problemId: number
    groupId: number
  }) {
    await this.validateAssignment({ assignmentId, problemId, groupId })

    return await this.checkProblem({
      userId: user.id,
      checkInput,
      problemId,
      idOptions: {
        assignmentIds: [assignmentId]
      }
    })
  }

  /**
   * 여러 assignment에 대해 한 Problem에 대해 표절 검사를 요청합니다.
   * 모든 assignment에 대해 해당 problem이 존재하는지 먼저 검사합니다.
   *
   * @param {number} userId 검사를 요청한 유저의 아이디
   * @param {CreatePlagiarismCheckInput} checkInput 표절 검사 설정
   * @param {number[]} assignmentIds 과제 아이디
   * @param {number} problemId 문제 아이디
   * @returns {CheckRequest} 표절 검사를 요청한 기록을 반환합니다.
   * @throws {ForbiddenException} 요청자가 Admin 또는 SuperAdmin이 아닐 때 발생합니다.
   */
  @Span()
  async checkAssignmentsProblem({
    user,
    checkInput,
    problemId,
    targets
  }: {
    user: AuthenticatedUser
    checkInput: CreatePlagiarismCheckInput
    problemId: number
    targets: CreatePlagiarismTargetsInput[]
  }) {
    if (!user.isAdmin() && !user.isSuperAdmin()) {
      throw new ForbiddenException('Only admins can request this check')
    }

    await this.validateAssignments({ problemId, targets })

    const assignmentIds = targets.map((v) => v.assignmentId)

    return await this.checkProblem({
      userId: user.id,
      checkInput,
      problemId,
      idOptions: {
        assignmentIds
      }
    })
  }

  /**
   * 한 Problem에 대해 표절 검사를 요청합니다.
   *
   * @param {number} userId 검사를 요청한 유저 아이디
   * @param {CreatePlagiarismCheckInput} checkInput 표절 검사 설정
   * @param {number} problemId 문제 아이디
   * @param idOptions 과제, 대회, 워크북 중 하나의 아이디를 담은 객체
   * @returns {CheckRequest} 표절 검사를 요청한 기록을 반환합니다.
   * @throws {UnprocessableDataException} 아래와 같은 경우 발생합니다.
   * - Prisma에 요청을 기록할 수 없을 때
   * @throws Publish 과정에서 오류가 발생할 수 있습니다.
   */
  @Span()
  async checkProblem({
    userId,
    checkInput,
    problemId,
    idOptions
  }: {
    userId: number
    checkInput: CreatePlagiarismCheckInput
    problemId: number
    idOptions: {
      contestId?: number
      assignmentIds?: number[]
      workbookId?: number
    }
  }) {
    await this.validateRequest({
      problemId,
      language: checkInput.language,
      ...idOptions
    })

    const { language, enableMerging, useJplagClustering, minTokens } =
      checkInput

    try {
      const check = await this.prisma.checkRequest.create({
        data: {
          problemId,
          result: CheckResultStatus.Pending,
          userId,
          language,
          enableMerging,
          useJplagClustering,
          minTokens,
          ...idOptions,
          assignmentIds: [...new Set(idOptions.assignmentIds ?? [])]
        }
      })

      await this.publish.publishCheckRequestMessage({
        check
      })
      return check
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new UnprocessableDataException('Failed to create check record')
      }
      throw error
    }
  }

  private async getCheckRequestScope(
    groupId: number,
    where: Prisma.CheckRequestWhereInput
  ): Promise<Prisma.CheckRequestWhereInput> {
    const assignments = await this.prisma.assignment.findMany({
      where: { groupId },
      select: { id: true }
    })
    const assignmentIds = assignments.map(({ id }) => id)
    const requests = await this.prisma.checkRequest.findMany({
      where: { AND: [where, { assignmentIds: { hasSome: assignmentIds } }] },
      select: { id: true, assignmentIds: true }
    })
    const allowedIds = new Set(assignmentIds)
    return {
      id: {
        in: requests
          .filter((request) =>
            request.assignmentIds.every((id) => allowedIds.has(id))
          )
          .map(({ id }) => id)
      }
    }
  }

  @Span()
  async getCheckRequests({
    problemId,
    assignmentId,
    groupId
  }: {
    problemId: number
    assignmentId: number
    groupId: number
  }) {
    const scope = await this.getCheckRequestScope(groupId, {
      problemId,
      assignmentIds: { has: assignmentId }
    })
    return await this.prisma.checkRequest.findMany({
      where: {
        problemId,
        AND: [scope, { assignmentIds: { has: assignmentId } }]
      },
      select: {
        id: true,
        userId: true,
        assignmentIds: true,
        language: true,
        enableMerging: true,
        minTokens: true,
        useJplagClustering: true,
        createTime: true,
        result: true
      },
      orderBy: {
        createTime: 'desc'
      }
    })
  }

  /**
   * 완료된 표절 검사의 결과 일부를 요약하여 가져옵니다.
   *
   * @param {number} checkId 표절 검사 요청 아이디
   * @param {number} groupId 표절 검사 요청이 속한 그룹 아이디
   * @param {number} take 조회할 제출물 쌍의 비교 결과 개수
   * @param {number | null} cursor 페이지 커서
   * @returns {GetCheckResultSummaryOutput[]} 여러 제출물 쌍의 비교 결과를 평균 유사도 기준으로 내림차순 정렬하여 반환합니다.
   * @throws {EntityNotExistException} 아래와 같은 경우 발생합니다.
   * - 검사 요청 기록이 없을 때
   * - 아직 검사 중일 때
   * - 표절 검사 중 오류가 발생했을 때
   */
  @Span()
  async getCheckResultsById({
    checkId,
    groupId,
    take,
    cursor
  }: {
    checkId: number
    groupId: number
    take: number
    cursor: number | null
  }) {
    const scope = await this.getCheckRequestScope(groupId, {
      id: checkId
    })
    const request = await this.prisma.checkRequest.findFirst({
      where: {
        id: checkId,
        AND: [scope]
      },
      select: {
        result: true
      }
    })

    if (!request) {
      throw new EntityNotExistException('Request')
    }
    if (request.result === CheckResultStatus.Pending) {
      throw new EntityNotExistException(
        'As it is still being evaluated, Result'
      )
    }
    if (request.result !== CheckResultStatus.Completed) {
      throw new EntityNotExistException(`[${request.result}] Result`)
    }

    const paginator = this.prisma.getPaginator(cursor)

    const results = await this.prisma.checkResult.findMany({
      ...paginator,
      take,
      where: {
        requestId: checkId
      },
      select: {
        id: true,
        firstCheckSubmission: {
          select: {
            id: true,
            user: {
              select: {
                username: true,
                studentId: true
              }
            }
          }
        },
        secondCheckSubmission: {
          select: {
            id: true,
            user: {
              select: {
                username: true,
                studentId: true
              }
            }
          }
        },
        averageSimilarity: true,
        maxSimilarity: true,
        maxLength: true,
        longestMatch: true,
        firstSimilarity: true,
        secondSimilarity: true,
        clusterId: true,
        cluster: {
          select: {
            averageSimilarity: true,
            strength: true
          }
        }
      },
      orderBy: {
        averageSimilarity: 'desc'
      }
    })

    return results
  }

  /**
   * 완료된 표절 검사의 결과 일부를 요약하여 가져옵니다.
   *
   * @param {number} problemId 문제 아이디
   * @param {number} assignmentId 과제 아이디
   * @param {number} take 조회할 제출물 쌍의 비교 결과 개수
   * @param {number | null} cursor 페이지 커서
   * @returns {GetCheckResultSummaryOutput[]} 여러 제출물 쌍의 비교 결과를 평균 유사도 기준으로 내림차순 정렬하여 반환합니다.
   * @throws {EntityNotExistException} 아래와 같은 경우 발생합니다.
   * - 검사 요청 기록이 없을 때
   * - 아직 검사 중일 때
   * - 표절 검사 중 오류가 발생했을 때
   */
  @Span()
  async getCheckResultsByAssignmentProblemId({
    problemId,
    assignmentId,
    groupId,
    take,
    cursor
  }: {
    problemId: number
    assignmentId: number
    groupId: number
    take: number
    cursor: number | null
  }) {
    await this.validateAssignment({ assignmentId, problemId, groupId })
    const scope = await this.getCheckRequestScope(groupId, {
      problemId,
      assignmentIds: { has: assignmentId }
    })
    const request = await this.prisma.checkRequest.findFirst({
      where: {
        problemId,
        AND: [scope, { assignmentIds: { has: assignmentId } }]
      },
      select: {
        id: true
      },
      orderBy: {
        createTime: 'desc'
      }
    })

    if (!request) {
      throw new EntityNotExistException('CheckRequest')
    }

    return await this.getCheckResultsById({
      checkId: request.id,
      groupId,
      take,
      cursor
    })
  }

  /**
   * 표절이 강하게 의심되는 제출물 집단을 제공합니다.
   *
   * @param {number} clusterId 클러스터 아이디
   * @returns {GetClusterOutput} 제출물 아이디를 포함한 클러스터를 반환합니다.
   * @throws {NotFoundException} 아래와 같은 경우 발생합니다.
   * - 주어진 아이디를 가진 클러스터가 없을 때
   */
  @Span()
  async getCluster({
    groupId,
    clusterId
  }: {
    groupId: number
    clusterId: number
  }) {
    const scope = await this.getCheckRequestScope(groupId, {
      CheckResult: { some: { clusterId } }
    })
    const cluster = await this.prisma.plagiarismCluster.findFirst({
      where: {
        id: clusterId,
        CheckResult: { some: { request: scope } }
      },
      select: {
        id: true,
        averageSimilarity: true,
        strength: true,
        SubmissionCluster: {
          include: {
            submission: {
              include: {
                user: {
                  select: {
                    username: true,
                    studentId: true
                  }
                }
              }
            }
          }
        }
      }
    })

    if (!cluster) throw new NotFoundException('Cluster not found')

    return {
      id: cluster.id,
      averageSimilarity: cluster.averageSimilarity,
      strength: cluster.strength,
      submissionClusterInfos: cluster.SubmissionCluster.map((item) => ({
        submissionId: item.submissionId,
        clusterId: item.clusterId,
        user: item.submission.user
      }))
    }
  }

  /**
   * 제출물 쌍의 비교 결과를 자세하게 제공합니다.
   *
   * @param {number} resultId 제출물 쌍의 비교 결과 아이디
   * @returns {GetCheckResultDetailOutput} 한 검사 결과의 정보를 자세하게 제공합니다.
   * @throws {NotFoundException} 아래와 같은 경우 발생합니다.
   * - 주어진 아이디를 가진 결과가 존재하지 않을 때
   */
  @Span()
  async getDetails({
    groupId,
    resultId
  }: {
    groupId: number
    resultId: number
  }) {
    const scope = await this.getCheckRequestScope(groupId, {
      CheckResult: { some: { id: resultId } }
    })
    const result = await this.prisma.checkResult.findFirst({
      where: {
        id: resultId,
        request: scope
      },
      select: {
        requestId: true,
        firstCheckSubmission: {
          select: {
            id: true,
            user: {
              select: {
                username: true,
                studentId: true
              }
            }
          }
        },
        secondCheckSubmission: {
          select: {
            id: true,
            user: {
              select: {
                username: true,
                studentId: true
              }
            }
          }
        },
        averageSimilarity: true,
        maxSimilarity: true,
        maxLength: true,
        longestMatch: true,
        matches: true,
        firstSimilarity: true,
        secondSimilarity: true,
        clusterId: true
      }
    })

    if (!result) throw new NotFoundException('Result not found')

    const matches = result.matches
      .map((match) => {
        const matchString = match?.toString()
        if (!matchString) return null
        return plainToInstance(Match, JSON.parse(matchString))
      })
      .filter((match) => match !== null)

    return {
      requestId: result.requestId,
      firstCheckSubmission: result.firstCheckSubmission,
      secondCheckSubmission: result.secondCheckSubmission,
      averageSimilarity: result.averageSimilarity,
      maxSimilarity: result.maxSimilarity,
      maxLength: result.maxLength,
      longestMatch: result.longestMatch,
      matches,
      firstSimilarity: result.firstSimilarity,
      secondSimilarity: result.secondSimilarity,
      clusterId: result.clusterId
    }
  }
}
