import { Test, TestingModule } from '@nestjs/testing'
import { SubmissionController } from './submission.controller'
import { SubmissionService } from './submission.service'

describe('SubmissionController', () => {
  let controller: SubmissionController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubmissionController],
      providers: [{ provide: SubmissionService, useValue: {} }]
    }).compile()

    controller = module.get<SubmissionController>(SubmissionController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
