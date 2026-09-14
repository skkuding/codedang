import { Test, type TestingModule } from '@nestjs/testing'
import { CollaboratorRole, CollaboratorStatus } from '@generated'
import { expect } from 'chai'
import { stub } from 'sinon'
import { ForbiddenAccessException } from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import { CollaboratorService } from './collaborator.service'

const exampleOwner = {
  id: 1,
  username: 'owner',
  email: 'owner@test.com'
}

const exampleUser = {
  id: 2,
  username: 'invitee',
  email: 'invitee@test.com'
}

const exampleEditorUser = {
  id: 3,
  username: 'editor',
  email: 'editor@test.com'
}

const exampleReviewerUser = {
  id: 4,
  username: 'reviewer',
  email: 'reviewer@test.com'
}

const examplePendingUser = {
  id: 5,
  username: 'pending',
  email: 'pending@test.com'
}

const exampleReviewerCollaborator = {
  id: 1,
  problemId: 10,
  userId: exampleReviewerUser.id,
  role: CollaboratorRole.Reviewer,
  status: CollaboratorStatus.Approved
}

const exampleEditorCollaborator = {
  id: 2,
  problemId: 10,
  userId: exampleEditorUser.id,
  role: CollaboratorRole.Editor,
  status: CollaboratorStatus.Approved
}

const examplePendingCollaborator = {
  id: 3,
  problemId: 10,
  userId: examplePendingUser.id,
  role: CollaboratorRole.Reviewer,
  status: CollaboratorStatus.Pending
}

const exampleCollaboratorList = [
  exampleReviewerCollaborator,
  exampleEditorCollaborator,
  examplePendingCollaborator
]

const exampleProblem = {
  id: 10,
  createdById: exampleOwner.id,
  mandeuldangCollaborators: exampleCollaboratorList
}

const exampleCollaboratorListByStatus = [
  {
    role: exampleReviewerCollaborator.role,
    user: {
      id: exampleReviewerUser.id,
      username: exampleReviewerUser.username,
      email: exampleReviewerUser.email
    }
  },
  {
    role: exampleEditorCollaborator.role,
    user: {
      id: exampleEditorUser.id,
      username: exampleEditorUser.username,
      email: exampleEditorUser.email
    }
  }
]

const db = {
  user: {
    findUnique: stub()
  },
  problem: {
    findUnique: stub()
  },
  mandeuldangCollaborator: {
    findFirst: stub(),
    findMany: stub(),
    create: stub(),
    update: stub(),
    delete: stub()
  }
}

describe('CollaboratorService', () => {
  let service: CollaboratorService

  beforeEach(async () => {
    db.user.findUnique.reset()
    db.problem.findUnique.reset()
    db.mandeuldangCollaborator.findFirst.reset()
    db.mandeuldangCollaborator.findMany.reset()
    db.mandeuldangCollaborator.create.reset()
    db.mandeuldangCollaborator.update.reset()
    db.mandeuldangCollaborator.delete.reset()
    const module: TestingModule = await Test.createTestingModule({
      providers: [CollaboratorService, { provide: PrismaService, useValue: db }]
    }).compile()

    service = module.get<CollaboratorService>(CollaboratorService)
  })

  it('should be defined', () => {
    expect(service).to.be.ok
  })

  describe('inviteCollaborator', () => {
    it('owner can invite collaborator', async () => {
      db.user.findUnique.resolves({ id: exampleUser.id })
      db.problem.findUnique.resolves({
        createdById: exampleProblem.createdById
      })

      db.mandeuldangCollaborator.findFirst.resolves(null)
      const invitedCollaborator = {
        ...exampleReviewerCollaborator,
        userId: exampleUser.id
      }
      db.mandeuldangCollaborator.create.resolves(invitedCollaborator)

      const result = await service.inviteCollaborator(
        exampleOwner.id,
        exampleProblem.id,
        {
          userEmail: exampleUser.email,
          role: CollaboratorRole.Reviewer
        }
      )
      expect(result).to.deep.equal(invitedCollaborator)
    })

    it('Reviewer cannot invite collaborator', async () => {
      db.user.findUnique.resolves({ id: exampleUser.id })
      db.problem.findUnique.resolves({
        createdById: exampleProblem.createdById
      })
      db.mandeuldangCollaborator.findFirst.resolves(exampleReviewerCollaborator)

      await expect(
        service.inviteCollaborator(exampleReviewerUser.id, exampleProblem.id, {
          userEmail: exampleUser.email,
          role: CollaboratorRole.Reviewer
        })
      ).to.be.rejectedWith(ForbiddenAccessException)
    })
  })

  describe('getCollaboratorsByStatus', () => {
    it('return Approved collaborators', async () => {
      db.problem.findUnique.resolves({
        createdById: exampleProblem.createdById
      })
      db.mandeuldangCollaborator.findMany.resolves(
        exampleCollaboratorListByStatus
      )

      const result = await service.getCollaboratorsByStatus(
        exampleOwner.id,
        exampleProblem.id,
        CollaboratorStatus.Approved
      )

      expect(result).to.deep.equal([
        {
          id: exampleReviewerUser.id,
          username: exampleReviewerUser.username,
          email: exampleReviewerUser.email,
          role: exampleReviewerCollaborator.role
        },
        {
          id: exampleEditorUser.id,
          username: exampleEditorUser.username,
          email: exampleEditorUser.email,
          role: exampleEditorCollaborator.role
        }
      ])
    })

    it('returns pending collaborators', async () => {
      db.problem.findUnique.resolves({
        createdById: exampleProblem.createdById
      })
      db.mandeuldangCollaborator.findMany.resolves([
        {
          role: examplePendingCollaborator.role,
          user: {
            id: examplePendingUser.id,
            username: examplePendingUser.username,
            email: examplePendingUser.email
          }
        }
      ])

      const result = await service.getCollaboratorsByStatus(
        exampleOwner.id,
        exampleProblem.id,
        CollaboratorStatus.Pending
      )

      expect(result).to.deep.equal([
        {
          id: examplePendingUser.id,
          username: examplePendingUser.username,
          email: examplePendingUser.email,
          role: examplePendingCollaborator.role
        }
      ])
    })
  })
  describe('updateCollaboratorRole', () => {
    it('owner updates collaborator role', async () => {
      db.problem.findUnique.resolves({
        createdById: exampleProblem.createdById
      })
      db.mandeuldangCollaborator.findFirst.resolves({
        id: exampleReviewerCollaborator.id,
        status: exampleReviewerCollaborator.status
      })
      const updatedCollaborator = {
        ...exampleReviewerCollaborator,
        role: CollaboratorRole.Editor
      }
      db.mandeuldangCollaborator.update.resolves(updatedCollaborator)

      const result = await service.updateCollaboratorRole(
        exampleOwner.id,
        exampleProblem.id,
        { userId: exampleReviewerUser.id, role: CollaboratorRole.Editor }
      )

      expect(result).to.deep.equal(updatedCollaborator)
    })
    it('Editor cannot update collaborator role', async () => {
      db.problem.findUnique.resolves({
        createdById: exampleProblem.createdById
      })

      await expect(
        service.updateCollaboratorRole(
          exampleEditorUser.id,
          exampleProblem.id,
          { userId: exampleReviewerUser.id, role: CollaboratorRole.Editor }
        )
      ).to.be.rejectedWith(ForbiddenAccessException)
    })
  })
})
