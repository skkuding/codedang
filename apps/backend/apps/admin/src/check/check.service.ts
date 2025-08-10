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
  // 문제의 제출 기한이 끝났을 때 검사가 가능하게 합니다. (dueTime 이후)
  // 한 학생의 최종 submission을 기준으로 검사합니다.
  // 두 학생이 제출을 완료했는지 확인합니다.

  // dueTime 확인 어떻게 하나요?
  // 과제 문제로 한정?
  // 과제에 대한 학생들의 제출물로 제한할 수 있나요?
  // 모든 학생들에게 적용?

  @Span()
  async validateRequest({
    problemId,
    language
  }: {
    problemId: number
    language: Language
  }) {
    const submissionCount = await this.prisma.submission.count({
      where: {
        problemId,
        language
      }
    })
    if (submissionCount < 2) {
      throw new EntityNotExistException('There are not enough submissions')
    }
  }

  @Span()
  async validateAssignment({
    assignmentId,
    problemId
  }: {
    assignmentId: number
    problemId: number
  }) {
    const assignmentProblem = await this.prisma.assignmentProblem.findFirst({
      where: {
        assignmentId,
        problemId
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
    if (!assignmentDueTime) {
      throw new EntityNotExistException('AssignmentDueTime')
    }
    if (assignmentDueTime.dueTime.getTime() > Date.now()) {
      throw new ForbiddenException('Before the Due Time has passed yet.')
    }
  }

  @Span()
  async checkAssignmentProblem({
    userId,
    checkInput,
    assignmentId,
    problemId
  }: {
    userId: number
    checkInput: CreatePlagiarismCheckInput
    assignmentId: number
    problemId: number
  }) {
    await this.validateAssignment({ assignmentId, problemId })
    return await this.checkProblem({
      userId,
      checkInput,
      problemId,
      idOptions: {
        assignmentId
      }
    })
  }

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
    this.validateRequest({
      problemId,
      language: checkInput.language
    })

    const {
      language,
      checkPreviousSubmissions,
      enableMerging,
      useJplagClustering,
      minTokens
    } = checkInput

    try {
      const check = await this.prisma.checkRequest.create({
        data: {
          problemId,
          result: CheckResultStatus.Pending,
          userId,
          language,
          checkPreviousSubmission: checkPreviousSubmissions,
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
  async getCheckResults({
    checkId,
    take,
    cursor
  }: {
    checkId: number
    take: number
    cursor: number | null
  }) {
    const request = await this.prisma.checkRequest.findUnique({
      where: {
        id: checkId
      },
      select: {
        result: true
      }
    })

    if (!request) {
      throw new NotFoundException('Request not found')
    }
    if (request.result === CheckResultStatus.Pending) {
      throw new NotFoundException(
        'Result not found as it is still being evaluated'
      )
    }
    if (request.result !== CheckResultStatus.Completed) {
      throw new NotFoundException(`Result not found: ${request.result}`)
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

  @Span()
  async getCluster({ clusterId }: { clusterId: number }) {
    const cluster = await this.prisma.plagiarismCluster.findUnique({
      where: {
        id: clusterId
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

  @Span()
  async getDetails({ resultId }: { resultId: number }) {
    const result = await this.prisma.checkResult.findUnique({
      where: {
        id: resultId
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

    this.logger.debug(matches)

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
