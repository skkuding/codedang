import { Injectable, Logger } from '@nestjs/common'
import { Language } from '@generated'
import { CheckResultStatus, Prisma } from '@prisma/client'
import { Span } from 'nestjs-otel'
import {
  EntityNotExistException,
  UnprocessableDataException
} from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import { CheckPublicationService } from './check-pub.service'
import { CreatePlagiarismCheckInput } from './model/create-check.input'

@Injectable()
export class CheckService {
  private readonly logger = new Logger(CheckService.name)
  private req: Request | undefined

  constructor(
    private readonly prisma: PrismaService,
    private readonly publish: CheckPublicationService
  ) {}

  @Span()
  async plagiarismCheckSubmissions({
    userId,
    checkInput,
    problemId
  }: {
    userId: number
    checkInput: CreatePlagiarismCheckInput
    problemId: number
  }) {
    // 문제의 제출 기한이 끝났을 때 검사가 가능하게 합니다. (dueTime 이후)
    // 한 학생의 최종 submission을 기준으로 검사합니다.
    // 두 학생이 제출을 완료했는지 확인합니다.

    // dueTime 확인 어떻게 하나요?
    // 과제 문제로 한정?
    // 과제에 대한 학생들의 제출물로 제한할 수 있나요?
    // 모든 학생들에게 적용?
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
        language: checkInput.language
      }
    })
    if (submissionCount < 2) {
      throw new EntityNotExistException('There are not enough submissions')
    }

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
          minTokens: minTokens
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
}
