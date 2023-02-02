import { ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { expect } from 'chai'
import { GroupService } from 'src/group/group.service'
import { PrismaService } from 'src/prisma/prisma.service'
import { PublicContestController } from './contest.controller'
import { ContestService } from './contest.service'

describe('PublicContestController', () => {
  let controller: PublicContestController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PublicContestController],
      providers: [
        GroupService,
        ConfigService,
        { provide: ContestService, useValue: {} },
        { provide: PrismaService, useValue: {} }
      ]
    }).compile()

    controller = module.get<PublicContestController>(PublicContestController)
  })

  it('should be defined', () => {
    expect(controller).to.be.ok
  })
})
