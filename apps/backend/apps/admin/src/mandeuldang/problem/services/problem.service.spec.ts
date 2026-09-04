import { Test, type TestingModule } from '@nestjs/testing'
import {
  CollaboratorRole,
  CollaboratorStatus,
  Language,
  Level,
  ProblemCreationMode,
  ProblemStatus,
  Role
} from '@prisma/client'
import { expect } from 'chai'
import { stub } from 'sinon'
import { PrismaService } from '@libs/prisma'
import { MandeuldangProblemService } from './problem.service'
import { PublishCheckService } from './publish-check.service'

const ownerId = 1
const collaboratorId = 2
const strangerId = 3

const baseProblem = {
  id: 10,
  createdById: ownerId,
  creationMode: ProblemCreationMode.Mandeuldang,
  status: ProblemStatus.Draft,
  description: null,
  mandeuldangCollaborators: [] as Array<{
    userId: number
    role: CollaboratorRole
    status: CollaboratorStatus
  }>,
  mandeuldangSolution: null,
  mandeuldangTools: [],
  mandeuldangTestFiles: [] as unknown[]
}

const emptyStatementFields = {
  title: null,
  description: null,
  inputDescription: null,
  outputDescription: null,
  hint: null,
  timeLimit: null,
  memoryLimit: null,
  difficulty: null,
  source: null,
  languages: [] as Language[]
}

const fullStatementFields = {
  title: 'title',
  description: 'a real statement',
  inputDescription: 'input',
  outputDescription: 'output',
  hint: 'hint',
  timeLimit: 2000,
  memoryLimit: 512,
  difficulty: Level.Level1,
  source: 'source',
  languages: [Language.Cpp]
}

const db = {
  problem: {
    findMany: stub(),
    findUnique: stub(),
    findUniqueOrThrow: stub(),
    findFirstOrThrow: stub(),
    update: stub()
  },
  mandeuldangCollaborator: {
    findUnique: stub()
  },
  $transaction: stub(),
  getPaginator: PrismaService.prototype.getPaginator
}

