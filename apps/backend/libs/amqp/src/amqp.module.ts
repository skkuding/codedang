import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq'
import { readFileSync } from 'fs'
import { CONSUME_CHANNEL, PUBLISH_CHANNEL } from '@libs/constants'
import {
  CheckAMQPService,
  JudgeAMQPService,
  PolygonAMQPService
} from './amqp.service'

@Module({
  imports: [
    ConfigModule,
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
          (config.get('RABBITMQ_SSL') === 'true' ? 'amqps://' : 'amqp://') +
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
          connectionInitOptions: { wait: false },
          ...(config.get('RABBITMQ_SSL') === 'true' && {
            connectionManagerOptions: {
              connectionOptions: {
                ca: [readFileSync('/etc/ssl/rabbitmq/ca.crt')]
              }
            }
          })
        }
      },
      inject: [ConfigService]
    })
  ],
  providers: [JudgeAMQPService, CheckAMQPService, PolygonAMQPService],
  exports: [JudgeAMQPService, CheckAMQPService, PolygonAMQPService]
})
export class AMQPModule {}
