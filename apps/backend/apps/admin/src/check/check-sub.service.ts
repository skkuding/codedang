import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Inject, Injectable, Logger, type OnModuleInit } from '@nestjs/common'
import { AmqpConnection, Nack } from '@golevelup/nestjs-rabbitmq'
import { ValidationError } from 'class-validator'
import {
  CHECK_CONSUME_CHANNEL,
  EXCHANGE,
  CHECK_RESULT_KEY,
  CHECK_RESULT_QUEUE,
  ORIGIN_HANDLER_NAME,
  CONSUME_CHANNEL,
  RESULT_KEY,
  RESULT_QUEUE
} from '@libs/constants'
import { UnprocessableDataException } from '@libs/exception'
import { PrismaService } from '@libs/prisma'

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
          const res = await this.validateJudgerResponse(msg)

          await this.handleJudgerMessage(res)
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
}