describe('MandeuldangProblemService', () => {
  let service: MandeuldangProblemService

  beforeEach(async () => {
    db.problem.findMany.reset()
    db.problem.findUnique.reset()
    db.problem.findUniqueOrThrow.reset()
    db.problem.findUniqueOrThrow.resolves({
      ...emptyStatementFields,
      mandeuldangSolution: null,
      problemTestcase: [] as unknown[]
    })
    db.problem.findFirstOrThrow.reset()
    db.problem.update.reset()
    db.problem.update.resolvesArg(0)
    db.mandeuldangCollaborator.findUnique.reset()
    db.$transaction.reset()
    db.$transaction.callsFake((cb: (tx: typeof db) => unknown) => cb(db))

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MandeuldangProblemService,
        PublishCheckService,
        { provide: PrismaService, useValue: db }
      ]
    }).compile()

    service = module.get<MandeuldangProblemService>(MandeuldangProblemService)
  })

  it('should be defined', () => {
    expect(service).to.be.ok
  })

  describe('getMyProblems', () => {
    it('filters by creationMode=Mandeuldang and createdById, regardless of status by default', async () => {
      db.problem.findMany.resolves([baseProblem])

      await service.getMyProblems(ownerId, null, 10)

      const call = db.problem.findMany.firstCall.args[0]
      expect(call.where).to.deep.equal({
        creationMode: ProblemCreationMode.Mandeuldang,
        createdById: ownerId
      })
    })

    it('narrows to a specific status when one is given', async () => {
      db.problem.findMany.resolves([])

      await service.getMyProblems(ownerId, null, 10, ProblemStatus.Ready)

      const call = db.problem.findMany.firstCall.args[0]
      expect(call.where.status).to.equal(ProblemStatus.Ready)
    })

    it('reports myRole=Owner on every item in the list', async () => {
      db.problem.findMany.resolves([baseProblem])

      const result = await service.getMyProblems(ownerId, null, 10)

      expect(result[0].myRole).to.equal(CollaboratorRole.Owner)
    })
  })

  describe('getInProgressProblems', () => {
    it('excludes Published problems and includes owner OR approved-collaborator scope by default', async () => {
      db.problem.findMany.resolves([])

      await service.getInProgressProblems(ownerId, null, 10)

      const call = db.problem.findMany.firstCall.args[0]
      expect(call.where.status).to.deep.equal({ not: ProblemStatus.Published })
      expect(call.where.OR).to.deep.equal([
        { createdById: ownerId },
        {
          mandeuldangCollaborators: {
            some: { userId: ownerId, status: CollaboratorStatus.Approved }
          }
        }
      ])
    })

    it('narrows to a specific status when one is given, instead of "not Published"', async () => {
      db.problem.findMany.resolves([])

      await service.getInProgressProblems(
        ownerId,
        null,
        10,
        ProblemStatus.Draft
      )

      const call = db.problem.findMany.firstCall.args[0]
      expect(call.where.status).to.equal(ProblemStatus.Draft)
    })

    it('reports myRole for a collaborator entry, distinct from owned entries', async () => {
      const ownedItem = { ...baseProblem, id: 1, createdById: collaboratorId }
      const collaboratingItem = {
        ...baseProblem,
        id: 2,
        createdById: ownerId,
        mandeuldangCollaborators: [
          {
            userId: collaboratorId,
            role: CollaboratorRole.Reviewer,
            status: CollaboratorStatus.Approved
          }
        ]
      }
      db.problem.findMany.resolves([ownedItem, collaboratingItem])

      const result = await service.getInProgressProblems(
        collaboratorId,
        null,
        10
      )

      expect(result[0].myRole).to.equal(CollaboratorRole.Owner)
      expect(result[1].myRole).to.equal(CollaboratorRole.Reviewer)
    })
  })

  describe('getProblem', () => {
    it('throws EntityNotExistException when the problem does not exist', async () => {
      db.problem.findUnique.resolves(null)

      try {
        await service.getProblem(999, ownerId, Role.User)
        expect.fail('should have thrown')
      } catch (err) {
        expect((err as Error).message).to.include('MandeuldangProblem')
      }
    })

    it('throws EntityNotExistException for a Legacy (non-Mandeuldang) problem', async () => {
      db.problem.findUnique.resolves({
        ...baseProblem,
        creationMode: ProblemCreationMode.Legacy
      })

      try {
        await service.getProblem(baseProblem.id, ownerId, Role.User)
        expect.fail('should have thrown')
      } catch (err) {
        expect((err as Error).message).to.include('MandeuldangProblem')
      }
    })

    it('allows the owner to view their own Draft problem and reports myRole=Owner', async () => {
      db.problem.findUnique.resolves(baseProblem)
      db.problem.findUniqueOrThrow.resolves({
        ...emptyStatementFields,
        mandeuldangSolution: null,
        problemTestcase: []
      })

      const result = await service.getProblem(
        baseProblem.id,
        ownerId,
        Role.User
      )

      expect(result.myRole).to.equal(CollaboratorRole.Owner)
      expect(result.testFileCount).to.equal(0)
      expect(result.canPublish).to.equal(false)
      expect(result.missingForPublish).to.include.members([
        'STATEMENT',
        'SOLUTION',
        'TEST_FILES'
      ])
    })

    it('allows an approved collaborator to view a Draft problem they do not own', async () => {
      db.problem.findUnique.resolves({
        ...baseProblem,
        mandeuldangCollaborators: [
          {
            userId: collaboratorId,
            role: CollaboratorRole.Editor,
            status: CollaboratorStatus.Approved
          }
        ]
      })

      const result = await service.getProblem(
        baseProblem.id,
        collaboratorId,
        Role.User
      )

      expect(result.myRole).to.equal(CollaboratorRole.Editor)
    })

    it('rejects a pending (not yet approved) collaborator from viewing a Draft problem', async () => {
      db.problem.findUnique.resolves({
        ...baseProblem,
        mandeuldangCollaborators: [
          {
            userId: collaboratorId,
            role: CollaboratorRole.Editor,
            status: CollaboratorStatus.Pending
          }
        ]
      })

      try {
        await service.getProblem(baseProblem.id, collaboratorId, Role.User)
        expect.fail('should have thrown')
      } catch (err) {
        expect((err as Error).message).to.include('Only the owner')
      }
    })

    it('rejects an unrelated user from viewing a Draft problem', async () => {
      db.problem.findUnique.resolves(baseProblem)

      try {
        await service.getProblem(baseProblem.id, strangerId, Role.User)
        expect.fail('should have thrown')
      } catch (err) {
        expect((err as Error).message).to.include('Only the owner')
      }
    })

    it('lets an Admin view a Draft problem they neither own nor collaborate on', async () => {
      db.problem.findUnique.resolves(baseProblem)

      const result = await service.getProblem(
        baseProblem.id,
        strangerId,
        Role.Admin
      )

      expect(result.myRole).to.equal(null)
    })

    it('lets anyone view a Published problem, even a stranger with no privilege', async () => {
      db.problem.findUnique.resolves({
        ...baseProblem,
        status: ProblemStatus.Published,
        description: 'a real statement',
        mandeuldangSolution: { id: 1 },
        mandeuldangTestFiles: [{ id: 1 }, { id: 2 }, { id: 3 }]
      })
      db.problem.findUniqueOrThrow.resolves({
        ...fullStatementFields,
        mandeuldangSolution: { id: 1 },
        problemTestcase: [{ id: 1 }]
      })

      const result = await service.getProblem(
        baseProblem.id,
        strangerId,
        Role.User
      )

      expect(result.testFileCount).to.equal(3)
      expect(result.canPublish).to.equal(true)
      expect(result.missingForPublish).to.deep.equal([])
    })

    it('returns the actual test file list, not just a count', async () => {
      const testFiles = [
        { id: 1, fileName: '1.in' },
        { id: 2, fileName: '1.out' }
      ]
      db.problem.findUnique.resolves({
        ...baseProblem,
        mandeuldangTestFiles: testFiles
      })

      const result = await service.getProblem(
        baseProblem.id,
        ownerId,
        Role.User
      )

      expect(result.mandeuldangTestFiles).to.deep.equal(testFiles)
    })
  })

  describe('updateProblem', () => {
    const draftProblem = { id: 10, status: ProblemStatus.Draft }
    const readyProblem = { id: 10, status: ProblemStatus.Ready }
    const publishedProblem = { id: 10, status: ProblemStatus.Published }

    const approve = (role: CollaboratorRole) =>
      db.mandeuldangCollaborator.findUnique.resolves({
        role,
        status: CollaboratorStatus.Approved
      })

    it('rejects a user with no collaborator record', async () => {
      db.problem.findFirstOrThrow.resolves(draftProblem)
      db.mandeuldangCollaborator.findUnique.resolves(null)

      try {
        await service.updateProblem({ id: 10 }, strangerId)
        expect.fail('should have thrown')
      } catch (err) {
        expect((err as Error).message).to.include('Owner or Editor')
      }
    })

    it('rejects a Reviewer even when Approved', async () => {
      db.problem.findFirstOrThrow.resolves(draftProblem)
      approve(CollaboratorRole.Reviewer)

      try {
        await service.updateProblem({ id: 10 }, collaboratorId)
        expect.fail('should have thrown')
      } catch (err) {
        expect((err as Error).message).to.include('Owner or Editor')
      }
    })

    it('rejects an Editor who is still Pending approval', async () => {
      db.problem.findFirstOrThrow.resolves(draftProblem)
      db.mandeuldangCollaborator.findUnique.resolves({
        role: CollaboratorRole.Editor,
        status: CollaboratorStatus.Pending
      })

      try {
        await service.updateProblem({ id: 10 }, collaboratorId)
        expect.fail('should have thrown')
      } catch (err) {
        expect((err as Error).message).to.include('Owner or Editor')
      }
    })

    it('lets an approved Editor save plain field changes', async () => {
      db.problem.findFirstOrThrow.resolves(draftProblem)
      approve(CollaboratorRole.Editor)

      await service.updateProblem({ id: 10, title: 'new title' }, ownerId)

      const call = db.problem.update.firstCall.args[0]
      expect(call.where).to.deep.equal({ id: 10 })
      expect(call.data.title).to.equal('new title')
    })

    it('serializes template as a JSON string array, not the raw objects', async () => {
      db.problem.findFirstOrThrow.resolves(draftProblem)
      approve(CollaboratorRole.Owner)
      const template = [
        {
          language: Language.Cpp,
          code: [{ id: 1, text: 'int main() {}', locked: false }]
        }
      ]

      await service.updateProblem({ id: 10, template }, ownerId)

      const call = db.problem.update.firstCall.args[0]
      expect(call.data.template).to.deep.equal([JSON.stringify(template)])
    })

    it('turns tags.create/tags.delete into a problemTag write', async () => {
      db.problem.findFirstOrThrow.resolves(draftProblem)
      approve(CollaboratorRole.Owner)

      await service.updateProblem(
        { id: 10, tags: { create: [1, 2], delete: [3] } },
        ownerId
      )

      const call = db.problem.update.firstCall.args[0]
      expect(call.data.problemTag).to.deep.equal({
        deleteMany: { tagId: { in: [3] } },
        create: [{ tagId: 1 }, { tagId: 2 }]
      })
    })

    it('promotes Draft to Ready once the publish conditions are met', async () => {
      db.problem.findFirstOrThrow.resolves(draftProblem)
      approve(CollaboratorRole.Owner)
      db.problem.findUniqueOrThrow.resolves({
        ...fullStatementFields,
        mandeuldangSolution: { id: 1 },
        problemTestcase: [{ id: 1 }]
      })

      await service.updateProblem({ id: 10 }, ownerId)

      const statusCall = db.problem.update.secondCall.args[0]
      expect(statusCall.data).to.deep.equal({ status: ProblemStatus.Ready })
    })

    it('demotes Ready back to Draft once the publish conditions break', async () => {
      db.problem.findFirstOrThrow.resolves(readyProblem)
      approve(CollaboratorRole.Owner)
      // findUniqueOrThrow의 기본 stub은 emptyStatementFields라 canPublish=false

      await service.updateProblem({ id: 10 }, ownerId)

      const statusCall = db.problem.update.secondCall.args[0]
      expect(statusCall.data).to.deep.equal({ status: ProblemStatus.Draft })
    })

    it('does not issue a redundant status write when status would stay the same', async () => {
      db.problem.findFirstOrThrow.resolves(draftProblem)
      approve(CollaboratorRole.Owner)
      // findUniqueOrThrow의 기본 stub은 emptyStatementFields라 canPublish=false, Draft 그대로 유지

      await service.updateProblem({ id: 10 }, ownerId)

      expect(db.problem.update.calledOnce).to.equal(true)
    })

    it('saves a Published problem as-is when it still satisfies the publish conditions', async () => {
      db.problem.findFirstOrThrow.resolves(publishedProblem)
      approve(CollaboratorRole.Owner)
      db.problem.findUniqueOrThrow.resolves({
        ...fullStatementFields,
        mandeuldangSolution: { id: 1 },
        problemTestcase: [{ id: 1 }]
      })

      const result = await service.updateProblem({ id: 10 }, ownerId)

      expect(db.problem.update.calledOnce).to.equal(true)
      expect(result).to.be.ok
    })

    it('rejects an edit to a Published problem that would break the publish conditions', async () => {
      db.problem.findFirstOrThrow.resolves(publishedProblem)
      approve(CollaboratorRole.Owner)
      // findUniqueOrThrow의 기본 stub은 emptyStatementFields라 canPublish=false

      try {
        await service.updateProblem({ id: 10 }, ownerId)
        expect.fail('should have thrown')
      } catch (err) {
        expect((err as Error).message).to.include('cannot be saved')
      }
    })
  })

  describe('publishProblem', () => {
    const readyProblem = { id: 10, status: ProblemStatus.Ready }
    const draftProblem = { id: 10, status: ProblemStatus.Draft }

    const readyToPublishSnapshot = {
      ...fullStatementFields,
      mandeuldangSolution: { id: 1 },
      problemTestcase: [{ id: 1 }]
    }

    it('rejects a non-Owner collaborator (Editor)', async () => {
      db.problem.findFirstOrThrow.resolves(readyProblem)
      db.mandeuldangCollaborator.findUnique.resolves({
        role: CollaboratorRole.Editor,
        status: CollaboratorStatus.Approved
      })

      try {
        await service.publishProblem(10, collaboratorId)
        expect.fail('should have thrown')
      } catch (err) {
        expect((err as Error).message).to.include('Only Owner')
      }
    })

    it('rejects a user with no collaborator record', async () => {
      db.problem.findFirstOrThrow.resolves(readyProblem)
      db.mandeuldangCollaborator.findUnique.resolves(null)

      try {
        await service.publishProblem(10, strangerId)
        expect.fail('should have thrown')
      } catch (err) {
        expect((err as Error).message).to.include('Only Owner')
      }
    })

    it('rejects publishing a problem that is not yet Ready', async () => {
      db.problem.findFirstOrThrow.resolves(draftProblem)
      db.mandeuldangCollaborator.findUnique.resolves({
        role: CollaboratorRole.Owner,
        status: CollaboratorStatus.Approved
      })

      try {
        await service.publishProblem(10, ownerId)
        expect.fail('should have thrown')
      } catch (err) {
        expect((err as Error).message).to.include('Ready')
      }
    })

    it('rejects publishing when the publish conditions no longer hold, even if status says Ready', async () => {
      db.problem.findFirstOrThrow.resolves(readyProblem)
      db.mandeuldangCollaborator.findUnique.resolves({
        role: CollaboratorRole.Owner,
        status: CollaboratorStatus.Approved
      })
      // findUniqueOrThrow의 기본 stub은 emptyStatementFields라 canPublish=false

      try {
        await service.publishProblem(10, ownerId)
        expect.fail('should have thrown')
      } catch (err) {
        expect((err as Error).message).to.include('Cannot publish')
      }
    })

    it('publishes a Ready, publish-eligible problem', async () => {
      db.problem.findFirstOrThrow.resolves(readyProblem)
      db.mandeuldangCollaborator.findUnique.resolves({
        role: CollaboratorRole.Owner,
        status: CollaboratorStatus.Approved
      })
      db.problem.findUniqueOrThrow.resolves(readyToPublishSnapshot)

      await service.publishProblem(10, ownerId)

      const call = db.problem.update.firstCall.args[0]
      expect(call.where).to.deep.equal({ id: 10 })
      expect(call.data).to.deep.equal({ status: ProblemStatus.Published })
    })
  })
})
