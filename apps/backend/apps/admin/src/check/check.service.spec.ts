import { BadRequestException, ForbiddenException } from '@nestjs/common'
import {
  CheckResultStatus,
  Language,
  Role,
  type CheckRequest
} from '@prisma/client'
import { expect } from 'chai'
import { stub } from 'sinon'
import type { CheckAMQPService } from '@libs/amqp'
import { AuthenticatedUser } from '@libs/auth'
import { EntityNotExistException } from '@libs/exception'
import type { PrismaService } from '@libs/prisma'
import { CheckPublicationService } from './check-pub.service'
import { CheckService } from './check.service'

const admin = new AuthenticatedUser(1, 'admin', Role.Admin)
const leader = new AuthenticatedUser(2, 'leader', Role.User)
const manager = new AuthenticatedUser(3, 'manager', Role.Manager)
const superAdmin = new AuthenticatedUser(4, 'superAdmin', Role.SuperAdmin)
const checkInput = {
  language: Language.Python3,
  minTokens: 12,
  enableMerging: false,
  useJplagClustering: true
}

describe('CheckService assignment arrays', () => {
  const createService = () => {
    const prisma = {
      assignment: { findMany: stub().resolves([{ id: 10 }, { id: 11 }]) },
      checkRequest: { findMany: stub(), create: stub() },
      submission: { findMany: stub() }
    }
    const publish = { publishCheckRequestMessage: stub().resolves() }
    const service = new CheckService(
      prisma as unknown as PrismaService,
      publish as unknown as CheckPublicationService
    )
    return { service, prisma, publish }
  }

  it('stores a single assignment as an array and publishes the saved record', async () => {
    const { service, prisma, publish } = createService()
    stub(service, 'validateAssignment').resolves()
    stub(service, 'validateRequest').resolves()
    const record = { id: 1, assignmentIds: [10], ...checkInput }
    prisma.checkRequest.create.resolves(record)
    await service.checkAssignmentProblem({
      user: leader,
      checkInput,
      assignmentId: 10,
      problemId: 1,
      groupId: 1
    })
    expect(
      prisma.checkRequest.create.firstCall.args[0].data.assignmentIds
    ).to.deep.equal([10])
    expect(
      prisma.checkRequest.create.firstCall.args[0].data
    ).not.to.have.property('assignmentId')
    expect(publish.publishCheckRequestMessage.firstCall.args[0]).to.deep.equal({
      check: record
    })
  })

  it('deduplicates multiple assignment IDs before saving', async () => {
    const { service, prisma } = createService()
    stub(service, 'validateAssignments').resolves()
    stub(service, 'validateRequest').resolves()
    prisma.checkRequest.create.resolves({ id: 1 })
    await service.checkAssignmentsProblem({
      user: admin,
      checkInput,
      problemId: 1,
      targets: [
        { assignmentId: 10, groupId: 1 },
        { assignmentId: 11, groupId: 1 },
        { assignmentId: 10, groupId: 1 }
      ]
    })
    expect(
      prisma.checkRequest.create.firstCall.args[0].data.assignmentIds
    ).to.deep.equal([10, 11])
  })

  for (const [role, user] of [
    ['User', leader],
    ['Manager', manager]
  ] as const) {
    it(`forbids ${role} from requesting a multi-assignment check`, async () => {
      const { service, prisma } = createService()
      const validateAssignments = stub(
        service,
        'validateAssignments'
      ).resolves()
      await expect(
        service.checkAssignmentsProblem({
          user,
          checkInput,
          problemId: 1,
          targets: [{ assignmentId: 10, groupId: 1 }]
        })
      ).to.be.rejectedWith(ForbiddenException)
      expect(validateAssignments.called).to.equal(false)
      expect(prisma.checkRequest.create.called).to.equal(false)
    })
  }

  it('allows SuperAdmin to request a multi-assignment check', async () => {
    const { service, prisma } = createService()
    stub(service, 'validateAssignments').resolves()
    stub(service, 'validateRequest').resolves()
    prisma.checkRequest.create.resolves({ id: 1 })
    await service.checkAssignmentsProblem({
      user: superAdmin,
      checkInput,
      problemId: 1,
      targets: [{ assignmentId: 10, groupId: 1 }]
    })
    expect(prisma.checkRequest.create.calledOnce).to.equal(true)
  })

  it('counts distinct users only within the requested assignments', async () => {
    const { service, prisma } = createService()
    prisma.submission.findMany.resolves([{ userId: 1 }, { userId: 2 }])
    await service.validateRequest({
      problemId: 1,
      language: Language.Python3,
      assignmentIds: [10, 11]
    })
    const args = prisma.submission.findMany.firstCall.args[0]
    expect(args.where.assignmentId).to.deep.equal({ in: [10, 11] })
    expect(args.where.userId).to.deep.equal({ not: null })
    expect(args.distinct).to.deep.equal(['userId'])
  })

  it('rejects a request when fewer than two users submitted', async () => {
    const { service, prisma } = createService()
    prisma.submission.findMany.resolves([{ userId: 1 }])
    await expect(
      service.validateRequest({
        problemId: 1,
        language: Language.Python3,
        assignmentIds: [10, 11]
      })
    ).to.be.rejectedWith(EntityNotExistException)
  })

  it('rejects empty targets before creating a request', async () => {
    const { service, prisma } = createService()
    await expect(
      service.checkAssignmentsProblem({
        user: admin,
        checkInput,
        problemId: 1,
        targets: []
      })
    ).to.be.rejectedWith(BadRequestException)
    expect(prisma.checkRequest.create.called).to.equal(false)
  })

  it('excludes cross-group and deleted targets from the requested group scope', async () => {
    const { service, prisma } = createService()
    prisma.checkRequest.findMany.onFirstCall().resolves([
      { id: 1, assignmentIds: [10] },
      { id: 2, assignmentIds: [10, 11] },
      { id: 3, assignmentIds: [10, 99] }
    ])
    prisma.checkRequest.findMany.onSecondCall().resolves([])
    await service.getCheckRequests({
      problemId: 1,
      assignmentId: 10,
      groupId: 1
    })
    expect(
      prisma.checkRequest.findMany.secondCall.args[0].where.AND[0]
    ).to.deep.equal({ id: { in: [1, 2] } })
  })
})

describe('CheckPublicationService assignment arrays', () => {
  for (const assignmentIds of [[10], [10, 11], []]) {
    it(`publishes ${JSON.stringify(assignmentIds)} without a legacy assignmentId`, async () => {
      const publishCheckRequestMessage = stub().resolves()
      const service = new CheckPublicationService({
        publishCheckRequestMessage
      } as unknown as CheckAMQPService)
      const check: CheckRequest = {
        id: 1,
        problemId: 1,
        userId: 1,
        ...checkInput,
        assignmentIds,
        contestId: assignmentIds.length === 0 ? 3 : null,
        workbookId: null,
        createTime: new Date(),
        result: CheckResultStatus.Pending
      }
      await service.publishCheckRequestMessage({ check })
      const message = publishCheckRequestMessage.firstCall.args[1]
      expect(message.assignmentIds).to.deep.equal(assignmentIds)
      expect(message).not.to.have.property('assignmentId')
      expect(message.contestId).to.equal(check.contestId)
    })
  }
})
