import { Injectable, Logger } from '@nestjs/common'
import type { Language } from '@prisma/client'
import { CheckResultStatus, Prisma } from '@prisma/client'
import { Span } from 'nestjs-otel'
import {
  EntityNotExistException,
  UnprocessableDataException
} from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import { CheckPublicationService } from './check-pub.service'
import { CheckResultOutput } from './model/check-result.output'
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
    const problem = await this.prisma.problem.findFirst({
      where: {
        id: problemId
      }
    })
    if (!problem) {
      throw new EntityNotExistException('Problem')
    }

    const submissionCount = await this.prisma.submission.count({
      where: {
        problemId: problemId,
        language: language
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
  }) {}

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
        assignmentId: assignmentId
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
      problemId: problemId,
      language: checkInput.language
    })

    const checkId = Date.now().toString()
    const {
      language,
      checkPreviousSubmissions,
      enableMerging,
      useJplagClustering,
      minTokens
    } = checkInput

    try {
      const check = await this.prisma.plagiarismCheck.create({
        data: {
          checkId: checkId,
          problemId: problemId,
          result: CheckResultStatus.Pending,
          userId: userId,
          language: language,
          checkPreviousSubmission: checkPreviousSubmissions,
          enableMerging: enableMerging,
          useJplagClustering: useJplagClustering,
          minTokens: minTokens,
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
    limit
  }: {
    checkId: number
    limit: number
  }) {
    return [
      // dummy data
      new CheckResultOutput()
    ]
  }
}
