import { Injectable, Logger } from '@nestjs/common'
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
    // 문제가 해당 언어를 지원하는지 확인해야 합니다.
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
        throw new UnprocessableDataException('Failed to create submission')
      }
      throw error
    }
  }
}
