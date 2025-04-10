import { Test, type TestingModule } from '@nestjs/testing'
import { expect } from 'chai'
import { RolesService } from '@libs/auth'
import {
  SubmissionController,
  ContestSubmissionController,
  AssignmentSubmissionController
} from '../submission.controller'
import { SubmissionService } from '../submission.service'

describe('SubmissionController', () => {
  let controller: SubmissionController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubmissionController],
      providers: [
        { provide: SubmissionService, useValue: {} },
        { provide: RolesService, useValue: {} }
      ]
    }).compile()

    controller = module.get<SubmissionController>(SubmissionController)
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
        { provide: RolesService, useValue: {} }
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

describe('AssignmentSubmissionController', () => {
  let controller: AssignmentSubmissionController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AssignmentSubmissionController],
      providers: [
        { provide: SubmissionService, useValue: {} },
        { provide: RolesService, useValue: {} }
      ]
    }).compile()

    controller = module.get<AssignmentSubmissionController>(
      AssignmentSubmissionController
    )
  })

  it('should be defined', () => {
    expect(controller).to.be.ok
  })
})
