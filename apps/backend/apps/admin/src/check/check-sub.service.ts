import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Inject, Injectable, Logger, type OnModuleInit } from '@nestjs/common'
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq'
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
        return
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
