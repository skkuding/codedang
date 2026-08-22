import { Injectable, Logger, type OnModuleInit } from '@nestjs/common'
import { plainToInstance } from 'class-transformer'
import { validateOrReject, ValidationError } from 'class-validator'
import { Span } from 'nestjs-otel'
import { PolygonAMQPService } from '@libs/amqp'
import { UnprocessableDataException } from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import {
  GeneratorResultDto,
  ValidatorResultDto
} from './model/polygon-tool-result.dto'

@Injectable()
export class PolygonSubscriptionService implements OnModuleInit {
  private readonly logger = new Logger(PolygonSubscriptionService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly amqpService: PolygonAMQPService
  ) {}

  onModuleInit() {
    this.amqpService.setMessageHandlers({
      onGenerateResult: async (msg: object) => {
        try {
          this.logger.debug(msg, 'Received Polygon Generator Result Message')
          const res = await this.validateGeneratorResultMessage(msg)
          await this.handleGeneratorResult(res)
        } catch (error) {
          this.logError(error, 'Unexpected generator result error')
          throw error
        }
      },
      onValidateResult: async (msg: object) => {
        try {
          this.logger.debug(msg, 'Received Polygon Validator Result Message')
          const res = await this.validateValidatorResultMessage(msg)
          await this.handleValidatorResult(res)
        } catch (error) {
          this.logError(error, 'Unexpected validator result error')
          throw error
        }
      }
    })

    this.amqpService.startGeneratorSubscription()
    this.amqpService.startValidatorSubscription()
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
    const problemId = Number(msg.messageId)
    if (!Number.isInteger(problemId)) {
      throw new UnprocessableDataException(
        'Invalid generator exercution messageId'
      )
    }

    const lastRunPass = msg.resultCode === 0

    await this.prisma.polygonProblem.update({
      where: { id: problemId },
      data: { lastRunPass }
    })

    this.logger.log(
      {
        messageId: msg.messageId,
        problemId,
        resultCode: msg.resultCode,
        lastRunPass,
        generatedTestCases: msg.judgeResult.generatedTestCases,
        totalTestCases: msg.judgeResult.totalTestCases
      },
      'Handled Polygon Generator Result Message'
    )
  }

  @Span()
  async handleValidatorResult(msg: ValidatorResultDto): Promise<void> {
    const problemId = Number(msg.messageId)
    if (!Number.isInteger(problemId)) {
      throw new UnprocessableDataException(
        'Invalid validator execution messageId'
      )
    }

    const lastRunPass = msg.resultCode === 0

    await this.prisma.polygonProblem.update({
      where: { id: problemId },
      data: { lastRunPass }
    })

    this.logger.log(
      {
        messageId: msg.messageId,
        resultCode: msg.resultCode,
        isValid: msg.judgeResult.isValid,
        testcaseCount: msg.judgeResult.testcaseCount
      },
      'Handled Polygon Validator Result Message'
    )

    // TODO: Validator 실행 결과 수신 후 백엔드 서비스 로직
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
