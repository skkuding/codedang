import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Inject, Injectable, Logger, type OnModuleInit } from '@nestjs/common'
import { AmqpConnection, Nack } from '@golevelup/nestjs-rabbitmq'
import { CheckResultStatus, type CheckResult } from '@prisma/client'
import { plainToInstance } from 'class-transformer'
import { validateOrReject, ValidationError } from 'class-validator'
import { Span } from 'nestjs-otel'
import {
  CHECK_CONSUME_CHANNEL,
  EXCHANGE,
  CHECK_RESULT_KEY,
  CHECK_RESULT_QUEUE,
  ORIGIN_HANDLER_NAME,
  CONSUME_CHANNEL,
  RESULT_KEY,
  RESULT_QUEUE,
  Status,
  CheckStatus
} from '@libs/constants'
import { UnprocessableDataException } from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import { CheckResponse } from './model/check-response.dto'

@Injectable()
export class CheckSubscriptionService implements OnModuleInit {
  private readonly logger = new Logger(CheckSubscriptionService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly amqpConnection: AmqpConnection,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
  ) {}

  onModuleInit() {
    this.amqpConnection.createSubscriber(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      async (msg: object, raw: any) => {
        try {
          const res = await this.validateCheckResponse(msg)
          await this.handleCheckMessage(res)
        } catch (error) {
          if (
            Array.isArray(error) &&
            error.every((e) => e instanceof ValidationError)
          ) {
            this.logger.error(error, 'Message format error')
          } else if (error instanceof UnprocessableDataException) {
            this.logger.error(error, 'Iris exception')
          } else {
            this.logger.error(error, 'Unexpected error')
          }
          return new Nack()
        }
      },
      {
        exchange: EXCHANGE,
        routingKey: RESULT_KEY,
        queue: RESULT_QUEUE,
        queueOptions: {
          channel: CONSUME_CHANNEL
        }
      },
      ORIGIN_HANDLER_NAME
    )
  }

  @Span()
  async validateCheckResponse(msg: object): Promise<CheckResponse> {
    const res: CheckResponse = plainToInstance(CheckResponse, msg)
    await validateOrReject(res)

    return res
  }

  @Span()
  async handleCheckMessage(msg: CheckResponse): Promise<void> {
    const status = CheckStatus(msg.resultCode)

    if (
      status === CheckResultStatus.ServerError ||
      status === CheckResultStatus.JplagError
    ) {
      await this.handleCheckError(status, msg)
      return
    }

    await this.createCheckResult(msg.checkId)
  }

  @Span()
  async handleCheckError(
    status: CheckResultStatus,
    msg: CheckResponse
  ): Promise<void> {
    const checkRequest = await this.prisma.checkRequest.findUnique({
      where: {
        id: msg.checkId,
        result: status
      },
      select: {
        id: true
      }
    })

    if (!checkRequest) return

    await this.prisma.checkRequest.update({
      where: {
        id: msg.checkId
      },
      data: {
        result: status
      }
    })

    if (status === CheckResultStatus.ServerError)
      throw new UnprocessableDataException(`${msg.checkId} ${msg.error}`)
  }

  @Span()
  async createCheckResult(checkId: number): Promise<void> {}
}
