import { Test, TestingModule } from '@nestjs/testing'
import { PrismaService } from 'src/prisma/prisma.service'
import { Group, Notice } from '@prisma/client'
import { NoticeService } from './notice.service'
import { RequestNoticeDto } from './dto/request-notice.dto'
import {
  EntityNotExistException,
  UnprocessableDataException
} from 'src/common/exception/business.exception'

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
    beforeEach(() => {
      db.group.findUnique.mockResolvedValue(groupData)
    })

    it('should return new created notice data', async () => {
      const createResult = await service.createNotice(userId, noticeData)
      expect(createResult).toEqual(noticeResult)
    })

    it('should throw error when given group does not exist', async () => {
      db.group.findUnique.mockResolvedValue(null)
      await expect(service.createNotice(userId, noticeData)).rejects.toThrow(
        EntityNotExistException
      )
    })
  })

  describe('updateNotice', () => {
    beforeEach(() => {
      db.notice.findUnique.mockResolvedValue(noticeResult)
    })

    it('should return updated Notice', async () => {
      const updateResult = await service.updateNotice(noticeId, noticeData)
      expect(updateResult).toEqual(noticeResult)
    })

    it('should throw error when group_id change', async () => {
      const invalidNoticeData: RequestNoticeDto = {
        group_id: 2,
        title: 'Title',
        content: 'Content',
        visible: true,
        fixed: true
      }

      await expect(
        service.updateNotice(noticeId, invalidNoticeData)
      ).rejects.toThrow(UnprocessableDataException)
    })

    it('should throw error when given notice does not exist', async () => {
      db.notice.findUnique.mockResolvedValue(null)
      await expect(service.updateNotice(noticeId, noticeData)).rejects.toThrow(
        EntityNotExistException
      )
    })
  })
})
