import { Test, type TestingModule } from '@nestjs/testing'
import { Role } from '@prisma/client'
import { expect } from 'chai'
import { stub, type SinonStub } from 'sinon'
import { AuthenticatedUser } from '@libs/auth'
import {
  ConflictFoundException,
  EntityNotExistException,
  ForbiddenAccessException
} from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import { BlueprintAccessService } from '@admin/blueprint-course/blueprint-access.service'
import { BlueprintAssignmentProblemService } from './blueprint-assignment-problem.service'

const user = new AuthenticatedUser(1, 'professor', Role.User)
const blueprintAssignmentId = 10
const blueprintCourseId = 100

const bap = (problemId: number, order: number, score = 10) => ({
  blueprintAssignmentId,
  problemId,
  order,
  score,
  createTime: new Date(),
  updateTime: new Date()
})

const copyA = { id: 101, groupId: 1, endTime: new Date('2026-12-01') }
const copyB = { id: 102, groupId: 2, endTime: new Date('2026-12-10') }

// $transaction passes this fake db as tx.
const createDb = () => {
  const db = {
    blueprintAssignment: {
      findUnique: stub().resolves({ blueprintCourseId })
    },
    blueprintAssignmentProblem: {
      findMany: stub().resolves([]),
      createMany: stub().resolves({ count: 0 })
    },
    assignment: {
      findMany: stub().resolves([])
    },
    assignmentProblem: {
      createMany: stub().resolves({ count: 0 })
    },
    assignmentRecord: {
      findMany: stub().resolves([])
    },
    assignmentProblemRecord: {
      groupBy: stub().resolves([]),
      createMany: stub().resolves({ count: 0 })
    },
    submission: {
      count: stub().resolves(0)
    },
    problem: {
      findMany: stub().resolves([]),
      update: stub().resolves({}),
      updateMany: stub().resolves({ count: 0 })
    },
    $queryRaw: stub().resolves([]),
    $transaction: stub()
  }
  db.$transaction.callsFake(async (fn: (tx: typeof db) => unknown) => fn(db))
  return db
}

