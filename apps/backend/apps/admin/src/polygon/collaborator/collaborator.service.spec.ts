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

const exampleViewerUser = {
  id: 4,
  username: 'viewer',
  email: 'viewer@test.com'
}

const examplePendingUser = {
  id: 5,
  username: 'pending',
  email: 'pending@test.com'
}

const exampleViewerCollaborator = {
  id: 1,
  problemId: 10,
  userId: exampleViewerUser.id,
  role: CollaboratorRole.Viewer,
  status: CollaboratorStatus.Active
}

const exampleEditorCollaborator = {
  id: 2,
  problemId: 10,
  userId: exampleEditorUser.id,
  role: CollaboratorRole.Editor,
  status: CollaboratorStatus.Active
}

const examplePendingCollaborator = {
  id: 3,
  problemId: 10,
  userId: examplePendingUser.id,
  role: CollaboratorRole.Viewer,
  status: CollaboratorStatus.Pending
}

const exampleCollaboratorList = [
  exampleViewerCollaborator,
  exampleEditorCollaborator,
  examplePendingCollaborator
]

const exampleProblem = {
  id: 10,
  createdById: exampleOwner.id,
  polygonCollaborators: exampleCollaboratorList
}

const exampleCollaboratorListByStatus = [
  {
    role: exampleViewerCollaborator.role,
    user: {
      id: exampleViewerUser.id,
      username: exampleViewerUser.username,
      email: exampleViewerUser.email
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
  polygonProblem: {
    findUnique: stub()
  },
  polygonCollaborator: {
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
    db.polygonProblem.findUnique.reset()
    db.polygonCollaborator.findFirst.reset()
    db.polygonCollaborator.findMany.reset()
    db.polygonCollaborator.create.reset()
    db.polygonCollaborator.update.reset()
    db.polygonCollaborator.delete.reset()
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
      db.polygonProblem.findUnique.resolves({
        createdById: exampleProblem.createdById
      })

      db.polygonCollaborator.findFirst.resolves(null)
      db.polygonCollaborator.create.resolves(exampleViewerCollaborator)

      const result = await service.inviteCollaborator(
        exampleOwner.id,
        exampleProblem.id,
        {
          userEmail: exampleUser.email,
          role: CollaboratorRole.Viewer
        }
      )
      expect(result).to.deep.equal(exampleViewerCollaborator)
    })

    it('Viewer cannot invite collaborator', async () => {
      db.user.findUnique.resolves({ id: exampleUser.id })
      db.polygonProblem.findUnique.resolves({
        createdById: exampleProblem.createdById
      })
      db.polygonCollaborator.findFirst.resolves(exampleViewerCollaborator)

      await expect(
        service.inviteCollaborator(exampleViewerUser.id, exampleProblem.id, {
          userEmail: exampleUser.email,
          role: CollaboratorRole.Viewer
        })
      ).to.be.rejectedWith(ForbiddenAccessException)
    })
  })

  describe('getCollaboratorsByStatus', () => {
    it('return active collaborators', async () => {
      db.polygonCollaborator.findMany.resolves(exampleCollaboratorListByStatus)

      const result = await service.getCollaboratorsByStatus(
        exampleProblem.id,
        CollaboratorStatus.Active
      )

      expect(result).to.deep.equal([
        {
          id: exampleViewerUser.id,
          username: exampleViewerUser.username,
          email: exampleViewerUser.email,
          role: exampleViewerCollaborator.role
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
      db.polygonCollaborator.findMany.resolves([
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
      db.polygonProblem.findUnique.resolves({
        createdById: exampleProblem.createdById
      })
      db.polygonCollaborator.findFirst.resolves({
        id: exampleViewerCollaborator.id,
        status: exampleViewerCollaborator.status
      })
      const updatedCollaborator = {
        ...exampleViewerCollaborator,
        role: CollaboratorRole.Editor
      }
      db.polygonCollaborator.update.resolves(updatedCollaborator)

      const result = await service.updateCollaboratorRole(
        exampleOwner.id,
        exampleProblem.id,
        { userId: exampleViewerUser.id, role: CollaboratorRole.Editor }
      )

      expect(result).to.deep.equal(updatedCollaborator)
    })
    it('Editor cannot update collaborator role', async () => {
      db.polygonProblem.findUnique.resolves({
        createdById: exampleProblem.createdById
      })

      await expect(
        service.updateCollaboratorRole(
          exampleEditorUser.id,
          exampleProblem.id,
          { userId: exampleViewerUser.id, role: CollaboratorRole.Editor }
        )
      ).to.be.rejectedWith(ForbiddenAccessException)
    })
  })
})
