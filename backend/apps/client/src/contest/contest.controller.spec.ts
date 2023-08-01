import { Test, type TestingModule } from '@nestjs/testing'
import { expect } from 'chai'
import { RolesService } from '@libs/auth'
import { ContestController, GroupContestController } from './contest.controller'
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
    expect(controller).to.be.ok
  })
})

describe('GroupContestController', () => {
  let controller: GroupContestController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GroupContestController],
      providers: [
        { provide: RolesService, useValue: {} },
        { provide: ContestService, useValue: {} }
      ]
    }).compile()

    controller = module.get<GroupContestController>(GroupContestController)
  })

  it('should be defined', () => {
    expect(controller).to.be.ok
  })
})