describe('BlueprintAssignmentProblemService', () => {
  let service: BlueprintAssignmentProblemService
  let db: ReturnType<typeof createDb>
  let access: { assertBlueprintLeader: SinonStub }

  beforeEach(async () => {
    db = createDb()
    access = { assertBlueprintLeader: stub().resolves() }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlueprintAssignmentProblemService,
        { provide: PrismaService, useValue: db },
        { provide: BlueprintAccessService, useValue: access }
      ]
    }).compile()

    service = module.get(BlueprintAssignmentProblemService)
  })

  describe('getBlueprintAssignmentProblems', () => {
    it('returns blueprint problems ordered by order', async () => {
      const problems = [bap(1, 0), bap(2, 1)]
      db.blueprintAssignmentProblem.findMany.resolves(problems)

      const result = await service.getBlueprintAssignmentProblems(
        user,
        blueprintAssignmentId
      )

      expect(result).to.deep.equal(problems)
      expect(
        db.blueprintAssignmentProblem.findMany.firstCall.args[0]
      ).to.deep.equal({
        where: { blueprintAssignmentId },
        orderBy: { order: 'asc' }
      })
    })

    it('throws EntityNotExistException when the blueprint assignment does not exist', async () => {
      db.blueprintAssignment.findUnique.resolves(null)

      await expect(
        service.getBlueprintAssignmentProblems(user, blueprintAssignmentId)
      ).to.be.rejectedWith(EntityNotExistException)
    })

    it('calls assertBlueprintLeader with the parent blueprint course id', async () => {
      await service.getBlueprintAssignmentProblems(user, blueprintAssignmentId)

      expect(
        access.assertBlueprintLeader.calledOnceWith(user, blueprintCourseId)
      ).to.be.true
    })

    it('throws ForbiddenAccessException when the user is not a leader', async () => {
      access.assertBlueprintLeader.rejects(new ForbiddenAccessException('no'))

      await expect(
        service.getBlueprintAssignmentProblems(user, blueprintAssignmentId)
      ).to.be.rejectedWith(ForbiddenAccessException)
      expect(db.blueprintAssignmentProblem.findMany.called).to.be.false
    })
  })

  describe('importProblemsToBlueprintAssignment', () => {
    const importProblems = (problems: { problemId: number; score: number }[]) =>
      service.importProblemsToBlueprintAssignment(
        user,
        blueprintAssignmentId,
        problems
      )

    it('throws ForbiddenAccessException before opening a transaction', async () => {
      access.assertBlueprintLeader.rejects(new ForbiddenAccessException('no'))

      await expect(
        importProblems([{ problemId: 1, score: 10 }])
      ).to.be.rejectedWith(ForbiddenAccessException)
      expect(db.$transaction.called).to.be.false
    })

    it('finds only linked copies', async () => {
      db.problem.findMany.resolves([{ id: 1 }])

      await importProblems([{ problemId: 1, score: 10 }])

      expect(db.assignment.findMany.firstCall.args[0].where).to.deep.equal({
        blueprintAssignmentId
      })
    })

    it('adds only to the blueprint when there are no copies', async () => {
      db.problem.findMany.resolves([{ id: 1 }])

      await importProblems([{ problemId: 1, score: 10 }])

      expect(db.blueprintAssignmentProblem.createMany.calledOnce).to.be.true
      expect(db.assignmentProblem.createMany.called).to.be.false
    })

    it('skips imported problems and appends order', async () => {
      db.problem.findMany.resolves([{ id: 1 }, { id: 2 }, { id: 3 }])
      db.blueprintAssignmentProblem.findMany
        .onFirstCall()
        .resolves([{ problemId: 1 }])

      await importProblems([
        { problemId: 1, score: 10 },
        { problemId: 2, score: 20 },
        { problemId: 3, score: 30 }
      ])

      expect(
        db.blueprintAssignmentProblem.createMany.firstCall.args[0].data
      ).to.deep.equal([
        { blueprintAssignmentId, problemId: 2, score: 20, order: 1 },
        { blueprintAssignmentId, problemId: 3, score: 30, order: 2 }
      ])
    })

    it('returns [] when every problem is already imported', async () => {
      db.problem.findMany.resolves([{ id: 1 }])
      db.blueprintAssignmentProblem.findMany.resolves([{ problemId: 1 }])

      const result = await importProblems([{ problemId: 1, score: 10 }])

      expect(result).to.deep.equal([])
      expect(db.blueprintAssignmentProblem.createMany.called).to.be.false
    })

    it('throws EntityNotExistException when a problem does not exist', async () => {
      db.problem.findMany.resolves([{ id: 1 }])

      await expect(
        importProblems([
          { problemId: 1, score: 10 },
          { problemId: 999, score: 10 }
        ])
      ).to.be.rejectedWith(EntityNotExistException)
      expect(db.blueprintAssignmentProblem.createMany.called).to.be.false
    })

    it('syncs problems, groups, visibility and records to linked copies', async () => {
      db.assignment.findMany.resolves([copyA, copyB])
      db.problem.findMany.resolves([{ id: 5 }])
      db.assignmentRecord.findMany.resolves([
        { assignmentId: copyA.id, userId: 7 },
        { assignmentId: copyB.id, userId: 8 }
      ])

      await importProblems([{ problemId: 5, score: 50 }])

      expect(db.assignmentProblem.createMany.firstCall.args[0]).to.deep.equal({
        data: [
          { assignmentId: copyA.id, problemId: 5, score: 50, order: 0 },
          { assignmentId: copyB.id, problemId: 5, score: 50, order: 0 }
        ],
        skipDuplicates: true
      })
      expect(db.problem.update.firstCall.args[0]).to.deep.equal({
        where: { id: 5 },
        data: { sharedGroups: { connect: [{ id: 1 }, { id: 2 }] } }
      })
      expect(db.problem.updateMany.firstCall.args[0].data).to.deep.equal({
        visibleLockTime: copyB.endTime
      })
      expect(
        db.assignmentProblemRecord.createMany.firstCall.args[0]
      ).to.deep.equal({
        data: [
          { assignmentId: copyA.id, userId: 7, problemId: 5 },
          { assignmentId: copyB.id, userId: 8, problemId: 5 }
        ],
        skipDuplicates: true
      })
    })

    it('throws ConflictFoundException when a linked copy has submissions', async () => {
      db.assignment.findMany.resolves([copyA])
      db.submission.count.resolves(1)

      await expect(
        importProblems([{ problemId: 1, score: 10 }])
      ).to.be.rejectedWith(ConflictFoundException)
      expect(db.blueprintAssignmentProblem.createMany.called).to.be.false
    })

    it('rethrows when saving a copy fails', async () => {
      db.assignment.findMany.resolves([copyA])
      db.problem.findMany.resolves([{ id: 1 }])
      db.assignmentProblem.createMany.rejects(new Error('copy failed'))

      await expect(
        importProblems([{ problemId: 1, score: 10 }])
      ).to.be.rejectedWith('copy failed')
    })
  })
})
