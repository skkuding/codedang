import { Test, TestingModule } from '@nestjs/testing'
import { ContestController } from './contest.controller'
import { ContestService } from './contest.service'

describe('ContestController', () => {
  let controller: ContestController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContestController],
      providers: [{ provide: ContestService, useValue: {} }]
    }).compile()

    controller = module.get<ContestController>(ContestController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
