import { ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { PrismaService } from 'src/prisma/prisma.service'
import { SubmissionController } from './submission.controller'
import { SubmissionService } from './submission.service'

describe('SubmissionController', () => {
  let controller: SubmissionController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubmissionController],
      providers: [SubmissionService, PrismaService, ConfigService]
    }).compile()

    controller = module.get<SubmissionController>(SubmissionController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
