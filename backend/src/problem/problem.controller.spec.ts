import { Test, TestingModule } from '@nestjs/testing'
import { ProblemController } from './problem.controller'

describe('ProblemController', () => {
  let controller: ProblemController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProblemController],
      providers: [{ provide: 'problem', useValue: {} }]
    }).compile()

    controller = module.get<ProblemController>(ProblemController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
