import { Test } from '@nestjs/testing'
import { CollaboratorRole, CollaboratorStatus, Prisma } from '@prisma/client'
import { expect } from 'chai'
import { stub } from 'sinon'
import {
  DuplicateFoundException,
  EntityNotExistException,
  ForbiddenAccessException,
  UnprocessableDataException
} from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import { CollaboratorService } from './collaborator.service'

const problemId = 10
const ownerId = 1
const inviteeId = 2
const editorId = 3
const reviewerId = 4

const inviteInput = {
  userEmail: 'invitee@test.com',
  role: CollaboratorRole.Reviewer
}

const problem = {
  id: problemId,
  createdById: ownerId
}

const collaborator = {
  id: 100,
  problemId,
  userId: inviteeId,
  role: CollaboratorRole.Reviewer,
  status: CollaboratorStatus.Pending,
  invitedById: editorId,
  invitedAt: new Date('2026-09-01T00:00:00Z'),
  approvedAt: null,
  createTime: new Date('2026-09-01T00:00:00Z')
}

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

const prismaError = (code: string) =>
  new Prisma.PrismaClientKnownRequestError('Database operation failed', {
    code,
    clientVersion: '6.13.0'
  })

describe('CollaboratorService', () => {
  let service: CollaboratorService

  beforeEach(async () => {
    for (const model of Object.values(db)) {
      for (const method of Object.values(model)) {
        method.reset()
      }
    }

    const module = await Test.createTestingModule({
      providers: [CollaboratorService, { provide: PrismaService, useValue: db }]
    }).compile()

    service = module.get(CollaboratorService)

    db.user.findUnique.resolves({ id: inviteeId })
    db.problem.findUnique.resolves(problem)
    db.mandeuldangCollaborator.findFirst.resolves(null)
  })

  const expectNoWrites = () => {
    expect(db.mandeuldangCollaborator.create.called).to.equal(false)
    expect(db.mandeuldangCollaborator.update.called).to.equal(false)
    expect(db.mandeuldangCollaborator.delete.called).to.equal(false)
  }

  // Editor/Reviewer는 본인 권한 조회 후 초대 대상의 기존 레코드를 조회한다.
  const setupInviter = (
    role: CollaboratorRole,
    status: CollaboratorStatus = CollaboratorStatus.Approved
  ) => {
    db.mandeuldangCollaborator.findFirst.onFirstCall().resolves({
      id: 200,
      role,
      status
    })
  }

  const expectInvitationData = (
    data: Record<string, unknown>,
    inviterId: number,
    status: CollaboratorStatus,
    startedAt: number
  ) => {
    expect(data).to.include({
      role: inviteInput.role,
      status,
      invitedById: inviterId
    })

    expect(data.invitedAt).to.be.instanceOf(Date)
    expect((data.invitedAt as Date).getTime()).to.be.within(
      startedAt,
      Date.now()
    )

    if (status === CollaboratorStatus.Approved) {
      expect(data.approvedAt).to.deep.equal(data.invitedAt)
    } else {
      expect(data.approvedAt).to.equal(null)
    }
  }

  describe('inviteCollaborator', () => {
    it('Owner 초대는 Approved로 생성하고 초대·승인 정보를 저장한다', async () => {
      const saved = {
        ...collaborator,
        status: CollaboratorStatus.Approved
      }
      db.mandeuldangCollaborator.create.resolves(saved)
      const startedAt = Date.now()

      const result = await service.inviteCollaborator(
        ownerId,
        problemId,
        inviteInput
      )

      expect(result).to.deep.equal(saved)
      expect(db.mandeuldangCollaborator.create.calledOnce).to.equal(true)

      const { data } = db.mandeuldangCollaborator.create.firstCall.args[0]

      expect(data).to.include({ problemId, userId: inviteeId })
      expectInvitationData(
        data,
        ownerId,
        CollaboratorStatus.Approved,
        startedAt
      )
      expect(db.mandeuldangCollaborator.update.called).to.equal(false)
    })

    it('Approved Editor 초대는 Pending으로 생성한다', async () => {
      setupInviter(CollaboratorRole.Editor)
      db.mandeuldangCollaborator.create.resolves(collaborator)
      const startedAt = Date.now()

      await service.inviteCollaborator(editorId, problemId, inviteInput)

      expect(db.mandeuldangCollaborator.create.calledOnce).to.equal(true)

      const { data } = db.mandeuldangCollaborator.create.firstCall.args[0]

      expect(data).to.include({ problemId, userId: inviteeId })
      expectInvitationData(
        data,
        editorId,
        CollaboratorStatus.Pending,
        startedAt
      )
      expect(db.mandeuldangCollaborator.update.called).to.equal(false)
    })

    it('Reviewer는 초대할 수 없다', async () => {
      setupInviter(CollaboratorRole.Reviewer)

      await expect(
        service.inviteCollaborator(reviewerId, problemId, inviteInput)
      ).to.be.rejectedWith(ForbiddenAccessException)

      expectNoWrites()
    })

    it('Pending Editor는 초대할 수 없다', async () => {
      setupInviter(CollaboratorRole.Editor, CollaboratorStatus.Pending)

      await expect(
        service.inviteCollaborator(editorId, problemId, inviteInput)
      ).to.be.rejectedWith(ForbiddenAccessException)

      expectNoWrites()
    })

    it('Owner 역할로 초대할 수 없다', async () => {
      await expect(
        service.inviteCollaborator(ownerId, problemId, {
          ...inviteInput,
          role: CollaboratorRole.Owner
        })
      ).to.be.rejectedWith(UnprocessableDataException)

      expectNoWrites()
    })

    it('존재하지 않는 사용자는 초대할 수 없다', async () => {
      db.user.findUnique.resolves(null)

      await expect(
        service.inviteCollaborator(ownerId, problemId, inviteInput)
      ).to.be.rejectedWith(EntityNotExistException)

      expectNoWrites()
    })

    for (const status of [
      CollaboratorStatus.Pending,
      CollaboratorStatus.Approved
    ]) {
      it(`${status} 사용자는 중복 초대할 수 없다`, async () => {
        db.mandeuldangCollaborator.findFirst.resolves({
          ...collaborator,
          status
        })

        await expect(
          service.inviteCollaborator(ownerId, problemId, inviteInput)
        ).to.be.rejectedWith(DuplicateFoundException)

        expectNoWrites()
      })
    }

    for (const inviter of [
      { id: ownerId, status: CollaboratorStatus.Approved },
      { id: editorId, status: CollaboratorStatus.Pending }
    ]) {
      it(`Rejected 사용자를 ${inviter.id === ownerId ? 'Owner' : 'Editor'}가 재초대하면 기존 레코드를 ${inviter.status}로 갱신한다`, async () => {
        const rejected = {
          ...collaborator,
          role: CollaboratorRole.Editor,
          status: CollaboratorStatus.Rejected,
          invitedById: reviewerId,
          approvedAt: new Date('2026-09-02T00:00:00Z')
        }

        if (inviter.id === editorId) {
          setupInviter(CollaboratorRole.Editor)
          db.mandeuldangCollaborator.findFirst.onSecondCall().resolves(rejected)
        } else {
          db.mandeuldangCollaborator.findFirst.resolves(rejected)
        }

        const saved = { ...rejected, status: inviter.status }
        db.mandeuldangCollaborator.update.resolves(saved)
        const startedAt = Date.now()

        const result = await service.inviteCollaborator(
          inviter.id,
          problemId,
          inviteInput
        )

        expect(result).to.deep.equal(saved)
        expect(db.mandeuldangCollaborator.update.calledOnce).to.equal(true)
        expect(db.mandeuldangCollaborator.create.called).to.equal(false)

        const { where, data } =
          db.mandeuldangCollaborator.update.firstCall.args[0]

        expect(where).to.deep.equal({
          id: collaborator.id,
          status: CollaboratorStatus.Rejected
        })
        expectInvitationData(data, inviter.id, inviter.status, startedAt)
        expect(data).not.to.have.property('id')
        expect(data).not.to.have.property('createTime')
      })
    }

    it('동시 초대의 P2002는 중복 초대 오류로 변환한다', async () => {
      db.mandeuldangCollaborator.create.rejects(prismaError('P2002'))

      await expect(
        service.inviteCollaborator(ownerId, problemId, inviteInput)
      ).to.be.rejectedWith(DuplicateFoundException)
    })

    it('재초대 중 상태가 바뀐 P2025는 상태 변경 오류로 변환한다', async () => {
      db.mandeuldangCollaborator.findFirst.resolves({
        ...collaborator,
        status: CollaboratorStatus.Rejected
      })
      db.mandeuldangCollaborator.update.rejects(prismaError('P2025'))

      await expect(
        service.inviteCollaborator(ownerId, problemId, inviteInput)
      ).to.be.rejectedWith(UnprocessableDataException)

      expect(db.mandeuldangCollaborator.create.called).to.equal(false)
    })

    it('그 외 DB 오류는 그대로 전달한다', async () => {
      db.mandeuldangCollaborator.create.rejects(
        new Error('Unexpected database failure')
      )

      await expect(
        service.inviteCollaborator(ownerId, problemId, inviteInput)
      ).to.be.rejectedWith(Error, 'Unexpected database failure')
    })
  })

  describe('approveCollaborator / rejectCollaborator', () => {
    for (const action of ['approve', 'reject'] as const) {
      const isApproval = action === 'approve'
      const expectedStatus = isApproval
        ? CollaboratorStatus.Approved
        : CollaboratorStatus.Rejected

      const callAction = (requesterId: number) =>
        isApproval
          ? service.approveCollaborator(requesterId, problemId, inviteeId)
          : service.rejectCollaborator(requesterId, problemId, inviteeId)

      describe(action, () => {
        beforeEach(() => {
          db.mandeuldangCollaborator.findFirst.resolves(collaborator)
        })

        it(`Owner가 Pending을 ${expectedStatus}로 변경한다`, async () => {
          const saved = { ...collaborator, status: expectedStatus }
          db.mandeuldangCollaborator.update.resolves(saved)
          const startedAt = Date.now()

          const result = await callAction(ownerId)

          expect(result).to.deep.equal(saved)
          expect(db.mandeuldangCollaborator.update.calledOnce).to.equal(true)
          expect(db.mandeuldangCollaborator.delete.called).to.equal(false)
          expect(db.mandeuldangCollaborator.create.called).to.equal(false)

          const { where, data } =
            db.mandeuldangCollaborator.update.firstCall.args[0]

          expect(where).to.deep.equal({
            id: collaborator.id,
            status: CollaboratorStatus.Pending
          })
          expect(data.status).to.equal(expectedStatus)

          if (isApproval) {
            expect(data.approvedAt).to.be.instanceOf(Date)
            expect(data.approvedAt.getTime()).to.be.within(
              startedAt,
              Date.now()
            )
          } else {
            expect(data.approvedAt).to.equal(null)
          }

          expect(data).not.to.have.property('invitedById')
          expect(data).not.to.have.property('invitedAt')
          expect(data).not.to.have.property('createTime')
        })

        it('Owner가 아닌 사용자는 처리할 수 없다', async () => {
          await expect(callAction(editorId)).to.be.rejectedWith(
            ForbiddenAccessException
          )

          expectNoWrites()
        })

        it('문제가 없으면 실패한다', async () => {
          db.problem.findUnique.resolves(null)

          await expect(callAction(ownerId)).to.be.rejectedWith(
            EntityNotExistException
          )

          expectNoWrites()
        })

        it('협업자가 없으면 실패한다', async () => {
          db.mandeuldangCollaborator.findFirst.resolves(null)

          await expect(callAction(ownerId)).to.be.rejectedWith(
            EntityNotExistException
          )

          expectNoWrites()
        })

        for (const status of [
          CollaboratorStatus.Approved,
          CollaboratorStatus.Rejected
        ]) {
          it(`${status} 상태는 처리할 수 없다`, async () => {
            db.mandeuldangCollaborator.findFirst.resolves({
              ...collaborator,
              status
            })

            await expect(callAction(ownerId)).to.be.rejectedWith(
              UnprocessableDataException
            )

            expectNoWrites()
          })
        }

        it('갱신 중 상태가 바뀐 P2025를 변환한다', async () => {
          db.mandeuldangCollaborator.update.rejects(prismaError('P2025'))

          await expect(callAction(ownerId)).to.be.rejectedWith(
            UnprocessableDataException
          )

          expect(db.mandeuldangCollaborator.delete.called).to.equal(false)
        })

        it('그 외 DB 오류는 그대로 전달한다', async () => {
          db.mandeuldangCollaborator.update.rejects(
            new Error('Unexpected database failure')
          )

          await expect(callAction(ownerId)).to.be.rejectedWith(
            Error,
            'Unexpected database failure'
          )
        })
      })
    }
  })

  describe('getCollaboratorsByStatus', () => {
    for (const status of [
      CollaboratorStatus.Approved,
      CollaboratorStatus.Pending
    ]) {
      it(`${status} 협업자 목록을 반환한다`, async () => {
        const user = {
          id: inviteeId,
          username: 'invitee',
          email: inviteInput.userEmail
        }
        db.mandeuldangCollaborator.findMany.resolves([
          { role: CollaboratorRole.Reviewer, user }
        ])

        const result = await service.getCollaboratorsByStatus(
          ownerId,
          problemId,
          status
        )

        expect(result).to.deep.equal([
          { ...user, role: CollaboratorRole.Reviewer }
        ])
        expect(
          db.mandeuldangCollaborator.findMany.firstCall.args[0].where
        ).to.deep.equal({ problemId, status })
      })
    }
  })

  describe('updateCollaboratorRole', () => {
    it('Owner가 Approved 협업자의 역할을 변경한다', async () => {
      db.mandeuldangCollaborator.findFirst.resolves({
        ...collaborator,
        status: CollaboratorStatus.Approved
      })

      const saved = {
        ...collaborator,
        status: CollaboratorStatus.Approved,
        role: CollaboratorRole.Editor
      }
      db.mandeuldangCollaborator.update.resolves(saved)

      const result = await service.updateCollaboratorRole(ownerId, problemId, {
        userId: inviteeId,
        role: CollaboratorRole.Editor
      })

      expect(result).to.deep.equal(saved)
      expect(db.mandeuldangCollaborator.update.firstCall.args[0]).to.deep.equal(
        {
          where: { id: collaborator.id },
          data: { role: CollaboratorRole.Editor }
        }
      )
    })

    it('Editor는 역할을 변경할 수 없다', async () => {
      await expect(
        service.updateCollaboratorRole(editorId, problemId, {
          userId: inviteeId,
          role: CollaboratorRole.Editor
        })
      ).to.be.rejectedWith(ForbiddenAccessException)

      expectNoWrites()
    })
  })
})
