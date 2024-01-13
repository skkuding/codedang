import { Test, type TestingModule } from '@nestjs/testing'
import { expect } from 'chai'
import { stub } from 'sinon'
import { PrismaService } from '@libs/prisma'
import type { Announcement } from '@admin/@generated'
import { AnnouncementService } from './announcement.service'

const problemId = 1
const groupId = 1
const contestId = 1

const announcements: Announcement[] = [
  {
    id: 1,
    content: 'Announcement 0',
    problemId,
    createTime: new Date('1970-12-01T12:00:00.000+09:00'),
    updateTime: new Date('1971-12-01T12:00:00.000+09:00')
  },
  {
    id: 2,
    content: 'Announcement 1',
    problemId,
    createTime: new Date('1980-12-01T12:00:00.000+09:00'),
    updateTime: new Date('1981-12-01T12:00:00.000+09:00')
  }
]

const mockPrismaService = {
  announcement: {
    findMany: stub().resolves(announcements)
  }
}

describe('AnnouncementService', () => {
  let service: AnnouncementService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnnouncementService,
        {
          provide: PrismaService,
          useValue: mockPrismaService
        }
      ]
    }).compile()
    service = module.get<AnnouncementService>(AnnouncementService)
  })

  it('should be defined', () => {
    expect(service).to.be.ok
  })

  describe('getProblemAnnouncements', () => {
    it('should return two problem announcements', async () => {
      mockPrismaService.announcement.findMany.resolves(announcements)
      expect(
        await service.getProblemAnnouncements(problemId, groupId)
      ).to.deep.equal(announcements)
    })

    it('should return empty array when the problem announcement does not exist', async () => {
      mockPrismaService.announcement.findMany.resolves([])
      expect(
        await service.getProblemAnnouncements(problemId + 1, groupId)
      ).to.deep.equal([])
    })
  })

  describe('getContestAnnouncements', () => {
    it('should return multiple contest announcements', async () => {
      mockPrismaService.announcement.findMany.resolves(announcements)
      expect(
        await service.getContestAnnouncements(contestId, groupId)
      ).to.deep.equal(announcements)
    })

    it('should return empty array when the contest announcement does not exist', async () => {
      mockPrismaService.announcement.findMany.resolves([])
      expect(
        await service.getContestAnnouncements(contestId + 1, groupId)
      ).to.deep.equal([])
    })
  })
})
