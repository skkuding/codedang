import { Test, TestingModule } from '@nestjs/testing'
import { PublicProblemController } from './problem.controller'
import { expect } from 'chai'
import { ProblemService } from './problem.service'

describe('PublicProblemController', () => {
  let controller: PublicProblemController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PublicProblemController],
      providers: [{ provide: ProblemService, useValue: {} }]
    }).compile()

    controller = module.get<PublicProblemController>(PublicProblemController)
  })

  it('should be defined', () => {
    expect(controller).to.be.ok
  })
})
