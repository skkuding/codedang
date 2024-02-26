import { Test, type TestingModule } from '@nestjs/testing'
import { expect } from 'chai'
import { RolesService } from '@libs/auth'
import { ProblemController } from './problem.controller'
import {
  ContestProblemService,
  ProblemService,
  WorkbookProblemService
} from './problem.service'

describe('ProblemController', () => {
  let controller: ProblemController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProblemController],
      providers: [
        { provide: ProblemService, useValue: {} },
        { provide: ContestProblemService, useValue: {} },
        { provide: WorkbookProblemService, useValue: {} },
        { provide: RolesService, useValue: {} }
      ]
    }).compile()

    controller = module.get<ProblemController>(ProblemController)
  })

  it('should be defined', () => {
    expect(controller).to.be.ok
  })
})
