import { Test, TestingModule } from '@nestjs/testing'
import { PrismaService } from 'src/prisma/prisma.service'
import { Group, Notice } from '@prisma/client'
import { NoticeService } from './notice.service'
import { RequestNoticeDto } from './dto/request-notice.dto'
import {
  EntityNotExistException,
  UnprocessableDataException
} from 'src/common/exception/business.exception'

const noticeId = 2
const userId = 1

const noticeDto: RequestNoticeDto = {
  group_id: 1,
  title: 'Title',
  content: 'Content',
  visible: true,
  fixed: true
}

const notice: Notice = {
  id: noticeId,
  created_by_id: userId,
  group_id: noticeDto.group_id,
  title: noticeDto.title,
  content: noticeDto.content,
  visible: noticeDto.visible,
  fixed: noticeDto.fixed,
  create_time: new Date(),
  update_time: new Date()
}

const noticePrev: Notice = {
  ...notice,
  id: 1
}

const noticeNext: Notice = {
  ...notice,
  id: 3
}

const group: Group = {
  id: 1,
  created_by_id: 1,
  group_name: 'group_name',
  private: true,
  invitation_code: '1',
  description: 'description',
  create_time: new Date(),
  update_time: new Date()
}

const db = {
  notice: {
    findMany: jest.fn(),
    findUnique: jest.fn().mockResolvedValue(notice),
    findFirst: jest.fn(),
    create: jest.fn().mockResolvedValue(notice),
    update: jest.fn().mockResolvedValue(notice),
    delete: jest.fn()
  },
  group: {
    findUnique: jest.fn().mockResolvedValue(group)
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
      db.group.findUnique.mockResolvedValue(group)
    })

    it('should return new created notice data', async () => {
      const createResult = await service.createNotice(userId, noticeDto)
      expect(createResult).toEqual(notice)
    })

    it('should throw error when given group does not exist', async () => {
      db.group.findUnique.mockResolvedValue(null)
      await expect(service.createNotice(userId, noticeDto)).rejects.toThrow(
        EntityNotExistException
      )
    })
  })

  describe('getNoticesByGroupId', () => {
    const noticeArray = [
      {
        id: noticePrev.id,
        title: noticePrev.title,
        create_time: noticePrev.create_time
      },
      {
        id: notice.id,
        title: notice.title,
        create_time: notice.create_time
      },
      {
        id: noticeNext.id,
        title: noticeNext.title,
        create_time: noticeNext.create_time
      }
    ]

    it('should return notice list of the group', async () => {
      db.notice.findMany.mockResolvedValue(noticeArray)

      const getNoticesByGroupId = await service.getNoticesByGroupId(group.id, 1)
      expect(getNoticesByGroupId).toEqual(noticeArray)
    })
  })

  describe('getNotice', () => {
    const userNotice = {
      current: {
        title: notice.title,
        content: notice.content,
        create_time: notice.create_time,
        update_time: notice.update_time
      },
      prev: {
        id: noticePrev.id,
        title: noticePrev.title
      },
      next: {
        id: noticeNext.id,
        title: noticeNext.title
      }
    }

    it('should return a notice and previews', async () => {
      db.notice.findFirst
        .mockResolvedValueOnce(userNotice.current)
        .mockResolvedValueOnce(userNotice.prev)
        .mockResolvedValueOnce(userNotice.next)

      const getNotice = await service.getNotice(noticeId, group.id)
      expect(getNotice).toEqual(userNotice)
    })

    it('should throw error when the notice does not exist', async () => {
      db.notice.findFirst.mockRejectedValue(
        new EntityNotExistException('notice')
      )

      await expect(service.getNotice(noticeId, group.id)).rejects.toThrow(
        EntityNotExistException
      )
    })
  })

  describe('getAdminNotices', () => {
    const noticeArray = [
      {
        id: noticePrev.id,
        group: group,
        title: noticePrev.title,
        create_time: noticePrev.create_time,
        visible: noticePrev.visible
      },
      {
        id: notice.id,
        group: group,
        title: notice.title,
        create_time: notice.create_time,
        visible: notice.visible
      },
      {
        id: noticeNext.id,
        group: group,
        title: noticeNext.title,
        create_time: noticeNext.create_time,
        visible: noticeNext.visible
      }
    ]

    it('should return notice list of the group', async () => {
      db.notice.findMany.mockResolvedValue(noticeArray)

      const getNoticesByGroupId = await service.getAdminNotices(userId, 1)
      expect(getNoticesByGroupId).toEqual(noticeArray)
    })
  })

  describe('getAdminNotice', () => {
    const adminNotice = {
      group: {
        id: group.id,
        group_name: group.group_name
      },
      title: notice.title,
      content: notice.content,
      visible: notice.visible,
      fixed: notice.fixed
    }
    it('should return a notice', async () => {
      db.notice.findUnique.mockResolvedValueOnce(adminNotice)

      const getNotice = await service.getAdminNotice(noticeId)
      expect(getNotice).toEqual(adminNotice)
    })

    it('should throw error when given notice does not exist', async () => {
      db.notice.findUnique.mockRejectedValueOnce(
        new EntityNotExistException('notice')
      )

      await expect(service.getAdminNotice(noticeId)).rejects.toThrow(
        EntityNotExistException
      )
    })
  })

  describe('updateNotice', () => {
    beforeEach(() => {
      db.notice.findUnique.mockResolvedValue(notice)
    })

    it('should return updated Notice', async () => {
      const updateResult = await service.updateNotice(noticeId, noticeDto)
      expect(updateResult).toEqual(notice)
    })

    it('should throw error when group_id change', async () => {
      const invalidnoticeDto: RequestNoticeDto = {
        group_id: 2,
        title: 'Title',
        content: 'Content',
        visible: true,
        fixed: true
      }

      await expect(
        service.updateNotice(noticeId, invalidnoticeDto)
      ).rejects.toThrow(UnprocessableDataException)
    })

    it('should throw error when given notice does not exist', async () => {
      db.notice.findUnique.mockResolvedValue(null)
      await expect(service.updateNotice(noticeId, noticeDto)).rejects.toThrow(
        EntityNotExistException
      )
    })
  })

  describe('deleteContest', () => {
    afterEach(() => {
      db.notice.delete.mockClear()
    })

    it('should successfully delete given notice', async () => {
      await service.deleteNotice(noticeId)
      expect(db.notice.delete).toBeCalledTimes(1)
    })

    it('should throw error when given notice does not exist', async () => {
      db.notice.findUnique.mockRejectedValue(
        new EntityNotExistException('notice')
      )

      await expect(service.deleteNotice(noticeId)).rejects.toThrow(
        EntityNotExistException
      )
      expect(db.notice.delete).toBeCalledTimes(0)
    })
  })
})
