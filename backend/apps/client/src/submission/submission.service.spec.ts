import { Test, type TestingModule } from '@nestjs/testing'
import { expect } from 'chai'
import { PrismaService } from '@libs/prisma'
import { SubmissionService } from './submission.service'
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq'

describe('SubmissionService', () => {
  let service: SubmissionService
  let amqpConnection: AmqpConnection

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubmissionService,
        { provide: PrismaService, useValue: {} },
        {
          provide: AmqpConnection,
          useFactory: () => ({
            publish: () => [],
            createSubscriber: () => []
          })
        }
      ]
    }).compile()

    service = module.get<SubmissionService>(SubmissionService)
    amqpConnection = module.get<AmqpConnection>(AmqpConnection)
  })

  it('should be defined', () => {
    expect(service).to.be.ok
  })
})
