import { Test, type TestingModule } from '@nestjs/testing'
import { expect } from 'chai'
import { PrismaService } from '@libs/prisma'
import { SubmissionController } from './submission.controller'
import { SubmissionService } from './submission.service'

describe('SubmissionController', () => {
  let controller: SubmissionController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubmissionController],
      providers: [
        { provide: SubmissionService, useValue: {} },
        { provide: PrismaService, useValue: {} }
      ]
    }).compile()

    controller = module.get<SubmissionController>(SubmissionController)
  })

  it('should be defined', () => {
    expect(controller).to.be.ok
  })
})
