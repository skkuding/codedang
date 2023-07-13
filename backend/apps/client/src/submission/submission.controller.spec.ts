import { Test, type TestingModule } from '@nestjs/testing'
import { expect } from 'chai'
import { PrismaService } from '@libs/prisma'
import {
  ContestSubmissionController,
  GroupContestSubmissionController,
  GroupProblemSubmissionController,
  GroupWorkbookSubmissionController,
  ProblemSubmissionController,
  WorkbookSubmissionController
} from './submission.controller'
import { SubmissionService } from './submission.service'

describe('ProblemSubmissionController', () => {
  let controller: ProblemSubmissionController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProblemSubmissionController],
      providers: [
        { provide: SubmissionService, useValue: {} },
        { provide: PrismaService, useValue: {} }
      ]
    }).compile()

    controller = module.get<ProblemSubmissionController>(
      ProblemSubmissionController
    )
  })

  it('should be defined', () => {
    expect(controller).to.be.ok
  })
})

describe('GroupProblemSubmissionController', () => {
  let controller: GroupProblemSubmissionController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GroupProblemSubmissionController],
      providers: [
        { provide: SubmissionService, useValue: {} },
        { provide: PrismaService, useValue: {} }
      ]
    }).compile()

    controller = module.get<GroupProblemSubmissionController>(
      GroupProblemSubmissionController
    )
  })

  it('should be defined', () => {
    expect(controller).to.be.ok
  })
})

describe('ContestSubmissionController', () => {
  let controller: ContestSubmissionController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContestSubmissionController],
      providers: [
        { provide: SubmissionService, useValue: {} },
        { provide: PrismaService, useValue: {} }
      ]
    }).compile()

    controller = module.get<ContestSubmissionController>(
      ContestSubmissionController
    )
  })

  it('should be defined', () => {
    expect(controller).to.be.ok
  })
})

describe('GroupContestSubmissionController', () => {
  let controller: GroupContestSubmissionController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GroupContestSubmissionController],
      providers: [
        { provide: SubmissionService, useValue: {} },
        { provide: PrismaService, useValue: {} }
      ]
    }).compile()

    controller = module.get<GroupContestSubmissionController>(
      GroupContestSubmissionController
    )
  })

  it('should be defined', () => {
    expect(controller).to.be.ok
  })
})

describe('WorkbookSubmissionController', () => {
  let controller: WorkbookSubmissionController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkbookSubmissionController],
      providers: [
        { provide: SubmissionService, useValue: {} },
        { provide: PrismaService, useValue: {} }
      ]
    }).compile()

    controller = module.get<WorkbookSubmissionController>(
      WorkbookSubmissionController
    )
  })

  it('should be defined', () => {
    expect(controller).to.be.ok
  })
})

describe('GroupWorkbookSubmissionController', () => {
  let controller: GroupWorkbookSubmissionController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GroupWorkbookSubmissionController],
      providers: [
        { provide: SubmissionService, useValue: {} },
        { provide: PrismaService, useValue: {} }
      ]
    }).compile()

    controller = module.get<GroupWorkbookSubmissionController>(
      GroupWorkbookSubmissionController
    )
  })

  it('should be defined', () => {
    expect(controller).to.be.ok
  })
})
