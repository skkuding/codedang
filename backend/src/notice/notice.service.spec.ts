import { Test, TestingModule } from '@nestjs/testing'
import { PrismaService } from 'src/prisma/prisma.service'
import { Group, Notice } from '@prisma/client'
import { NoticeService } from './notice.service'
import { RequestNoticeDto } from './dto/request-notice.dto'

const noticeId = 1
const userId = 1

const noticeData: RequestNoticeDto = {
  group_id: 1,
  title: 'Title',
  content: 'Content',
  visible: true,
  fixed: true
}

const groupData: Group = {
  id: 1,
  created_by_id: 1,
  group_name: 'group_name',
  private: true,
  invitation_code: '1',
  description: 'description',
  create_time: new Date(),
  update_time: new Date()
}

const noticeResult: Notice = {
  id: noticeId,
  created_by_id: userId,
  group_id: noticeData.group_id,
  title: noticeData.title,
  content: noticeData.content,
  visible: noticeData.visible,
  fixed: noticeData.fixed,
  create_time: new Date(),
  update_time: new Date()
}

const db = {
  notice: {
    findUnique: jest.fn().mockResolvedValue(noticeResult),
    create: jest.fn().mockResolvedValue(noticeResult),
    update: jest.fn().mockResolvedValue(noticeResult)
  },
  group: {
    findUnique: jest.fn().mockResolvedValue(groupData)
  }
}

describe('NoticeService', () => {
  let service: NoticeService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NoticeService, { provide: PrismaService, useValue: db }]
    }).compile()

    service = module.get<NoticeService>(NoticeService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('createNotice', () => {
    it('should return new created notice data', async () => {
      const createResult = await service.createNotice(userId, noticeData)
      expect(createResult).toEqual(noticeResult)
    })
  })

  describe('updateNotice', () => {
    it('should return updated Notice', async () => {
      const updateResult = await service.updateNotice(userId, noticeData)
      expect(updateResult).toEqual(noticeResult)
    })
  })
})
