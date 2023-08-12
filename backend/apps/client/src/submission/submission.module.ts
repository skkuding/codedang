import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq'
import { RolesModule } from '@libs/auth'
import { CONSUME_CHANNEL, PUBLISH_CHANNEL } from '@libs/constants'
import {
  ContestSubmissionController,
  GroupContestSubmissionController,
  GroupProblemSubmissionController,
  GroupWorkbookSubmissionController,
  ProblemSubmissionController,
  WorkbookSubmissionController
} from './submission.controller'
import { SubmissionService } from './submission.service'

@Module({
  imports: [
    ConfigModule.forRoot(),
    RabbitMQModule.forRootAsync(RabbitMQModule, {
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => {
        const channels = {
          [PUBLISH_CHANNEL]: {
            prefetchCount: 1,
            default: true
          },
          [CONSUME_CHANNEL]: {
            prefetchCount: 1
          }
        }

        const uri =
          (config.get('RABBITMQ_SSL', false) ? 'amqps://' : 'amqp://') +
          config.get('RABBITMQ_DEFAULT_USER') +
          ':' +
          config.get('RABBITMQ_DEFAULT_PASS') +
          '@' +
          config.get('RABBITMQ_HOST') +
          ':' +
          config.get('RABBITMQ_PORT') +
          '/' +
          config.get('RABBITMQ_DEFAULT_VHOST')

        return {
          uri,
          channels,
          connectionInitOptions: { wait: false }
        }
      },
      inject: [ConfigService]
    }),
    RolesModule
  ],
  controllers: [
    ProblemSubmissionController,
    GroupProblemSubmissionController,
    ContestSubmissionController,
    GroupContestSubmissionController,
    WorkbookSubmissionController,
    GroupWorkbookSubmissionController
  ],
  providers: [SubmissionService]
})
export class SubmissionModule {}
