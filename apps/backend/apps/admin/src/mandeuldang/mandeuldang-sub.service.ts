import { Injectable, Logger, type OnModuleInit } from '@nestjs/common'
import { MandeuldangRunStatus, TestFileType } from '@prisma/client'
import { plainToInstance } from 'class-transformer'
import { validateOrReject, ValidationError } from 'class-validator'
import { Span } from 'nestjs-otel'
import { MandeuldangAMQPService } from '@libs/amqp'
import { UnprocessableDataException } from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import { StorageService } from '@libs/storage'
import {
  GeneratorResultDto,
  ValidatorResultDto
} from './model/mandeuldang-tool-result.dto'

@Injectable()
export class MandeuldangSubscriptionService implements OnModuleInit {
  private readonly logger = new Logger(MandeuldangSubscriptionService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly amqpService: MandeuldangAMQPService,
    private readonly storageService: StorageService
  ) {}

  onModuleInit() {
    this.amqpService.setMessageHandlers({
      onGenerateResult: async (msg: object) => {
        try {
          this.logger.debug(
            msg,
            'Received Mandeuldang Generator Result Message'
          )
          const res = await this.validateGeneratorResultMessage(msg)
          await this.handleGeneratorResult(res)
        } catch (error) {
          this.logError(error, 'Unexpected generator result error')
        }
      },
      onValidateResult: async (msg: object) => {
        try {
          this.logger.debug(
            msg,
            'Received Mandeuldang Validator Result Message'
          )
          const res = await this.validateValidatorResultMessage(msg)
          await this.handleValidatorResult(res)
        } catch (error) {
          this.logError(error, 'Unexpected validator result error')
        }
      }
    })

    this.amqpService.startSubscription()
  }

  private async updateLatestRuns(problemId: number) {
    const tools = await this.prisma.mandeuldangTool.findMany({
      where: { problemId }
    })

    const latestRuns = await Promise.all(
      tools.map((tool) =>
        this.prisma.mandeuldangRunRequest.findFirst({
          where: {
            problemId,
            toolType: tool.toolType
          },
          orderBy: { submittedAt: 'desc' }
        })
      )
    )

    const allPassed =
      latestRuns.length > 0 &&
      latestRuns.every((run) => run?.status === MandeuldangRunStatus.Success)

    await this.prisma.mandeuldangProblem.update({
      where: { id: problemId },
      data: { lastRunPass: allPassed }
    })
  }
  /**
   * Generator를 실행한 결과 메세지를 class-validator를 통해 검증합니다.
   *
   * @param msg RabbitMQ에서 전달받은 raw 메세지 객체
   * validateOrReject(): DTO 인스턴스가 데코레이터 조건을 만족하면 통과하고, 만족하지 않으면 예외를 던지는 메서드
   * @returns 검증을 거친 GeneratorResultDto 객체
   */
  @Span()
  async validateGeneratorResultMessage(
    msg: object
  ): Promise<GeneratorResultDto> {
    const res = plainToInstance(GeneratorResultDto, msg)
    await validateOrReject(res, {
      whitelist: true,
      forbidNonWhitelisted: true
    })

    return res
  }

  /**
   * Validator를 실행한 결과 메세지를 class-validator를 통해 검증합니다.
   *
   * @param msg RabbitMQ에서 전달받은 raw 메세지 객체
   * validateOrReject(): DTO 인스턴스가 데코레이터 조건을 만족하면 통과하고, 만족하지 않으면 예외를 던지는 메서드
   * @returns 검증을 거친 ValidatorResultDto 객체
   */
  @Span()
  async validateValidatorResultMessage(
    msg: object
  ): Promise<ValidatorResultDto> {
    const res = plainToInstance(ValidatorResultDto, msg)
    await validateOrReject(res, {
      whitelist: true,
      forbidNonWhitelisted: true
    })

    return res
  }

  @Span()
  async handleGeneratorResult(msg: GeneratorResultDto): Promise<void> {
    const requestId = Number(msg.messageId)
    if (isNaN(requestId)) {
      throw new UnprocessableDataException(
        `Invalid messageId format: ${msg.messageId}`
      )
    }

    const request = await this.prisma.mandeuldangRunRequest.findUniqueOrThrow({
      where: {
        id: requestId
      }
    })

    const isSuccess = msg.resultCode === 0
    const now = new Date()

    await this.prisma.mandeuldangRunRequest.update({
      where: { id: requestId },
      data: {
        status: isSuccess
          ? MandeuldangRunStatus.Success
          : MandeuldangRunStatus.Failed,
        resultCode: msg.resultCode,
        completedAt: now
      }
    })

    await this.updateLatestRuns(msg.problemId)

    this.logger.log(
      {
        requestId: request.id,
        problemId: request.problemId,
        resultCode: msg.resultCode,
        isSuccess,
        generatedCount: msg.toolResult.generatedCount,
        requestedCount: msg.toolResult.requestedCount
      },
      'Handled Mandeuldang Generator Result Message'
    )

    if (isSuccess && msg.toolResult.testcaseIds?.length) {
      const fileRequests = msg.toolResult.testcaseIds.flatMap((testcaseId) => {
        const baseName = String(testcaseId)
        return (['in', 'out'] as const).map((ext) => ({
          fileName: `${baseName}.${ext}`,
          baseName,
          ext
        }))
      })

      const testFileData = await Promise.all(
        fileRequests.map(async ({ fileName, baseName, ext }) => {
          const filePath = `${msg.problemId}/${fileName}`
          const fileSize = await this.storageService.getObjectSize(
            filePath,
            'testcase'
          )

          return {
            problemId: msg.problemId,
            fileName,
            baseName,
            fileType: ext === 'in' ? TestFileType.IN : TestFileType.OUT,
            filePath,
            fileSize: BigInt(fileSize)
          }
        })
      )

      if (testFileData.length > 0) {
        await this.prisma.$transaction([
          this.prisma.mandeuldangTestFile.deleteMany({
            where: { problemId: msg.problemId }
          }),
          this.prisma.mandeuldangTestFile.createMany({ data: testFileData })
        ])
      }
    }
  }

  @Span()
  async handleValidatorResult(msg: ValidatorResultDto): Promise<void> {
    const requestId = Number(msg.messageId)
    if (isNaN(requestId)) {
      throw new UnprocessableDataException(
        `Invalid messageId format: ${msg.messageId}`
      )
    }

    const request = await this.prisma.mandeuldangRunRequest.findUniqueOrThrow({
      where: {
        id: requestId
      }
    })

    const isSuccess = msg.resultCode === 0 && msg.toolResult.isAllValid
    const now = new Date()

    await this.prisma.mandeuldangRunRequest.update({
      where: { id: requestId },
      data: {
        status: isSuccess
          ? MandeuldangRunStatus.Success
          : MandeuldangRunStatus.Failed,
        resultCode: msg.resultCode,
        completedAt: now
      }
    })

    await this.updateLatestRuns(msg.problemId)

    this.logger.log(
      {
        requestId: request.id,
        problemId: request.problemId,
        isAllValid: msg.toolResult.isAllValid,
        testcaseCount: msg.toolResult.testcaseCount
      },
      'Handled Mandeuldang Validator Result Message'
    )
  }

  private logError(error: unknown, message: string) {
    if (
      Array.isArray(error) &&
      error.every((e) => e instanceof ValidationError)
    ) {
      this.logger.error(JSON.stringify(error, null, 2), 'Message format error')
      return
    }

    this.logger.error(error, message)
  }
}
