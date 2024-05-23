import { Test, type TestingModule } from '@nestjs/testing'
import { Prisma, type Group } from '@prisma/client'
import { expect } from 'chai'
import { stub } from 'sinon'
import { PrismaService } from '@libs/prisma'
import { NoticeService } from './notice.service'

const noticeId = 2
const userId = 1
const groupId = 1
const username = 'manager'
const totalNotice = 24

const notice = {
  id: noticeId,
  createdById: userId,
  createdBy: {
    username
  },
  groupId,
  title: 'Title',
  content: 'Content',
  isVisible: true,
  isFixed: true,
  createTime: new Date(),
  updateTime: new Date()
}

const noticePrev = {
  ...notice,
  id: 1
}

const noticeNext = {
  ...notice,
  id: 3
}

const group: Group = {
  id: groupId,
  groupName: 'group_name',
  description: 'description',
  config: {
    showOnList: true,
    allowJoinFromSearch: true,
    allowJoinWithURL: false,
    requireApprovalBeforeJoin: true
  },
  createTime: new Date(),
  updateTime: new Date()
}

const db = {
  notice: {
    findMany: stub(),
    findUnique: stub().resolves(notice),
    findUniqueOrThrow: stub().resolves(notice),
    findFirst: stub(),
    findFirstOrThrow: stub(),
    count: stub().resolves(24)
  },
  group: {
    findUnique: stub().resolves(group)
  },
  userGroup: {
    findMany: stub().resolves([groupId])
  },
  getPaginator: PrismaService.prototype.getPaginator
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
    expect(service).to.be.ok
  })

  describe('getNoticesByGroupId', () => {
    const noticeArray = [
      {
        id: noticePrev.id,
        title: noticePrev.title,
        createTime: noticePrev.createTime,
        isFixed: noticePrev.isFixed,
        createdBy: noticePrev.createdBy
      },
      {
        id: notice.id,
        title: notice.title,
        createTime: notice.createTime,
        isFixed: notice.isFixed,
        createdBy: notice.createdBy
      },
      {
        id: noticeNext.id,
        title: noticeNext.title,
        createTime: noticeNext.createTime,
        isFixed: noticeNext.isFixed,
        createdBy: noticeNext.createdBy
      }
    ]

    const userNotices = noticeArray.map((notice) => {
      return {
        ...notice,
        createdBy: notice.createdBy.username
      }
    })

    it('should return notice list of the group', async () => {
      db.notice.findMany.resolves(noticeArray)

      const getNoticesByGroupId = await service.getNotices({
        cursor: 0,
        take: 3,
        groupId: group.id
      })
      expect(getNoticesByGroupId).to.deep.equal({
        data: userNotices,
        total: totalNotice
      })
    })
  })

  describe('getFixedNoticesByGroupId', () => {
    const noticeArray = [
      {
        id: noticePrev.id,
        title: noticePrev.title,
        createTime: noticePrev.createTime,
        isFixed: noticePrev.isFixed,
        createdBy: noticePrev.createdBy
      },
      {
        id: notice.id,
        title: notice.title,
        createTime: notice.createTime,
        isFixed: notice.isFixed,
        createdBy: notice.createdBy
      },
      {
        id: noticeNext.id,
        title: noticeNext.title,
        createTime: noticeNext.createTime,
        isFixed: noticeNext.isFixed,
        createdBy: noticeNext.createdBy
      }
    ]

    const userNotices = noticeArray.map((notice) => {
      return {
        ...notice,
        createdBy: notice.createdBy.username
      }
    })

    it('should return notice list of the group', async () => {
      db.notice.findMany.resolves(noticeArray)

      const getFixedNoticesByGroupId = await service.getNotices({
        cursor: null,
        take: 3,
        groupId: group.id
      })

      expect(getFixedNoticesByGroupId).to.deep.equal({
        data: userNotices,
        total: totalNotice
      })
    })
  })

  describe('getNotice', () => {
    const currentNotice = {
      title: notice.title,
      content: notice.content,
      createTime: notice.createTime,
      updateTime: notice.updateTime,
      createdBy: notice.createdBy
    }
    const userNotice = {
      current: {
        ...currentNotice,
        createdBy: currentNotice.createdBy.username
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
      db.notice.findUniqueOrThrow.resolves(currentNotice)
      db.notice.findFirst.onFirstCall().resolves(userNotice.prev)
      db.notice.findFirst.onSecondCall().resolves(userNotice.next)

      const getNotice = await service.getNoticeByID(noticeId, group.id)
      expect(getNotice).to.deep.equal(userNotice)
    })

    it('should throw PrismaClientKnownRequestError when the notice does not exist', async () => {
      db.notice.findUniqueOrThrow.rejects(
        new Prisma.PrismaClientKnownRequestError('notice', {
          code: 'P2002',
          clientVersion: '5.1.1'
        })
      )

      await expect(
        service.getNoticeByID(noticeId, group.id)
      ).to.be.rejectedWith(Prisma.PrismaClientKnownRequestError)
    })
  })
})
