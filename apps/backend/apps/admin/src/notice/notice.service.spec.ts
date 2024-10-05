import { Test, type TestingModule } from '@nestjs/testing'
import type { Notice } from '@generated'
import { faker } from '@faker-js/faker'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import { expect } from 'chai'
import { stub } from 'sinon'
import { PrismaService } from '@libs/prisma'
import type { CreateNoticeInput, UpdateNoticeInput } from './model/notice.input'
import { NoticeService } from './notice.service'

const noticeId = 1
const userId = 1
const groupId = 1
const failGroupId = 1000

const notice: Notice = {
  id: noticeId,
  createdById: userId,
  groupId,
  title: 'title',
  content: 'content',
  isVisible: true,
  isFixed: true,
  createTime: faker.date.past(),
  updateTime: faker.date.past()
}

const createNoticeInput: CreateNoticeInput = {
  title: 'title',
  content: 'content',
  isVisible: true,
  isFixed: true
}

const updateNoticeInput: UpdateNoticeInput = {
  title: 'updated title',
  content: 'updated content',
  isVisible: false,
  isFixed: false
}

const updatedNotice = {
  ...notice,
  ...updateNoticeInput
}

const db = {
  notice: {
    findFirst: stub(),
    findMany: stub(),
    findUniqueOrThrow: stub(),
    create: stub(),
    delete: stub(),
    update: stub()
  },
  getPaginator() {}
}

const relatedRecordsNotFoundPrismaError = new PrismaClientKnownRequestError(
  'message',
  {
    code: 'P2025',
    clientVersion: '5.8.1'
  }
)

const foreignKeyFailedPrismaError = new PrismaClientKnownRequestError(
  'message',
  {
    code: 'P2003',
    clientVersion: '5.8.1'
  }
)

describe('NoticeService', () => {
  let service: NoticeService

  before(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NoticeService, { provide: PrismaService, useValue: db }]
    }).compile()

    service = module.get<NoticeService>(NoticeService)
  })

  afterEach(() => {
    db.notice.findFirst.reset()
    db.notice.findMany.reset()
    db.notice.findUniqueOrThrow.reset()
    db.notice.create.reset()
    db.notice.delete.reset()
    db.notice.update.reset()
  })

  it('should be defined', () => {
    expect(service).to.be.ok
  })

  describe('createNotice', () => {
    it('should return created notice', async () => {
      db.notice.create.resolves(notice)
      expect(
        await service.createNotice(groupId, userId, createNoticeInput)
      ).to.deep.equal(notice)
    })

    it('should throw error when groupId not exist', async () => {
      db.notice.create.rejects(foreignKeyFailedPrismaError)
      await expect(
        service.createNotice(failGroupId, userId, createNoticeInput)
      ).to.be.rejectedWith(PrismaClientKnownRequestError)
    })
  })

  describe('updateNotice', () => {
    it('should return updated notice', async () => {
      db.notice.update.resolves(updatedNotice)
      expect(
        await service.updateNotice(groupId, noticeId, updateNoticeInput)
      ).to.deep.equal(updatedNotice)
    })

    it('should throw error when notice not found', async () => {
      db.notice.update.rejects(relatedRecordsNotFoundPrismaError)
      await expect(
        service.updateNotice(failGroupId, noticeId, updateNoticeInput)
      ).to.be.rejectedWith(PrismaClientKnownRequestError)
    })
  })

  describe('deleteNotice', () => {
    it('should return deleted notice', async () => {
      db.notice.delete.resolves(notice)
      expect(await service.deleteNotice(groupId, noticeId)).to.deep.equal(
        notice
      )
    })

    it('should throw error when notice not found', async () => {
      db.notice.delete.rejects(relatedRecordsNotFoundPrismaError)
      await expect(
        service.deleteNotice(failGroupId, noticeId)
      ).to.be.rejectedWith(PrismaClientKnownRequestError)
    })
  })

  describe('getNotices', () => {
    it('should return an array of notice', async () => {
      db.notice.findMany.resolves([notice])
      const notices = await service.getNotices(groupId, null, 10)
      expect(notices).to.deep.equal([notice])
    })
  })

  describe('getNotice', () => {
    it('should return a notice', async () => {
      db.notice.findUniqueOrThrow.resolves(notice)
      expect(await service.getNotice(groupId, noticeId)).to.deep.equal(notice)
    })

    it('should throw error when notice not found', async () => {
      db.notice.findUniqueOrThrow.rejects(relatedRecordsNotFoundPrismaError)
      await expect(service.getNotice(failGroupId, noticeId)).to.be.rejectedWith(
        PrismaClientKnownRequestError
      )
    })
  })
})
