import { Test, type TestingModule } from '@nestjs/testing'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import { expect } from 'chai'
import {
  PrismaService,
  PrismaTestService,
  type FlatTransactionClient
} from '@libs/prisma'
import { AnnouncementService } from './announcement.service'

const contestId = 1
const problemOrder = 1
const content = 'test'
const updatedContent = 'updated'
describe('AnnouncementService', () => {
  let service: AnnouncementService
  let prisma: PrismaTestService
  let transaction: FlatTransactionClient

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnnouncementService,
        PrismaTestService,
        {
          provide: PrismaService,
          useExisting: PrismaTestService
        }
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

  describe('createAnnouncement', () => {
    it('should return created announcement', async () => {
      const result = await service.createAnnouncement({
        contestId,
        problemOrder,
        content
      })
      expect(result).has.property('id')
      expect(result).has.property('contestId')
      expect(result).has.property('problemId')
      expect(result).has.property('content')
      expect(result).has.property('createTime')
      expect(result).has.property('updateTime')
    })

    it('should return created announcement without problemId', async () => {
      const result = await service.createAnnouncement({
        contestId,
        content
      })
      expect(result).has.property('id')
      expect(result).has.property('contestId')
      expect(result).has.property('problemId', null)
      expect(result).has.property('content')
      expect(result).has.property('createTime')
      expect(result).has.property('updateTime')
    })

    it('should rejected if contestId is not exist', async () => {
      await expect(
        service.createAnnouncement({
          content,
          contestId: 999
        })
      ).to.be.rejectedWith(PrismaClientKnownRequestError)
    })

    it('should rejected if problemOrder is not exist', async () => {
      await expect(
        service.createAnnouncement({
          content,
          contestId,
          problemOrder: 999
        })
      ).to.be.rejectedWith(PrismaClientKnownRequestError)
    })

    it('should rejected if problem is not in contest', async () => {
      await expect(
        service.createAnnouncement({
          content,
          contestId,
          problemOrder: 4
        })
      ).to.be.rejectedWith(PrismaClientKnownRequestError)
    })
  })

  describe('getAnnouncementsByContestId', () => {
    it('should return announcement by contestId', async () => {
      const result = await service.getAnnouncementsByContestId(1)
      expect(result).to.be.an('array')
      expect(result[0]).to.be.an('object')
      expect(result[0]).has.property('id')
      expect(result[0]).has.property('content')
      expect(result[0]).has.property('createTime')
      expect(result[0]).has.property('updateTime')
    })

    it('should rejected if contestId is not exist', async () => {
      await expect(service.getAnnouncementsByContestId(999)).to.be.rejectedWith(
        PrismaClientKnownRequestError
      )
    })
  })

  describe('getAnnouncementById', () => {
    it('should return announcement by id', async () => {
      const result = await service.getAnnouncementById(1)
      expect(result).to.be.an('object')
      expect(result).has.property('id')
      expect(result).has.property('contestId')
      expect(result).has.property('problemId')
      expect(result).has.property('content')
      expect(result).has.property('createTime')
      expect(result).has.property('updateTime')
    })

    it('should rejected if announcement not exist', async () => {
      await expect(service.getAnnouncementById(999)).to.be.rejectedWith(
        PrismaClientKnownRequestError
      )
    })
  })

  describe('updateAnnouncement', () => {
    it('should return updated announcement', async () => {
      const result = await service.updateAnnouncement({
        id: 1,
        content: updatedContent
      })
      expect(result).to.be.an('object')
      expect(result).has.property('id')
      expect(result).has.property('contestId')
      expect(result).has.property('problemId')
      expect(result).has.property('content', updatedContent)
      expect(result).has.property('createTime')
      expect(result).has.property('updateTime')
    })

    it('should rejected if announcement not exist', async () => {
      await expect(
        service.updateAnnouncement({
          id: 999,
          content: updatedContent
        })
      ).to.be.rejectedWith(PrismaClientKnownRequestError)
    })
  })

  describe('removeAnnouncement', () => {
    it('should return removed announcement', async () => {
      const result = await service.removeAnnouncement(1)
      expect(result).to.be.an('object')
      expect(result).has.property('id')
      expect(result).has.property('contestId')
      expect(result).has.property('problemId')
      expect(result).has.property('content')
      expect(result).has.property('createTime')
      expect(result).has.property('updateTime')
    })

    it('should rejected if announcement not exist', async () => {
      await expect(service.removeAnnouncement(999)).to.be.rejectedWith(
        PrismaClientKnownRequestError
      )
    })
  })
})
