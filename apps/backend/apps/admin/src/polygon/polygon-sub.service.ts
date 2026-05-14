import { Injectable, Logger, type OnModuleInit } from '@nestjs/common'
import { plainToInstance } from 'class-transformer'
import { validateOrReject, ValidationError } from 'class-validator'
import { Span } from 'nestjs-otel'
import { PolygonAMQPService } from '@libs/amqp'
import {
  GeneratorResultDto,
  ValidatorResultDto
} from './model/polygon-tool-result.dto'

@Injectable()
export class PolygonSubscriptionService implements OnModuleInit {
  private readonly logger = new Logger(PolygonSubscriptionService.name)

  constructor(private readonly amqpService: PolygonAMQPService) {}

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
    this.logger.log(
      {
        submissionId: msg.submissionId,
        resultCode: msg.resultCode,
        generatedTestCases: msg.judgeResult.generatedTestCases,
        totalTestCases: msg.judgeResult.totalTestCases
      },
      'Handled Polygon Generator Result Message'
    )

    // TODO: Generator 실행 결과 수신 후 백엔드 서비스 로직
  }

  @Span()
  async handleValidatorResult(msg: ValidatorResultDto): Promise<void> {
    this.logger.log(
      {
        submissionId: msg.submissionId,
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
