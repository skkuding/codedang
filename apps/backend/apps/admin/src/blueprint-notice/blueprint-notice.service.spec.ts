import { Test, type TestingModule } from '@nestjs/testing'
import { Role } from '@prisma/client'
import { expect } from 'chai'
import { plainToInstance } from 'class-transformer'
import { validate } from 'class-validator'
import { createHash } from 'crypto'
import { stub, type SinonStub } from 'sinon'
import { AuthenticatedUser } from '@libs/auth'
import {
  EntityNotExistException,
  ForbiddenAccessException,
  UnprocessableDataException
} from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import { BlueprintAccessService } from '@admin/blueprint-course/blueprint-access.service'
import { BlueprintNoticeService } from './blueprint-notice.service'
import { CreateBlueprintNoticeInput } from './model/blueprint-notice.input'

const userId = 1
const blueprintCourseId = 10
const user = new AuthenticatedUser(userId, 'professor', Role.User)

const input: CreateBlueprintNoticeInput = {
  operationId: '6f1c1b7e-2a3d-4c5e-9f8a-1b2c3d4e5f60',
  title: 'Midterm exam notice',
  content: '<p>October 20</p>',
  sectionGroupIds: [3, 2]
}

const requestHash = createHash('sha256')
  .update(JSON.stringify({ blueprintCourseId, input }))
  .digest('hex')

const savedNotice = {
  id: 100,
  blueprintCourseId,
  createdById: userId,
  revision: 1,
  title: input.title,
  content: input.content,
  createTime: new Date(),
  updateTime: new Date(),
  courseNotice: []
}

const receipt = {
  id: input.operationId,
  userId,
  blueprintCourseId,
  blueprintNoticeId: savedNotice.id,
  revision: 1,
  requestHash,
  createTime: new Date()
}

const createDb = () => {
  const db = {
    blueprintCourse: { findUnique: stub() },
    blueprintNotice: {
      create: stub().resolves(savedNotice),
      findMany: stub().resolves([savedNotice]),
      findUnique: stub(),
      findFirst: stub(),
      findFirstOrThrow: stub().resolves(savedNotice),
      findUniqueOrThrow: stub().resolves(savedNotice)
    },
    blueprintNoticeSave: {
      findUnique: stub().resolves(null),
      create: stub().resolves(receipt)
    },
    courseInfo: { count: stub().resolves(2) },
    courseNotice: { createMany: stub().resolves({ count: 2 }) },
    $queryRaw: stub().resolves([]),
    $transaction: stub()
  }
  // interactive transaction: run the callback with the same stub as tx.
  db.$transaction.callsFake((callback: (tx: typeof db) => unknown) =>
    callback(db)
  )
  return db
}

