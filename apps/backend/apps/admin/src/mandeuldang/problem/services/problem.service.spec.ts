import { ForbiddenException } from '@nestjs/common'
import { Test, type TestingModule } from '@nestjs/testing'
import { ProblemType } from '@generated'
import {
  CollaboratorRole,
  CollaboratorStatus,
  ProblemCreationMode,
  ProblemStatus,
  Role
} from '@prisma/client'
import { expect } from 'chai'
import { rejects } from 'node:assert/strict'
import { stub } from 'sinon'
import { MAX_DATE } from '@libs/constants'
import { PrismaService } from '@libs/prisma'
import { StorageService } from '@libs/storage'
import { MandeuldangProblemService } from './problem.service'

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

const db = {
  problem: {
    findMany: stub(),
    findUnique: stub(),
    create: stub(),
    findFirstOrThrow: stub(),
    delete: stub()
  },
  getPaginator: PrismaService.prototype.getPaginator
}

describe('MandeuldangProblemService', () => {
  let service: MandeuldangProblemService

  beforeEach(async () => {
    db.problem.findMany.reset()
    db.problem.findUnique.reset()
    db.problem.create.reset()
    db.problem.findFirstOrThrow.reset()
    db.problem.delete.reset()

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MandeuldangProblemService,
        { provide: PrismaService, useValue: db },
        {
          provide: StorageService,
          useValue: {
            deleteFile: stub().resolves()
          }
        }
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

  describe('createProblem', () => {
    it('creates a draft with its creator as an approved owner', async () => {
      const owner = {
        userId: ownerId,
        role: CollaboratorRole.Owner,
        status: CollaboratorStatus.Approved
      }
      const created = { ...baseProblem, mandeuldangCollaborators: [owner] }
      db.problem.create.resolves(created)

      const result = await service.createProblem(
        { title: '  New problem  ', problemType: ProblemType.General },
        ownerId
      )

      expect(db.problem.create.firstCall.args[0]).to.deep.equal({
        data: {
          title: 'New problem',
          problemType: ProblemType.General,
          languages: undefined,
          creationMode: ProblemCreationMode.Mandeuldang,
          status: ProblemStatus.Draft,
          createdById: ownerId,
          visibleLockTime: MAX_DATE,
          mandeuldangCollaborators: { create: owner }
        },
        include: { mandeuldangCollaborators: true }
      })
      expect(result).to.deep.equal({
        ...created,
        myRole: CollaboratorRole.Owner,
        testFileCount: 0
      })
    })
  })

  describe('deleteProblem', () => {
    it('deletes the Mandeuldang problem when the requester is its owner', async () => {
      db.problem.findFirstOrThrow.resolves({
        mandeuldangCollaborators: [
          { userId: ownerId, role: CollaboratorRole.Owner }
        ]
      })
      db.problem.delete.resolves(baseProblem)

      const result = await service.deleteProblem(baseProblem.id, ownerId)

      expect(db.problem.findFirstOrThrow.firstCall.args[0]).to.deep.equal({
        where: {
          id: baseProblem.id,
          creationMode: ProblemCreationMode.Mandeuldang
        },
        include: {
          mandeuldangCollaborators: {
            where: { userId: ownerId, role: CollaboratorRole.Owner }
          }
        }
      })
      expect(
        db.problem.delete.calledOnceWithExactly({
          where: { id: baseProblem.id }
        })
      ).to.equal(true)
      expect(result).to.equal(baseProblem)
    })

    it('rejects a non-owner without deleting the problem', async () => {
      db.problem.findFirstOrThrow.resolves({ mandeuldangCollaborators: [] })

      await rejects(
        service.deleteProblem(baseProblem.id, strangerId),
        ForbiddenException
      )

      expect(db.problem.delete.called).to.equal(false)
    })

    it('propagates a failed Mandeuldang problem lookup without deleting anything', async () => {
      const error = new Error('Problem not found')
      db.problem.findFirstOrThrow.rejects(error)

      await rejects(
        service.deleteProblem(baseProblem.id, ownerId),
        (caught) => caught === error
      )

      expect(db.problem.delete.called).to.equal(false)
    })
  })

  describe('extractUUIDs', () => {
    it('returns an empty list for a missing description or text without UUIDs', () => {
      expect(service.extractUUIDs(null)).to.deep.equal([])
      expect(service.extractUUIDs('Plain text')).to.deep.equal([])
    })

    it('extracts each UUID from attachment links in the description', () => {
      const first = 'a74d3158-4848-428e-8c31-7ac2d8df82c0'
      const second = 'BE6341D6-A583-4DAE-A725-22612A6C8905'
      const description = `![diagram](/media/${first}.png) ![example](/media/${second}.jpg)`

      expect(service.extractUUIDs(description)).to.deep.equal([first, second])
    })
  })
})
