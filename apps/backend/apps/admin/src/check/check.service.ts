import { Injectable, Logger } from '@nestjs/common'
import { CheckResultStatus, Prisma } from '@prisma/client'
import { Span } from 'nestjs-otel'
import {
  EntityNotExistException,
  UnprocessableDataException
} from '@libs/exception'
import type { PrismaService } from '@libs/prisma'
import type { CheckPublicationService } from './check-pub.service'
import type { CreatePlagiarismCheckDto } from './class/create-check.dto'

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
    userIp,
    checkDto,
    problemId
  }: {
    userId: number
    userIp: string
    checkDto: CreatePlagiarismCheckDto
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
        language: checkDto.language
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
    } = checkDto

    try {
      const check = await this.prisma.plagiarismCheck.create({
        data: {
          checkId: checkId,
          problemId: problemId,
          result: CheckResultStatus.Pending,
          userId: userId,
          userIp: userIp,
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
