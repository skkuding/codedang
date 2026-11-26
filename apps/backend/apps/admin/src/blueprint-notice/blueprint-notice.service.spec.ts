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
import {
  CreateBlueprintNoticeInput,
  UpdateBlueprintNoticeInput
} from './model/blueprint-notice.input'

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
      findUniqueOrThrow: stub().resolves(savedNotice),
      update: stub().resolves({ ...savedNotice, revision: 2 })
    },
    blueprintNoticeSave: {
      findUnique: stub().resolves(null),
      create: stub().resolves(receipt)
    },
    courseInfo: { count: stub().resolves(2) },
    courseNotice: {
      createMany: stub().resolves({ count: 2 }),
      updateMany: stub().resolves({ count: 2 }),
      findFirst: stub(),
      update: stub()
    },
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

  describe('updateNotice', () => {
    const update: UpdateBlueprintNoticeInput = {
      operationId: '0b6f7c3e-1d2a-4b5c-8e9f-a1b2c3d4e5f6',
      expectedRevision: 1,
      title: 'Final exam notice'
    }

    const allowUpdate = () => {
      db.blueprintNotice.findUnique.resolves({ blueprintCourseId })
      db.blueprintNotice.findFirst.resolves(savedNotice)
      allowAccess()
    }

    it('updates the source, bumps the revision and syncs linked copies', async () => {
      allowUpdate()

      await service.updateNotice(user, savedNotice.id, update)

      expect(db.blueprintNotice.update.firstCall.args[0]).to.deep.equal({
        where: { id: savedNotice.id },
        data: { title: update.title, revision: { increment: 1 } }
      })
      expect(db.courseNotice.updateMany.firstCall.args[0]).to.deep.equal({
        where: { blueprintNoticeId: savedNotice.id },
        data: { title: update.title, readBy: { set: [] } }
      })
      expect(
        db.blueprintNoticeSave.create.firstCall.args[0].data
      ).to.deep.include({
        id: update.operationId,
        blueprintNoticeId: savedNotice.id,
        revision: 2
      })
      // advisory lock for the operation, then a row lock on the source
      expect(db.$queryRaw.callCount).to.equal(2)
    })

    it('keeps read records when the submitted content is unchanged', async () => {
      allowUpdate()

      await service.updateNotice(user, savedNotice.id, {
        ...update,
        title: savedNotice.title,
        content: savedNotice.content
      })

      expect(db.courseNotice.updateMany.firstCall.args[0].data).to.deep.equal({
        title: savedNotice.title,
        content: savedNotice.content
      })
    })

    it('resets read records when only the content changes', async () => {
      allowUpdate()

      await service.updateNotice(user, savedNotice.id, {
        operationId: update.operationId,
        expectedRevision: 1,
        content: '<p>changed</p>'
      })

      expect(db.courseNotice.updateMany.firstCall.args[0].data).to.deep.equal({
        content: '<p>changed</p>',
        readBy: { set: [] }
      })
    })

    it('rejects a stale revision without writing', async () => {
      allowUpdate()

      await expect(
        service.updateNotice(user, savedNotice.id, {
          ...update,
          expectedRevision: 2
        })
      ).to.be.rejectedWith(UnprocessableDataException, 'STALE_REVISION')
      expect(db.blueprintNotice.update.called).to.be.false
      expect(db.courseNotice.updateMany.called).to.be.false
      expect(db.blueprintNoticeSave.create.called).to.be.false
    })

    it('rejects an input with neither title nor content before opening a transaction', async () => {
      allowUpdate()

      await expect(
        service.updateNotice(user, savedNotice.id, {
          operationId: update.operationId,
          expectedRevision: 1
        })
      ).to.be.rejectedWith(
        UnprocessableDataException,
        'At least one of title or content must be provided'
      )
      expect(db.$transaction.called).to.be.false
    })

    it('returns the current state for a repeated request without writing again', async () => {
      allowUpdate()
      db.blueprintNoticeSave.findUnique.resolves({
        ...receipt,
        id: update.operationId,
        requestHash: createHash('sha256')
          .update(
            JSON.stringify({
              blueprintCourseId,
              id: savedNotice.id,
              input: update
            })
          )
          .digest('hex')
      })

      const result = await service.updateNotice(user, savedNotice.id, update)

      expect(result).to.deep.equal(savedNotice)
      expect(db.blueprintNotice.update.called).to.be.false
      expect(db.courseNotice.updateMany.called).to.be.false
    })

    it('rejects reusing a create operation ID for an update', async () => {
      allowUpdate()
      db.blueprintNoticeSave.findUnique.resolves(receipt)

      await expect(
        service.updateNotice(user, savedNotice.id, {
          ...update,
          operationId: input.operationId
        })
      ).to.be.rejectedWith(
        UnprocessableDataException,
        'Operation ID belongs to another request'
      )
      expect(db.blueprintNotice.update.called).to.be.false
    })

    it('rejects a missing notice', async () => {
      db.blueprintNotice.findUnique.resolves(null)

      await expect(
        service.updateNotice(user, savedNotice.id, update)
      ).to.be.rejectedWith(EntityNotExistException)
      expect(db.$transaction.called).to.be.false
    })

    it('rejects a user who is not a blueprint leader', async () => {
      db.blueprintNotice.findUnique.resolves({ blueprintCourseId })
      denyAccess()

      await expect(
        service.updateNotice(user, savedNotice.id, update)
      ).to.be.rejectedWith(ForbiddenAccessException)
      expect(db.$transaction.called).to.be.false
    })

    it('returns NOT_FOUND when the notice is deleted before the row lock', async () => {
      allowUpdate()
      db.blueprintNotice.findFirst.resolves(null)

      await expect(
        service.updateNotice(user, savedNotice.id, update)
      ).to.be.rejectedWith(EntityNotExistException)
      expect(db.blueprintNotice.update.called).to.be.false
    })
  })

  describe('unlink', () => {
    const groupId = 2
    const copy = { id: 7, groupId, blueprintNoticeId: savedNotice.id }

    it('locks the source and clears the link of the copy', async () => {
      db.courseNotice.findFirst.resolves(copy)
      db.courseNotice.update.resolves({ ...copy, blueprintNoticeId: null })

      const result = await service.unlink(groupId, copy.id)

      expect(result).to.deep.equal({ ...copy, blueprintNoticeId: null })
      expect(db.courseNotice.findFirst.firstCall.args[0].where).to.deep.equal({
        id: copy.id,
        groupId
      })
      expect(db.$queryRaw.calledOnce).to.be.true
      expect(db.$queryRaw.calledBefore(db.courseNotice.update)).to.be.true
      expect(db.courseNotice.update.firstCall.args[0]).to.deep.include({
        where: { id: copy.id, groupId },
        data: { blueprintNoticeId: null }
      })
    })

    it('returns an already unlinked notice without locking or writing', async () => {
      db.courseNotice.findFirst.resolves({ ...copy, blueprintNoticeId: null })

      const result = await service.unlink(groupId, copy.id)

      expect(result.blueprintNoticeId).to.equal(null)
      expect(db.$queryRaw.called).to.be.false
      expect(db.courseNotice.update.called).to.be.false
    })

    it('rejects a notice outside the section', async () => {
      db.courseNotice.findFirst.resolves(null)

      await expect(service.unlink(groupId, copy.id)).to.be.rejectedWith(
        EntityNotExistException
      )
      expect(db.courseNotice.update.called).to.be.false
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

describe('UpdateBlueprintNoticeInput', () => {
  const base = {
    operationId: '0b6f7c3e-1d2a-4b5c-8e9f-a1b2c3d4e5f6',
    expectedRevision: 1
  }
  const errorsOf = async (value: object) =>
    (
      await validate(
        plainToInstance(UpdateBlueprintNoticeInput, { ...base, ...value })
      )
    ).map(({ property }) => property)

  it('accepts omitted title and content', async () => {
    expect(await errorsOf({})).to.deep.equal([])
  })

  const invalid: [string, object, string][] = [
    ['a null title', { title: null }, 'title'],
    ['a blank title', { title: '  ' }, 'title'],
    ['a null content', { content: null }, 'content'],
    ['an empty content', { content: '' }, 'content'],
    ['a zero revision', { expectedRevision: 0 }, 'expectedRevision'],
    ['a non-UUID operation ID', { operationId: 'x' }, 'operationId']
  ]
  for (const [label, value, property] of invalid) {
    it(`rejects ${label}`, async () => {
      expect(await errorsOf(value)).to.include(property)
    })
  }
})
