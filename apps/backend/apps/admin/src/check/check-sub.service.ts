import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Inject, Injectable, Logger, type OnModuleInit } from '@nestjs/common'
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq'
import {
  CHECK_CONSUME_CHANNEL,
  EXCHANGE,
  CHECK_RESULT_KEY,
  CHECK_RESULT_QUEUE,
  ORIGIN_HANDLER_NAME
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
        routingKey: CHECK_RESULT_KEY,
        queue: CHECK_RESULT_QUEUE,
        queueOptions: {
          channel: CHECK_CONSUME_CHANNEL
        }
      },
      ORIGIN_HANDLER_NAME
    )
  }
}
