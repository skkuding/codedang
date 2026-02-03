import {
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
import { CreatePlagiarismCheckInput } from './model/create-check.input'

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
   * @throws {EntityNotExistException} 아래와 같은 경우 발생합니다.
   * - 유저 간의 중복이 없을 때, 제출물의 수가 1개 이하인 경우
   */
  @Span()
  async validateRequest({
    problemId,
    language
  }: {
    problemId: number
    language: Language
  }) {
    const submissions = await this.prisma.submission.findMany({
      where: {
        problemId,
        language
      },
      select: {
        userId: true
      }
    })

    const uniqueUserSubmissions = submissions.filter(
      (value, index, self) => value !== null && self.indexOf(value) === index
    )
    if (uniqueUserSubmissions.length < 2) {
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
        assignmentId
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
      assignmentId?: number
      workbookId?: number
    }
  }) {
    await this.validateRequest({
      problemId,
      language: checkInput.language
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
          ...idOptions
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
    return await this.prisma.checkRequest.findMany({
      where: {
        problemId,
        assignment: {
          id: assignmentId,
          groupId
        }
      },
      select: {
        id: true,
        userId: true,
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
    const request = await this.prisma.checkRequest.findUnique({
      where: {
        id: checkId,
        assignment: {
          groupId
        }
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
        firstCheckSubmissionId: true,
        secondCheckSubmissionId: true,
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
    const request = await this.prisma.checkRequest.findFirst({
      where: {
        problemId,
        assignmentId
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
    const cluster = await this.prisma.plagiarismCluster.findUnique({
      where: {
        id: clusterId,
        SubmissionCluster: {
          every: {
            submission: {
              assignment: {
                groupId
              }
            }
          }
        }
      },
      include: {
        SubmissionCluster: true
      }
    })

    if (!cluster) throw new NotFoundException('Cluster not found')

    return {
      id: cluster.id,
      averageSimilarity: cluster.averageSimilarity,
      strength: cluster.strength,
      submissionCluster: cluster.SubmissionCluster
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
    const result = await this.prisma.checkResult.findUnique({
      where: {
        id: resultId,
        request: {
          assignment: {
            groupId
          }
        }
      },
      select: {
        requestId: true,
        firstCheckSubmissionId: true,
        secondCheckSubmissionId: true,
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
      firstCheckSubmissionId: result.firstCheckSubmissionId,
      secondCheckSubmissionId: result.secondCheckSubmissionId,
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
