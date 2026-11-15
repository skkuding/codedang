import { EventEmitter2 } from '@nestjs/event-emitter'
import { Test, type TestingModule } from '@nestjs/testing'
import type { Notice } from '@generated'
import { faker } from '@faker-js/faker'
import { expect } from 'chai'
import { stub } from 'sinon'
import { PrismaService } from '@libs/prisma'
import { PrismaClientKnownRequestError } from '@libs/prisma-runtime'
import type { CreateNoticeInput, UpdateNoticeInput } from './model/notice.input'
import { NoticeService } from './notice.service'

const noticeId = 1
const userId = 1

const notice: Notice = {
  id: noticeId,
  createdById: userId,
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

const eventEmitter = {
  emit: stub()
}

const relatedRecordsNotFoundPrismaError = new PrismaClientKnownRequestError(
  'message',
  {
    code: 'P2025',
    clientVersion: '5.8.1'
  }
)

describe('NoticeService', () => {
  let service: NoticeService

  before(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NoticeService,
        { provide: PrismaService, useValue: db },
        { provide: EventEmitter2, useValue: eventEmitter }
      ]
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
    eventEmitter.emit.reset()
  })

  it('should be defined', () => {
    expect(service).to.be.ok
  })

  describe('createNotice', () => {
    it('should emit notice.created when creating a public notice', async () => {
      db.notice.create.resolves(notice)
      expect(
        await service.createNotice(userId, createNoticeInput)
      ).to.deep.equal(notice)
      expect(
        db.notice.create.calledOnceWithExactly({
          data: { createdById: userId, ...createNoticeInput }
        })
      ).to.be.true
      expect(
        eventEmitter.emit.calledOnceWithExactly('notice.created', { noticeId })
      ).to.be.true
    })

    it('should not emit notice.created when creating a private notice', async () => {
      const privateNotice = { ...notice, isVisible: false }
      db.notice.create.resolves(privateNotice)

      expect(
        await service.createNotice(userId, {
          ...createNoticeInput,
          isVisible: false
        })
      ).to.deep.equal(privateNotice)
      expect(eventEmitter.emit.notCalled).to.be.true
    })

    it('should not emit notice.created when notice creation fails', async () => {
      db.notice.create.rejects(relatedRecordsNotFoundPrismaError)

      await expect(
        service.createNotice(userId, createNoticeInput)
      ).to.be.rejectedWith(PrismaClientKnownRequestError)
      expect(eventEmitter.emit.notCalled).to.be.true
    })
  })

  describe('updateNotice', () => {
    it('should emit notice.created for an explicit public update', async () => {
      const input = { ...updateNoticeInput, isVisible: true }
      const result = { ...notice, ...input }
      db.notice.update.resolves(result)

      expect(await service.updateNotice(noticeId, input)).to.deep.equal(result)
      expect(
        db.notice.update.calledOnceWithExactly({
          where: { id: noticeId },
          data: input
        })
      ).to.be.true
      expect(
        eventEmitter.emit.calledOnceWithExactly('notice.created', { noticeId })
      ).to.be.true
      expect(db.notice.findUniqueOrThrow.notCalled).to.be.true
    })

    it('should emit again for repeated explicit public updates', async () => {
      db.notice.update.resolves(notice)

      await service.updateNotice(noticeId, { isVisible: true })
      await service.updateNotice(noticeId, { isVisible: true })

      expect(eventEmitter.emit.calledTwice).to.be.true
      expect(eventEmitter.emit.firstCall.args).to.deep.equal([
        'notice.created',
        { noticeId }
      ])
      expect(eventEmitter.emit.secondCall.args).to.deep.equal([
        'notice.created',
        { noticeId }
      ])
      expect(db.notice.findUniqueOrThrow.notCalled).to.be.true
    })

    it('should emit for both concurrent explicit public updates', async () => {
      db.notice.update.resolves(notice)

      await Promise.all([
        service.updateNotice(noticeId, { isVisible: true }),
        service.updateNotice(noticeId, { isVisible: true })
      ])

      expect(eventEmitter.emit.calledTwice).to.be.true
      expect(db.notice.findUniqueOrThrow.notCalled).to.be.true
    })

    it('should not emit notice.created when setting a notice to private', async () => {
      const result = { ...notice, ...updateNoticeInput }
      db.notice.update.resolves(result)

      expect(
        await service.updateNotice(noticeId, updateNoticeInput)
      ).to.deep.equal(result)
      expect(eventEmitter.emit.notCalled).to.be.true
    })

    for (const isVisible of [true, false]) {
      it(`should not emit for a content-only update with visibility ${isVisible}`, async () => {
        const input = { title: 'updated title', content: 'updated content' }
        const result = { ...notice, ...input, isVisible }
        db.notice.update.resolves(result)

        expect(await service.updateNotice(noticeId, input)).to.deep.equal(
          result
        )
        expect(eventEmitter.emit.notCalled).to.be.true
      })
    }

    it('should throw error when notice not found', async () => {
      db.notice.update.rejects(relatedRecordsNotFoundPrismaError)
      await expect(
        service.updateNotice(999, updateNoticeInput)
      ).to.be.rejectedWith(PrismaClientKnownRequestError)
      expect(eventEmitter.emit.notCalled).to.be.true
    })

    it('should not emit notice.created when publishing fails', async () => {
      db.notice.update.rejects(relatedRecordsNotFoundPrismaError)

      await expect(
        service.updateNotice(noticeId, { isVisible: true })
      ).to.be.rejectedWith(PrismaClientKnownRequestError)
      expect(eventEmitter.emit.notCalled).to.be.true
    })
  })

  describe('deleteNotice', () => {
    it('should return deleted notice', async () => {
      db.notice.delete.resolves(notice)
      expect(await service.deleteNotice(noticeId)).to.deep.equal(notice)
    })

    it('should throw error when notice not found', async () => {
      db.notice.delete.rejects(relatedRecordsNotFoundPrismaError)
      await expect(service.deleteNotice(999)).to.be.rejectedWith(
        PrismaClientKnownRequestError
      )
    })
  })

  describe('getNotices', () => {
    it('should return an array of notice', async () => {
      db.notice.findMany.resolves([notice])
      const notices = await service.getNotices(null, 10)
      expect(notices).to.deep.equal([notice])
    })
  })

  describe('getNotice', () => {
    it('should return a notice', async () => {
      db.notice.findUniqueOrThrow.resolves(notice)
      expect(await service.getNotice(noticeId)).to.deep.equal(notice)
    })

    it('should throw error when notice not found', async () => {
      db.notice.findUniqueOrThrow.rejects(relatedRecordsNotFoundPrismaError)
      await expect(service.getNotice(999)).to.be.rejectedWith(
        PrismaClientKnownRequestError
      )
    })
  })
})