describe('BlueprintNoticeService', () => {
  let service: BlueprintNoticeService
  let db: ReturnType<typeof createDb>

  const allowAccess = () =>
    db.blueprintCourse.findUnique.resolves({
      createdById: userId,
      courseInfo: []
    })

  const denyAccess = () =>
    db.blueprintCourse.findUnique.resolves({
      createdById: userId + 1,
      courseInfo: []
    })

  const expectNoWrite = () => {
    expect(db.$transaction.called).to.be.false
    expect(db.blueprintNotice.create.called).to.be.false
    expect(db.courseNotice.createMany.called).to.be.false
    expect(db.blueprintNoticeSave.create.called).to.be.false
  }

  beforeEach(async () => {
    db = createDb()
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlueprintNoticeService,
        BlueprintAccessService,
        { provide: PrismaService, useValue: db }
      ]
    }).compile()

    service = module.get(BlueprintNoticeService)
  })

  describe('createNotice', () => {
    it('creates the source, a public unpinned copy per section and a receipt', async () => {
      allowAccess()

      const result = await service.createNotice(user, blueprintCourseId, input)

      expect(result).to.deep.equal(savedNotice)
      expect(db.blueprintNotice.create.firstCall.args[0]).to.deep.equal({
        data: {
          blueprintCourseId,
          createdById: userId,
          title: input.title,
          content: input.content
        }
      })
      expect(db.courseNotice.createMany.firstCall.args[0].data).to.deep.equal(
        [2, 3].map((groupId) => ({
          groupId,
          createdById: userId,
          title: input.title,
          content: input.content,
          isPublic: true,
          isFixed: false,
          blueprintNoticeId: savedNotice.id
        }))
      )
      expect(db.blueprintNoticeSave.create.firstCall.args[0]).to.deep.equal({
        data: {
          id: input.operationId,
          userId,
          blueprintCourseId,
          blueprintNoticeId: savedNotice.id,
          revision: 1,
          requestHash
        }
      })
      expect(db.$queryRaw.calledOnce).to.be.true
    })

    it('does not mutate the requested section order', async () => {
      allowAccess()
      const sectionGroupIds = [3, 2]

      await service.createNotice(user, blueprintCourseId, {
        ...input,
        sectionGroupIds
      })

      expect(sectionGroupIds).to.deep.equal([3, 2])
    })

    it('rejects a user who is not a blueprint leader before opening a transaction', async () => {
      denyAccess()

      await expect(
        service.createNotice(user, blueprintCourseId, input)
      ).to.be.rejectedWith(ForbiddenAccessException)
      expectNoWrite()
    })

    it('rejects a missing blueprint before opening a transaction', async () => {
      db.blueprintCourse.findUnique.resolves(null)

      await expect(
        service.createNotice(user, blueprintCourseId, input)
      ).to.be.rejectedWith(EntityNotExistException)
      expectNoWrite()
    })

    it('rejects sections outside the blueprint without writing', async () => {
      allowAccess()
      db.courseInfo.count.resolves(1)

      await expect(
        service.createNotice(user, blueprintCourseId, input)
      ).to.be.rejectedWith(
        UnprocessableDataException,
        'All sections must belong to this Blueprint'
      )
      expect(db.courseInfo.count.firstCall.args[0]).to.deep.equal({
        where: { blueprintCourseId, groupId: { in: input.sectionGroupIds } }
      })
      expect(db.blueprintNotice.create.called).to.be.false
      expect(db.courseNotice.createMany.called).to.be.false
      expect(db.blueprintNoticeSave.create.called).to.be.false
    })

    it('returns the saved notice for a repeated request without writing again', async () => {
      allowAccess()
      db.blueprintNoticeSave.findUnique.resolves(receipt)

      const result = await service.createNotice(user, blueprintCourseId, input)

      expect(result).to.deep.equal(savedNotice)
      expect(
        db.blueprintNotice.findFirstOrThrow.firstCall.args[0].where
      ).to.deep.equal({ id: receipt.blueprintNoticeId, blueprintCourseId })
      expect(db.courseInfo.count.called).to.be.false
      expect(db.blueprintNotice.create.called).to.be.false
      expect(db.courseNotice.createMany.called).to.be.false
      expect(db.blueprintNoticeSave.create.called).to.be.false
    })

    const reused: [string, Partial<typeof receipt>][] = [
      ['a different request body', { requestHash: 'other' }],
      ['another user', { userId: userId + 1 }],
      ['another blueprint', { blueprintCourseId: blueprintCourseId + 1 }]
    ]
    for (const [label, change] of reused) {
      it(`rejects an operation ID already used by ${label}`, async () => {
        allowAccess()
        db.blueprintNoticeSave.findUnique.resolves({ ...receipt, ...change })

        await expect(
          service.createNotice(user, blueprintCourseId, input)
        ).to.be.rejectedWith(
          UnprocessableDataException,
          'Operation ID belongs to another request'
        )
        expect(db.blueprintNotice.create.called).to.be.false
        expect(db.blueprintNoticeSave.create.called).to.be.false
      })
    }
  })

  describe('getNotices', () => {
    it('returns notices of the blueprint, newest first, with linked copies', async () => {
      allowAccess()

      const result = await service.getNotices(user, blueprintCourseId)

      expect(result).to.deep.equal([savedNotice])
      expect(db.blueprintNotice.findMany.firstCall.args[0]).to.deep.equal({
        where: { blueprintCourseId },
        orderBy: { id: 'desc' },
        take: 10,
        include: { courseNotice: { orderBy: { groupId: 'asc' } } }
      })
    })

    it('applies cursor and case-insensitive title search', async () => {
      allowAccess()

      await service.getNotices(user, blueprintCourseId, 5, 50, 'Midterm')

      const args = db.blueprintNotice.findMany.firstCall.args[0]
      expect(args.where).to.deep.equal({
        blueprintCourseId,
        id: { lt: 50 },
        title: { contains: 'Midterm', mode: 'insensitive' }
      })
      expect(args.take).to.equal(5)
    })

    for (const take of [0, 101, 1.5]) {
      it(`rejects take = ${take}`, async () => {
        allowAccess()

        await expect(
          service.getNotices(user, blueprintCourseId, take)
        ).to.be.rejectedWith(UnprocessableDataException)
        expect(db.blueprintNotice.findMany.called).to.be.false
      })
    }

    it('rejects a user who is not a blueprint leader', async () => {
      denyAccess()

      await expect(
        service.getNotices(user, blueprintCourseId)
      ).to.be.rejectedWith(ForbiddenAccessException)
      expect(db.blueprintNotice.findMany.called).to.be.false
    })
  })

  describe('getNoticeById', () => {
    it('checks access with the blueprint of the notice and returns it', async () => {
      db.blueprintNotice.findUnique.resolves({ blueprintCourseId })
      db.blueprintNotice.findFirst.resolves(savedNotice)
      allowAccess()

      const result = await service.getNoticeById(user, savedNotice.id)

      expect(result).to.deep.equal(savedNotice)
      expect(
        (db.blueprintCourse.findUnique as SinonStub).firstCall.args[0].where
      ).to.deep.equal({ id: blueprintCourseId })
    })

    it('rejects a missing notice', async () => {
      db.blueprintNotice.findUnique.resolves(null)

      await expect(
        service.getNoticeById(user, savedNotice.id)
      ).to.be.rejectedWith(EntityNotExistException)
      expect(db.blueprintCourse.findUnique.called).to.be.false
    })

    it('rejects a user who is not a blueprint leader', async () => {
      db.blueprintNotice.findUnique.resolves({ blueprintCourseId })
      denyAccess()

      await expect(
        service.getNoticeById(user, savedNotice.id)
      ).to.be.rejectedWith(ForbiddenAccessException)
      expect(db.blueprintNotice.findFirst.called).to.be.false
    })

    it('returns NOT_FOUND when the notice is deleted after the access check', async () => {
      db.blueprintNotice.findUnique.resolves({ blueprintCourseId })
      db.blueprintNotice.findFirst.resolves(null)
      allowAccess()

      await expect(
        service.getNoticeById(user, savedNotice.id)
      ).to.be.rejectedWith(EntityNotExistException)
    })
  })
})

describe('CreateBlueprintNoticeInput', () => {
  const errorsOf = async (value: object) =>
    (
      await validate(
        plainToInstance(CreateBlueprintNoticeInput, { ...input, ...value })
      )
    ).map(({ property }) => property)

  it('accepts a valid input', async () => {
    expect(await errorsOf({})).to.deep.equal([])
  })

  const invalid: [string, object, string][] = [
    ['a non-UUID operation ID', { operationId: 'abc' }, 'operationId'],
    ['an empty title', { title: '' }, 'title'],
    ['a blank title', { title: '   ' }, 'title'],
    ['a blank content', { content: ' \n ' }, 'content'],
    ['no sections', { sectionGroupIds: [] }, 'sectionGroupIds'],
    ['duplicate sections', { sectionGroupIds: [1, 1] }, 'sectionGroupIds'],
    ['a non-positive section', { sectionGroupIds: [0] }, 'sectionGroupIds'],
    ['a non-integer section', { sectionGroupIds: [1.5] }, 'sectionGroupIds']
  ]
  for (const [label, value, property] of invalid) {
    it(`rejects ${label}`, async () => {
      expect(await errorsOf(value)).to.include(property)
    })
  }
})
