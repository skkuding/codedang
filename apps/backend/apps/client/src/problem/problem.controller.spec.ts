import { Test, type TestingModule } from '@nestjs/testing'
import { expect } from 'chai'
import { RolesService } from '@libs/auth'
import {
  ProblemController,
  ContestProblemController
} from './problem.controller'
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

describe('ContestProblemController', () => {
  let controller: ContestProblemController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContestProblemController],
      providers: [
        { provide: ContestProblemService, useValue: {} },
        { provide: RolesService, useValue: {} }
      ]
    }).compile()

    controller = module.get<ContestProblemController>(ContestProblemController)
  })

  it('should be defined', () => {
    expect(controller).to.be.ok
  })
})
