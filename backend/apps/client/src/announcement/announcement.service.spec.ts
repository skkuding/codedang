import { Test, type TestingModule } from '@nestjs/testing'
import { type Problem, Language, Level } from '@prisma/client'
import { expect } from 'chai'
import { stub } from 'sinon'
import { PrismaService } from '@libs/prisma'
import type { Announcement } from '@admin/@generated'
import { AnnouncementService } from './announcement.service'

// faker.js 적용

const problemId = 1
const groupId = 1
const contestId = 1

export const problems: Problem[] = [
  {
    id: 1,
    createdById: 1,
    groupId: 1,
    title: 'public problem',
    description: '',
    inputDescription: '',
    outputDescription: '',
    hint: '',
    languages: [Language.C],
    timeLimit: 0,
    memoryLimit: 0,
    difficulty: Level.Level1,
    source: '',
    exposeTime: undefined,
    createTime: undefined,
    updateTime: undefined,
    inputExamples: [],
    outputExamples: [],
    template: []
  },
  {
    id: 2,
    createdById: 1,
    groupId: 1,
    title: 'problem',
    description: '',
    inputDescription: '',
    outputDescription: '',
    hint: '',
    languages: [Language.Cpp],
    timeLimit: 0,
    memoryLimit: 0,
    difficulty: Level.Level2,
    source: '',
    exposeTime: undefined,
    createTime: undefined,
    updateTime: undefined,
    inputExamples: [],
    outputExamples: [],
    template: []
  }
]
const announcements: Announcement[] = [
  {
    id: 1,
    content: 'Announcement 0',
    problemId: problemId,
    createTime: new Date('1970-12-01T12:00:00.000+09:00'),
    updateTime: new Date('1971-12-01T12:00:00.000+09:00')
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
    it('should return a single problem', async () => {
      mockPrismaService.announcement.findMany.resolves(announcements)
      expect(
        await service.getProblemAnnouncements(problemId, groupId)
      ).to.deep.equal(announcements)
    })
  })

  describe('getGroupAnnouncements', () => {
    it('should return a single problem', async () => {
      mockPrismaService.announcement.findMany.resolves(announcements)
      expect(
        await service.getContestAnnouncements(contestId, groupId)
      ).to.deep.equal(announcements)
    })
  })
})
