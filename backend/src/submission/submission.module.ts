import { Module } from '@nestjs/common'
import { SubmissionController } from './submission.controller'
import { SubmissionService } from './submission.service'
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq'
import { ConfigService } from '@nestjs/config'

@Module({
  imports: [
    RabbitMQModule.forRootAsync(RabbitMQModule, {
      useFactory: (config: ConfigService) => ({
        exchanges: [
          {
            name: 'submission-exchange',
            type: 'direct',
            options: { durable: true }
          }
        ],
        uri: config.get('AMQP_URI'),
        connectionInitOptions: { wait: false }
      }),
      inject: [ConfigService]
    })
  ],
  controllers: [SubmissionController],
  providers: [SubmissionService]
})
export class SubmissionModule {}
