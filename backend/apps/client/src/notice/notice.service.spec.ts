import { Test, type TestingModule } from '@nestjs/testing'
import type { Group, Notice } from '@prisma/client'
import { expect } from 'chai'
import { stub } from 'sinon'
import { EntityNotExistException } from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import { NoticeService } from './notice.service'

const noticeId = 2
const userId = 1
const groupId = 1

const notice: Notice = {
  id: noticeId,
  createdById: userId,
  groupId: groupId,
  title: 'Title',
  content: 'Content',
  isVisible: true,
  isFixed: true,
  createTime: new Date(),
  updateTime: new Date()
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
  id: groupId,
  createdById: 1,
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
    findFirst: stub()
  },
  group: {
    findUnique: stub().resolves(group)
  },
  userGroup: {
    findMany: stub().resolves([groupId])
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
    expect(service).to.be.ok
  })

  describe('getNoticesByGroupId', () => {
    const noticeArray = [
      {
        id: noticePrev.id,
        title: noticePrev.title,
        createTime: noticePrev.createTime,
        isFixed: noticePrev.isFixed
      },
      {
        id: notice.id,
        title: notice.title,
        createTime: notice.createTime,
        isFixed: notice.isFixed
      },
      {
        id: noticeNext.id,
        title: noticeNext.title,
        createTime: noticeNext.createTime,
        isFixed: noticeNext.isFixed
      }
    ]

    it('should return notice list of the group', async () => {
      db.notice.findMany.resolves(noticeArray)

      const getNoticesByGroupId = await service.getNoticesByGroupId(
        0,
        3,
        group.id
      )
      expect(getNoticesByGroupId).to.deep.equal(noticeArray)
    })
  })

  describe('getNotice', () => {
    const userNotice = {
      current: {
        title: notice.title,
        content: notice.content,
        createTime: notice.createTime,
        updateTime: notice.updateTime
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
        .onFirstCall()
        .resolves(userNotice.current)
        .onSecondCall()
        .resolves(userNotice.prev)
        .onThirdCall()
        .resolves(userNotice.next)

      const getNotice = await service.getNotice(noticeId, group.id)
      expect(getNotice).to.deep.equal(userNotice)
    })

    it('should throw error when the notice does not exist', async () => {
      db.notice.findFirst.rejects(new EntityNotExistException('notice'))

      await expect(service.getNotice(noticeId, group.id)).to.be.rejectedWith(
        EntityNotExistException
      )
    })
  })
})
