import { ConfigService } from '@nestjs/config'
import { Test, type TestingModule } from '@nestjs/testing'
import type { Announcement } from '@generated'
import { expect } from 'chai'
import * as chai from 'chai'
import chaiExclude from 'chai-exclude'
import { PrismaService } from '@libs/prisma'
import { AnnouncementService } from './announcement.service'

chai.use(chaiExclude)

describe('AnnouncementService', () => {
  let service: AnnouncementService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AnnouncementService, PrismaService, ConfigService]
    }).compile()
    service = module.get<AnnouncementService>(AnnouncementService)
  })

  it('should be defined', () => {
    expect(service).to.be.ok
  })

  describe('getProblemAnnouncements', () => {
    it('should return problem announcements', async () => {
      const res = await service.getProblemAnnouncements(1, 1)
      expect(res)
        .excluding(['createTime', 'updateTime'])
        .to.deep.equal([
          {
            id: 6,
            content: 'Announcement_1_0',
            problemId: 1,
            createTime: '2024-01-17T06:44:33.211Z',
            updateTime: '2024-01-17T06:44:33.211Z'
          },
          {
            id: 1,
            content: 'Announcement_0_0',
            problemId: 1,
            createTime: '2024-01-17T06:44:33.207Z',
            updateTime: '2024-01-17T06:44:33.207Z'
          }
        ])
    })

    it('should return empty array when the problem announcement does not exist', async () => {
      const res = await service.getProblemAnnouncements(100, 2)
      expect(res).to.deep.equal([])
    })
  })

  describe('getContestAnnouncements', () => {
    it('should return multiple contest announcements', async () => {
      /*
      pnpm test 실행 전 prisma migrate reset 실행하며 새롭게 seeding됨
      이 과정에서 Announcement간 순서 섞이기 때문에 정렬 후 비교 필요
      */
      const res = (await service.getContestAnnouncements(1, 1)).sort((x, y) => {
        return x.problemId - y.problemId
      })

      expect(res)
        .excluding(['createTime', 'updateTime', 'id', 'content'])
        .to.deep.equal(
          [
            {
              id: 10,
              content: 'Announcement_1_4',
              problemId: 5,
              createTime: '2024-01-26T09:39:30.978Z',
              updateTime: '2024-01-26T09:39:30.978Z'
            },
            {
              id: 6,
              content: 'Announcement_1_0',
              problemId: 1,
              createTime: '2024-01-26T09:39:30.977Z',
              updateTime: '2024-01-26T09:39:30.977Z'
            },
            {
              id: 7,
              content: 'Announcement_1_1',
              problemId: 2,
              createTime: '2024-01-26T09:39:30.977Z',
              updateTime: '2024-01-26T09:39:30.977Z'
            },
            {
              id: 8,
              content: 'Announcement_1_2',
              problemId: 3,
              createTime: '2024-01-26T09:39:30.977Z',
              updateTime: '2024-01-26T09:39:30.977Z'
            },
            {
              id: 9,
              content: 'Announcement_1_3',
              problemId: 4,
              createTime: '2024-01-26T09:39:30.977Z',
              updateTime: '2024-01-26T09:39:30.977Z'
            },
            {
              id: 3,
              content: 'Announcement_0_2',
              problemId: 3,
              createTime: '2024-01-26T09:39:30.976Z',
              updateTime: '2024-01-26T09:39:30.976Z'
            },
            {
              id: 4,
              content: 'Announcement_0_3',
              problemId: 4,
              createTime: '2024-01-26T09:39:30.976Z',
              updateTime: '2024-01-26T09:39:30.976Z'
            },
            {
              id: 5,
              content: 'Announcement_0_4',
              problemId: 5,
              createTime: '2024-01-26T09:39:30.976Z',
              updateTime: '2024-01-26T09:39:30.976Z'
            },
            {
              id: 1,
              content: 'Announcement_0_0',
              problemId: 1,
              createTime: '2024-01-26T09:39:30.975Z',
              updateTime: '2024-01-26T09:39:30.975Z'
            },
            {
              id: 2,
              content: 'Announcement_0_1',
              problemId: 2,
              createTime: '2024-01-26T09:39:30.975Z',
              updateTime: '2024-01-26T09:39:30.975Z'
            }
          ].sort((x, y) => {
            return x.problemId - y.problemId
          })
        )
    })

    it('should return empty array when the contest announcement does not exist', async () => {
      const res = await service.getContestAnnouncements(99999, 1)
      expect(res).to.deep.equal([])
    })
  })
})
