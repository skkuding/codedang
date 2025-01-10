import { ConfigService } from '@nestjs/config'
import { Test, type TestingModule } from '@nestjs/testing'
import { expect } from 'chai'
import * as chai from 'chai'
import chaiExclude from 'chai-exclude'
import {
  PrismaService,
  PrismaTestService,
  type FlatTransactionClient
} from '@libs/prisma'
import { AnnouncementService } from './announcement.service'

chai.use(chaiExclude)

describe('AnnouncementService', () => {
  let service: AnnouncementService
  let prisma: PrismaTestService
  let transaction: FlatTransactionClient

  before(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnnouncementService,
        PrismaTestService,
        {
          provide: PrismaService,
          useExisting: PrismaTestService
        },
        ConfigService
      ]
    }).compile()

    service = module.get<AnnouncementService>(AnnouncementService)
    prisma = module.get<PrismaTestService>(PrismaTestService)
  })

  beforeEach(async () => {
    transaction = await prisma.$begin()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(service as any).prisma = transaction
  })

  afterEach(async () => {
    await transaction.$rollback()
  })

  after(async () => {
    await prisma.$disconnect()
  })

  it('should be defined', () => {
    expect(service).to.be.ok
  })

  describe('getProblemAnnouncements', () => {
    it('should return problem announcements', async () => {
      const res = await service.getProblemAnnouncements(1, 1, 1, 1)
      expect(res)
        .excluding(['createTime', 'updateTime', 'content'])
        .to.deep.equal([
          {
            id: 6,
            contestId: 1,
            problemId: 1
          }
        ])
    })
  })

  describe('getContestAnnouncements', () => {
    it('should return multiple contest announcements', async () => {
      const res = await service.getContestAnnouncements(1, 1)
      expect(res)
        .excluding(['createTime', 'updateTime', 'content'])
        .to.deep.equal([
          {
            id: 6,
            contestId: 1,
            problemId: 0
          },
          {
            id: 1,
            contestId: 1,
            problemId: null
          }
        ])
    })
  })
})
