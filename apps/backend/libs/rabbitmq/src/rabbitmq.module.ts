import { Global, Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq'
import { TraceService } from 'nestjs-otel'
import { PUBLISH_CHANNEL, CONSUME_CHANNEL } from '@libs/constants'
import { SubmissionPublicationService } from './rabbitmq-pub.service'
import { SubmissionSubscriptionService } from './rabbitmq-sub.service'

@Global()
@Module({
  imports: [
    ConfigModule.forRoot(),
    RabbitMQModule.forRootAsync({
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
    })
  ],
  providers: [
    SubmissionSubscriptionService,
    SubmissionPublicationService,
    TraceService
  ],
  exports: [
    SubmissionSubscriptionService,
    SubmissionPublicationService,
    RabbitMQModule,
    TraceService
  ]
})
export class LibsRabbitMQModule {}
