import { Test, type TestingModule } from '@nestjs/testing'
import { faker } from '@faker-js/faker'
import { expect } from 'chai'
import { stub } from 'sinon'
import { PrismaService } from '@libs/prisma'
import type { ContestQnA, ContestQnAComment } from '@admin/@generated'
import { ContestQnAService } from '../contest-qna.service'
import type { GetContestQnAsFilterInput } from '../model/contest-qna.input'

const contestId = 1
const staffUserId = 1
const studentUserId = 2
const qnaOrder = 1
const commentOrder = 1

const mockQnA: ContestQnA = {
  id: 101,
  order: qnaOrder,
  createdById: studentUserId,
  contestId,
  title: 'Test Question',
  content: 'Why is this so hard?',
  problemId: null,
  category: 'General',
  isResolved: false,
  createTime: faker.date.past(),
  readBy: []
}

const mockComment: ContestQnAComment = {
  id: 201,
  order: commentOrder,
  createdById: staffUserId,
  isContestStaff: true,
  content: 'This is the answer.',
  contestQnAId: mockQnA.id,
  createdTime: faker.date.recent()
}

const db = {
  contest: {
    findUnique: stub(),
    findUniqueOrThrow: stub()
  },
  contestQnA: {
    findMany: stub(),
    findUnique: stub(),
    findUniqueOrThrow: stub(),
    findFirst: stub(),
    delete: stub(),
    update: stub(),
    updateMany: stub(),
    count: stub(),
    aggregate: stub()
  },
  contestQnAComment: {
    create: stub(),
    findUnique: stub(),
    findUniqueOrThrow: stub(),
    findFirst: stub(),
    delete: stub(),
    aggregate: stub(),
    count: stub()
  },
  $transaction: stub(),
  getPaginator: PrismaService.prototype.getPaginator
}

describe('ContestQnAService', () => {
  let service: ContestQnAService

  beforeEach(async () => {
    Object.values(db).forEach((model) => {
      if (typeof model === 'object' && model !== null) {
        Object.values(model).forEach((fn) => {
          if (typeof fn === 'function' && 'resetHistory' in fn) {
            fn.resetHistory()
            fn.resetBehavior()
          }
        })
      }
    })

    const module: TestingModule = await Test.createTestingModule({
      providers: [ContestQnAService, { provide: PrismaService, useValue: db }]
    }).compile()

    service = module.get<ContestQnAService>(ContestQnAService)
  })

  it('should be defined', () => {
    expect(service).to.be.ok
  })

  describe('getContestQnAs', () => {
    it('should return paginated QnAs with isRead status', async () => {
      const take = 10
      const cursor = null
      const filter: GetContestQnAsFilterInput = { isResolved: false }
      const mockQnAs = [
        { ...mockQnA, readBy: [] },
        { ...mockQnA, id: 102, order: 2, readBy: [staffUserId] }
      ]
      db.contest.findUniqueOrThrow.resolves({ id: contestId })
      db.contestQnA.findMany.resolves(mockQnAs)

      const result = await service.getContestQnAs(
        contestId,
        staffUserId,
        take,
        cursor,
        filter
      )
      expect(result).to.have.lengthOf(2)
      expect(result[0].isRead).to.be.false
      expect(result[1].isRead).to.be.true
      expect(
        db.contestQnA.findMany.calledWithMatch({
          where: { contestId, isResolved: false }
        })
      ).to.be.true
    })
  })

  describe('getContestQnA', () => {
    it('should return a single QnA and mark as read', async () => {
      db.contestQnA.findUniqueOrThrow.resolves({ ...mockQnA, readBy: [] })
      db.contestQnA.update.resolves({ ...mockQnA, readBy: [staffUserId] })

      const result = await service.getContestQnA(
        contestId,
        staffUserId,
        qnaOrder
      )
      expect(result.id).to.equal(mockQnA.id)
      expect(
        db.contestQnA.findUniqueOrThrow.calledWithMatch({
          // eslint-disable-next-line @typescript-eslint/naming-convention
          where: { contestId_order: { contestId, order: qnaOrder } }
        })
      ).to.be.true
      expect(
        db.contestQnA.update.calledWithMatch({
          where: { id: mockQnA.id },
          data: { readBy: { push: staffUserId } }
        })
      ).to.be.true
    })
  })

  describe('deleteContestQnA', () => {
    it('should delete a QnA', async () => {
      db.contestQnA.delete.resolves(mockQnA)

      const result = await service.deleteContestQnA(contestId, qnaOrder)
      expect(result).to.deep.equal(mockQnA)
      expect(
        db.contestQnA.delete.calledWithMatch({
          // eslint-disable-next-line @typescript-eslint/naming-convention
          where: { contestId_order: { contestId, order: qnaOrder } }
        })
      ).to.be.true
    })
  })

  describe('createContestQnAComment', () => {
    it('should create a new comment', async () => {
      const content = 'This is the new comment.'
      db.contest.findUniqueOrThrow.resolves({ id: contestId })
      db.contestQnA.findUniqueOrThrow.resolves(mockQnA)
      db.$transaction.callsFake(async (callback) => {
        const tx = {
          contestQnAComment: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            aggregate: stub().resolves({ _max: { order: 0 } }),
            create: stub().resolves(mockComment)
          },
          contestQnA: {
            update: stub().resolves(mockQnA)
          }
        }
        return await callback(tx)
      })

      const result = await service.createContestQnAComment(
        contestId,
        staffUserId,
        qnaOrder,
        content
      )
      expect(result).to.deep.equal(mockComment)
      expect(db.$transaction.calledOnce).to.be.true
    })
  })

  describe('deleteContestQnAComment', () => {
    it('should delete a comment', async () => {
      db.contestQnA.findUniqueOrThrow.resolves(mockQnA)
      db.contestQnAComment.findUniqueOrThrow.resolves(mockComment)
      db.$transaction.callsFake(async (callback) => {
        const tx = {
          contestQnAComment: {
            delete: stub().resolves(mockComment),
            findFirst: stub().resolves(null)
          },
          contestQnA: {
            update: stub().resolves(mockQnA)
          }
        }
        return await callback(tx)
      })

      const result = await service.deleteContestQnAComment(
        contestId,
        qnaOrder,
        commentOrder
      )
      expect(result).to.deep.equal(mockComment)
      expect(db.$transaction.calledOnce).to.be.true
    })
  })

  describe('toggleContestQnAResolved', () => {
    it('should toggle isResolved from false to true', async () => {
      const qnaFalse = { ...mockQnA, isResolved: false }
      const qnaTrue = { ...mockQnA, isResolved: true }
      db.contestQnA.findUniqueOrThrow.resolves(qnaFalse)
      db.contestQnAComment.count.resolves(1)
      db.contestQnA.update.resolves(qnaTrue)

      const result = await service.toggleContestQnAResolved(contestId, qnaOrder)
      expect(result.isResolved).to.be.true
      expect(
        db.contestQnA.update.calledWithMatch({
          data: { isResolved: true }
        })
      ).to.be.true
    })

    it('should toggle isResolved from true to false', async () => {
      const qnaTrue = { ...mockQnA, isResolved: true }
      const qnaFalse = { ...mockQnA, isResolved: false }
      db.contestQnA.findUniqueOrThrow.resolves(qnaTrue)
      db.contestQnA.update.resolves(qnaFalse)

      const result = await service.toggleContestQnAResolved(contestId, qnaOrder)
      expect(result.isResolved).to.be.false
      expect(
        db.contestQnA.update.calledWithMatch({
          data: { isResolved: false }
        })
      ).to.be.true
    })
  })
})
