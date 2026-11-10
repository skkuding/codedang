import { BadRequestException, ForbiddenException } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { CheckResultStatus, Language, Prisma, Role } from '@prisma/client'
import { expect } from 'chai'
import { stub } from 'sinon'
import type { CheckAMQPService } from '@libs/amqp'
import { AuthenticatedUser } from '@libs/auth'
import {
  EntityNotExistException,
  UnprocessableDataException
} from '@libs/exception'
import {
  PrismaService,
  PrismaTestService,
  type FlatTransactionClient
} from '@libs/prisma'
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

describe('CheckService assignment targets', () => {
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
    const savedAssignmentIds = () =>
      prisma.checkRequest.create.firstCall.args[0].data.assignments.create.map(
        ({ assignmentId }: { assignmentId: number }) => assignmentId
      )
    return { service, prisma, publish, savedAssignmentIds }
  }

  it('links a single assignment and publishes the saved record', async () => {
    const { service, prisma, publish, savedAssignmentIds } = createService()
    stub(service, 'validateAssignment').resolves()
    stub(service, 'validateRequest').resolves()
    const record = {
      id: 1,
      assignments: [{ checkRequestId: 1, assignmentId: 10 }],
      ...checkInput
    }
    prisma.checkRequest.create.resolves(record)
    await service.checkAssignmentProblem({
      user: leader,
      checkInput,
      assignmentId: 10,
      problemId: 1,
      groupId: 1
    })
    expect(savedAssignmentIds()).to.deep.equal([10])
    expect(
      prisma.checkRequest.create.firstCall.args[0].data
    ).not.to.have.property('assignmentId')
    expect(publish.publishCheckRequestMessage.firstCall.args[0]).to.deep.equal({
      check: record
    })
  })

  it('deduplicates multiple assignment IDs before saving', async () => {
    const { service, prisma, savedAssignmentIds } = createService()
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
    expect(savedAssignmentIds()).to.deep.equal([10, 11])
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

  it('does not publish a request when a target assignment does not exist', async () => {
    const { service, prisma, publish } = createService()
    stub(service, 'validateRequest').resolves()
    prisma.checkRequest.create.rejects(
      new Prisma.PrismaClientKnownRequestError('Foreign key violation', {
        code: 'P2003',
        clientVersion: Prisma.prismaVersion.client,
        meta: {
          constraint: 'check_request_assignment_assignment_id_fkey'
        }
      })
    )
    await expect(
      service.checkProblem({
        userId: 1,
        checkInput,
        problemId: 1,
        idOptions: { assignmentIds: [10, 11] }
      })
    ).to.be.rejectedWith(EntityNotExistException)
    expect(publish.publishCheckRequestMessage.called).to.equal(false)
  })

  it('links no assignments for contest requests', async () => {
    const { service, prisma, savedAssignmentIds } = createService()
    stub(service, 'validateRequest').resolves()
    prisma.checkRequest.create.resolves({ id: 1 })
    await service.checkProblem({
      userId: 1,
      checkInput,
      problemId: 1,
      idOptions: { contestId: 3 }
    })
    expect(savedAssignmentIds()).to.deep.equal([])
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
})

describe('CheckService group scope', () => {
  let groupOneAssignment: number
  let groupTwoAssignment: number
  let service: CheckService
  let prisma: PrismaTestService
  let transaction: FlatTransactionClient

  before(async () => {
    const module = await Test.createTestingModule({
      providers: [
        CheckService,
        PrismaTestService,
        { provide: PrismaService, useExisting: PrismaTestService },
        {
          provide: CheckPublicationService,
          useValue: { publishCheckRequestMessage: stub().resolves() }
        }
      ]
    }).compile()
    service = module.get(CheckService)
    prisma = module.get(PrismaTestService)
    const firstAssignmentOf = async (groupId: number) =>
      (await prisma.assignment.findFirstOrThrow({ where: { groupId } })).id
    groupOneAssignment = await firstAssignmentOf(1)
    groupTwoAssignment = await firstAssignmentOf(2)
  })

  beforeEach(async () => {
    transaction = await prisma.$begin()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(service as any).prisma = transaction
    stub(service, 'validateRequest').resolves()
  })

  afterEach(async () => {
    await transaction.$rollback()
    ;(service.validateRequest as unknown as { restore: () => void }).restore()
  })

  after(async () => {
    await prisma.$disconnect()
  })

  const request = (assignmentIds: number[], problemId = 1) =>
    service.checkProblem({
      userId: 1,
      checkInput,
      problemId,
      idOptions: { assignmentIds }
    })

  it('hides a request that spans another group', async () => {
    const own = await request([groupOneAssignment])
    const crossGroup = await request([groupOneAssignment, groupTwoAssignment])
    const visible = await service.getCheckRequests({
      problemId: 1,
      assignmentId: groupOneAssignment,
      groupId: 1
    })
    expect(visible.map(({ id }) => id))
      .to.include(own.id)
      .and.not.include(crossGroup.id)
  })

  it('rejects an assignment that does not exist', async () => {
    await expect(request([groupOneAssignment, 999999])).to.be.rejectedWith(
      EntityNotExistException
    )
  })

  it('does not report a missing problem as a missing assignment', async () => {
    await expect(request([groupOneAssignment], 999999)).to.be.rejectedWith(
      UnprocessableDataException
    )
  })

  it('deletes every request that includes a deleted assignment', async () => {
    const untouched = await request([groupOneAssignment])
    const spanning = await request([groupOneAssignment, groupTwoAssignment])
    await transaction.assignment.delete({ where: { id: groupTwoAssignment } })
    const remaining = await transaction.checkRequest.findMany({
      where: { id: { in: [untouched.id, spanning.id] } },
      select: { id: true }
    })
    expect(remaining.map(({ id }) => id)).to.deep.equal([untouched.id])
  })
})

describe('CheckPublicationService assignment targets', () => {
  for (const assignmentIds of [[10], [10, 11], []]) {
    it(`publishes ${JSON.stringify(assignmentIds)} without a legacy assignmentId`, async () => {
      const publishCheckRequestMessage = stub().resolves()
      const service = new CheckPublicationService({
        publishCheckRequestMessage
      } as unknown as CheckAMQPService)
      const check = {
        id: 1,
        problemId: 1,
        userId: 1,
        ...checkInput,
        assignments: assignmentIds.map((assignmentId) => ({
          checkRequestId: 1,
          assignmentId
        })),
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
