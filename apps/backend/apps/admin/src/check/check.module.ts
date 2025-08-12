import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq'
import { RolesModule } from '@libs/auth'
import { CHECK_CONSUME_CHANNEL, CHECK_PUBLISH_CHANNEL } from '@libs/constants'
import { StorageModule } from '@libs/storage'
import { CheckPublicationService } from './check-pub.service'
import { CheckSubscriptionService } from './check-sub.service'
import { CheckResolver } from './check.resolver'
import { CheckService } from './check.service'
import { FileService } from './file.service'

@Module({
  imports: [
    ConfigModule.forRoot(),
    RabbitMQModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => {
        const channels = {
          [CHECK_PUBLISH_CHANNEL]: {
            prefetchCount: 1,
            default: true
          },
          [CHECK_CONSUME_CHANNEL]: {
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
    RolesModule,
    StorageModule
  ],
  providers: [
    CheckService,
    CheckPublicationService,
    CheckSubscriptionService,
    CheckResolver,
    FileService
  ]
})
export class CheckModule {}
