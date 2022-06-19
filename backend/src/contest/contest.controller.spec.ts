import { Test, TestingModule } from '@nestjs/testing'
import { ContestController } from './contest.controller'

describe('ContestController', () => {
  let controller: ContestController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContestController]
    }).compile()

    controller = module.get<ContestController>(ContestController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
