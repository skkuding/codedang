import { Test, type TestingModule } from '@nestjs/testing'
import { expect } from 'chai'
import { RolesService } from '@libs/auth'
import {
  ContestProblemController,
  GroupContestProblemController
} from './contest-problem.controller'
import { GroupProblemController, ProblemController } from './problem.controller'
import {
  ContestProblemService,
  ProblemService,
  WorkbookProblemService
} from './problem.service'
import {
  GroupWorkbookProblemController,
  WorkbookProblemController
} from './workbook-problem.controller'

describe('ProblemController', () => {
  let controller: ProblemController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProblemController],
      providers: [{ provide: ProblemService, useValue: {} }]
    }).compile()

    controller = module.get<ProblemController>(ProblemController)
  })

  it('should be defined', () => {
    expect(controller).to.be.ok
  })
})

describe('GroupProblemController', () => {
  let controller: GroupProblemController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GroupProblemController],
      providers: [
        { provide: ProblemService, useValue: {} },
        { provide: RolesService, useValue: {} }
      ]
    }).compile()

    controller = module.get<GroupProblemController>(GroupProblemController)
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
      providers: [{ provide: ContestProblemService, useValue: {} }]
    }).compile()

    controller = module.get<ContestProblemController>(ContestProblemController)
  })

  it('should be defined', () => {
    expect(controller).to.be.ok
  })
})

describe('GroupContestProblemController', () => {
  let controller: GroupContestProblemController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GroupContestProblemController],
      providers: [
        { provide: ContestProblemService, useValue: {} },
        { provide: RolesService, useValue: {} }
      ]
    }).compile()

    controller = module.get<GroupContestProblemController>(
      GroupContestProblemController
    )
  })

  it('should be defined', () => {
    expect(controller).to.be.ok
  })
})

describe('ContestProblemController', () => {
  let controller: WorkbookProblemController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkbookProblemController],
      providers: [{ provide: WorkbookProblemService, useValue: {} }]
    }).compile()

    controller = module.get<WorkbookProblemController>(
      WorkbookProblemController
    )
  })

  it('should be defined', () => {
    expect(controller).to.be.ok
  })
})

describe('GroupWorkbookProblemController', () => {
  let controller: GroupWorkbookProblemController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GroupWorkbookProblemController],
      providers: [
        { provide: WorkbookProblemService, useValue: {} },
        { provide: RolesService, useValue: {} }
      ]
    }).compile()

    controller = module.get<GroupWorkbookProblemController>(
      GroupWorkbookProblemController
    )
  })

  it('should be defined', () => {
    expect(controller).to.be.ok
  })
})
