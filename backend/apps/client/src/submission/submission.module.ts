import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq'
import {
  CONSUME_CHANNEL,
  PUBLISH_CHANNEL
} from './constants/rabbitmq.constants'
import { SubmissionController } from './submission.controller'
import { SubmissionService } from './submission.service'

@Module({
  imports: [
    ConfigModule.forRoot(),
    RabbitMQModule.forRootAsync(RabbitMQModule, {
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => {
        const channels =
          process.env?.ENABLE_SUBSCRIBER === 'true'
            ? {
                [PUBLISH_CHANNEL]: {
                  prefetchCount: 1,
                  default: true
                },
                [CONSUME_CHANNEL]: {
                  prefetchCount: 1
                }
              }
            : {
                [PUBLISH_CHANNEL]: {
                  prefetchCount: 1,
                  default: true
                }
              }

        return {
          uri: config.get('AMQP_URI'),
          channels,
          connectionInitOptions: { wait: false }
        }
      },
      inject: [ConfigService]
    })
  ],
  controllers: [SubmissionController],
  providers: [SubmissionService]
})
export class SubmissionModule {}
