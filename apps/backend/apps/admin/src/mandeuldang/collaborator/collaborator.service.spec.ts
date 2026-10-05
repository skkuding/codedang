import { Test } from '@nestjs/testing'
import { CollaboratorStatus, Prisma, ProblemCreationMode } from '@prisma/client'
import { expect } from 'chai'
import { stub } from 'sinon'
import {
  DuplicateFoundException,
  EntityNotExistException,
  ForbiddenAccessException,
  UnprocessableDataException
} from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import { CollaboratorRole } from '@admin/@generated'
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
  describe('만들당 문제 검사', () => {
    const actions = [
      {
        name: '초대',
        run: () => service.inviteCollaborator(ownerId, problemId, inviteInput)
      },
      {
        name: '목록 조회',
        run: () =>
          service.getCollaboratorsByStatus(
            ownerId,
            problemId,
            CollaboratorStatus.Approved
          )
      },
      {
        name: '승인',
        run: () => service.approveCollaborator(ownerId, problemId, inviteeId)
      },
      {
        name: '거절',
        run: () => service.rejectCollaborator(ownerId, problemId, inviteeId)
      },
      {
        name: '역할 변경',
        run: () =>
          service.updateCollaboratorRole(ownerId, problemId, {
            userId: inviteeId,
            role: CollaboratorRole.Editor
          })
      },
      {
        name: '제거',
        run: () => service.removeCollaborator(ownerId, problemId, inviteeId)
      }
    ]

    for (const action of actions) {
      it(`${action.name}: 만들당 조건으로 조회하고 대상이 없으면 차단한다`, async () => {
        db.problem.findUnique.resolves(null)

        await expect(action.run()).to.be.rejectedWith(EntityNotExistException)

        expect(db.problem.findUnique.calledOnce).to.equal(true)
        expect(db.problem.findUnique.firstCall.args[0].where).to.deep.equal({
          id: problemId,
          creationMode: ProblemCreationMode.Mandeuldang
        })
        expectNoWrites()
      })
    }
  })

  describe('Owner 보호', () => {
    for (const role of [CollaboratorRole.Editor, CollaboratorRole.Reviewer]) {
      it(`Owner를 ${role}로 변경할 수 없다`, async () => {
        await expect(
          service.updateCollaboratorRole(ownerId, problemId, {
            userId: ownerId,
            role
          })
        ).to.be.rejectedWith(
          UnprocessableDataException,
          'Cannot change the owner role'
        )

        expectNoWrites()
      })
    }

    it('Owner를 제거할 수 없다', async () => {
      await expect(
        service.removeCollaborator(ownerId, problemId, ownerId)
      ).to.be.rejectedWith(
        UnprocessableDataException,
        'Cannot remove the owner'
      )

      expectNoWrites()
    })
  })

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
      CollaboratorStatus.Pending,
      CollaboratorStatus.Rejected
    ]) {
      it(`Owner가 ${status} 목록과 초대 정보를 조회한다`, async () => {
        const user = {
          id: inviteeId,
          username: 'invitee',
          email: inviteInput.userEmail
        }
        const metadata = {
          role: CollaboratorRole.Reviewer,
          status,
          invitedBy: { id: editorId, username: 'editor' },
          invitedAt: new Date('2026-09-01T00:00:00Z'),
          approvedAt:
            status === CollaboratorStatus.Approved
              ? new Date('2026-09-02T00:00:00Z')
              : null,
          createTime: new Date('2026-09-01T00:00:00Z')
        }
        db.mandeuldangCollaborator.findMany.resolves([{ user, ...metadata }])

        const result = await service.getCollaboratorsByStatus(
          ownerId,
          problemId,
          status
        )

        expect(result).to.deep.equal([{ ...user, ...metadata }])
        expect(db.mandeuldangCollaborator.findMany.calledOnce).to.equal(true)
        const query = db.mandeuldangCollaborator.findMany.firstCall.args[0]
        expect(query.where).to.deep.equal({ problemId, status })
        expect(query.select).to.deep.equal({
          role: true,
          status: true,
          createTime: true,
          invitedAt: true,
          approvedAt: true,
          invitedBy: { select: { id: true, username: true } },
          user: { select: { username: true, id: true, email: true } }
        })
        expect(db.mandeuldangCollaborator.findFirst.called).to.equal(false)
        expectNoWrites()
      })
    }

    it('기존 데이터의 없는 초대 정보는 null로 반환한다', async () => {
      const user = { id: ownerId, username: 'owner', email: 'owner@test.com' }
      const metadata = {
        role: CollaboratorRole.Owner,
        status: CollaboratorStatus.Approved,
        invitedBy: null,
        invitedAt: null,
        approvedAt: null,
        createTime: new Date('2026-09-01T00:00:00Z')
      }
      db.mandeuldangCollaborator.findMany.resolves([{ user, ...metadata }])
      const result = await service.getCollaboratorsByStatus(
        ownerId,
        problemId,
        CollaboratorStatus.Approved
      )
      expect(result).to.deep.equal([{ ...user, ...metadata }])
      expectNoWrites()
    })

    for (const role of [CollaboratorRole.Editor, CollaboratorRole.Reviewer]) {
      const requesterId =
        role === CollaboratorRole.Editor ? editorId : reviewerId
      it(`Approved ${role}는 활성 참여자 목록을 조회한다`, async () => {
        // Prisma의 승인 상태·역할 필터를 만족하는 조회 결과를 모의한다.
        db.mandeuldangCollaborator.findFirst.resolves({ id: 200 })
        db.mandeuldangCollaborator.findMany.resolves([])
        const result = await service.getCollaboratorsByStatus(
          requesterId,
          problemId,
          CollaboratorStatus.Approved
        )
        expect(result).to.deep.equal([])
        expect(db.mandeuldangCollaborator.findFirst.calledOnce).to.equal(true)
        expect(
          db.mandeuldangCollaborator.findFirst.firstCall.args[0].where
        ).to.deep.equal({
          problemId,
          userId: requesterId,
          status: CollaboratorStatus.Approved,
          role: { in: [CollaboratorRole.Editor, CollaboratorRole.Reviewer] }
        })
        expect(db.mandeuldangCollaborator.findMany.calledOnce).to.equal(true)
        expect(
          db.mandeuldangCollaborator.findMany.firstCall.args[0].where
        ).to.deep.equal({
          problemId,
          status: CollaboratorStatus.Approved
        })
        expectNoWrites()
      })

      for (const status of [
        CollaboratorStatus.Pending,
        CollaboratorStatus.Rejected
      ]) {
        it(`${role}는 ${status} 목록을 조회할 수 없다`, async () => {
          db.mandeuldangCollaborator.findFirst.resolves({ id: 200 })
          await expect(
            service.getCollaboratorsByStatus(requesterId, problemId, status)
          ).to.be.rejectedWith(ForbiddenAccessException)
          expect(db.mandeuldangCollaborator.findMany.called).to.equal(false)
          expectNoWrites()
        })
      }
    }

    it('승인된 참여자 조회 조건에 맞는 사용자가 없으면 차단한다', async () => {
      db.mandeuldangCollaborator.findFirst.resolves(null)
      await expect(
        service.getCollaboratorsByStatus(
          inviteeId,
          problemId,
          CollaboratorStatus.Approved
        )
      ).to.be.rejectedWith(ForbiddenAccessException)
      expect(
        db.mandeuldangCollaborator.findFirst.firstCall.args[0].where
      ).to.deep.equal({
        problemId,
        userId: inviteeId,
        status: CollaboratorStatus.Approved,
        role: { in: [CollaboratorRole.Editor, CollaboratorRole.Reviewer] }
      })
      expect(db.mandeuldangCollaborator.findMany.called).to.equal(false)
      expectNoWrites()
    })
  })

  describe('updateCollaboratorRole', () => {
    for (const status of [
      CollaboratorStatus.Pending,
      CollaboratorStatus.Approved
    ]) {
      for (const role of [CollaboratorRole.Editor, CollaboratorRole.Reviewer]) {
        it(`Owner가 ${status} 협업자를 ${role}로 변경하고 상태와 시각은 유지한다`, async () => {
          const existing = {
            ...collaborator,
            status,
            role:
              role === CollaboratorRole.Editor
                ? CollaboratorRole.Reviewer
                : CollaboratorRole.Editor,
            approvedAt:
              status === CollaboratorStatus.Approved
                ? new Date('2026-09-02T00:00:00Z')
                : null
          }
          db.mandeuldangCollaborator.findFirst.resolves(existing)
          db.mandeuldangCollaborator.update.callsFake(async ({ data }) => ({
            ...existing,
            ...data
          }))

          const result = await service.updateCollaboratorRole(
            ownerId,
            problemId,
            {
              userId: inviteeId,
              role
            }
          )

          expect(result).to.deep.equal({ ...existing, role })
          expect(db.mandeuldangCollaborator.update.calledOnce).to.equal(true)
          expect(
            db.mandeuldangCollaborator.update.firstCall.args[0]
          ).to.deep.equal({
            where: {
              id: collaborator.id,
              status: { not: CollaboratorStatus.Rejected }
            },
            data: { role }
          })
          expect(db.mandeuldangCollaborator.create.called).to.equal(false)
          expect(db.mandeuldangCollaborator.delete.called).to.equal(false)
        })
      }
    }

    it('Rejected 협업자의 역할은 변경할 수 없다', async () => {
      db.mandeuldangCollaborator.findFirst.resolves({
        ...collaborator,
        status: CollaboratorStatus.Rejected
      })
      await expect(
        service.updateCollaboratorRole(ownerId, problemId, {
          userId: inviteeId,
          role: CollaboratorRole.Editor
        })
      ).to.be.rejectedWith(
        UnprocessableDataException,
        'Cannot change the role of a rejected collaborator'
      )
      expectNoWrites()
    })

    for (const requesterId of [editorId, reviewerId]) {
      it(`Owner가 아닌 사용자 ${requesterId}는 역할을 변경할 수 없다`, async () => {
        await expect(
          service.updateCollaboratorRole(requesterId, problemId, {
            userId: inviteeId,
            role: CollaboratorRole.Editor
          })
        ).to.be.rejectedWith(ForbiddenAccessException)
        expectNoWrites()
      })
    }

    it('Owner 역할을 부여할 수 없다', async () => {
      await expect(
        service.updateCollaboratorRole(ownerId, problemId, {
          userId: inviteeId,
          role: CollaboratorRole.Owner
        })
      ).to.be.rejectedWith(
        UnprocessableDataException,
        'Cannot assign Owner role'
      )
      expectNoWrites()
    })

    it('대상 협업자가 없으면 변경하지 않는다', async () => {
      db.mandeuldangCollaborator.findFirst.resolves(null)
      await expect(
        service.updateCollaboratorRole(ownerId, problemId, {
          userId: inviteeId,
          role: CollaboratorRole.Editor
        })
      ).to.be.rejectedWith(EntityNotExistException)
      expectNoWrites()
    })

    it('그 외 DB 오류는 그대로 전달한다', async () => {
      const error = new Error('Unexpected database failure')
      db.mandeuldangCollaborator.findFirst.resolves(collaborator)
      db.mandeuldangCollaborator.update.rejects(error)
      await expect(
        service.updateCollaboratorRole(ownerId, problemId, {
          userId: inviteeId,
          role: CollaboratorRole.Editor
        })
      ).to.be.rejectedWith(Error, error.message)
    })
  })
})
