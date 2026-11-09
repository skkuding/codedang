import { BadRequestException } from '@nestjs/common'
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
import type { PrismaService } from '@libs/prisma'
import { CheckPublicationService } from './check-pub.service'
import { CheckService } from './check.service'

const admin = new AuthenticatedUser(1, 'admin', Role.Admin)
const leader = new AuthenticatedUser(2, 'leader', Role.User)
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
      checkRequest: { findMany: stub(), create: stub() }
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
