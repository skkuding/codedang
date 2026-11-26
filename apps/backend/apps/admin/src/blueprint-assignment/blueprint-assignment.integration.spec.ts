import { EventEmitter2 } from '@nestjs/event-emitter'
import { PrismaClient, Role, type Prisma } from '@prisma/client'
import { expect } from 'chai'
import { randomUUID } from 'crypto'
import { restore } from 'sinon'
import { AuthenticatedUser } from '@libs/auth'
import { MAX_DATE } from '@libs/constants'
import type { PrismaService } from '@libs/prisma'
import { AssignmentEventService } from '@admin/assignment/assignment-event.service'
import { BlueprintAccessService } from '@admin/blueprint-course/blueprint-access.service'
import { BlueprintAssignmentService } from './blueprint-assignment.service'
import type { CreateBlueprintAssignmentInput } from './model/blueprint-assignment.input'

const integration = process.env.BLUEPRINT_TEST_DATABASE_URL
  ? describe
  : describe.skip
integration('Blueprint Assignment database transactions', () => {
  const options: Prisma.PrismaClientOptions = process.env
    .BLUEPRINT_TEST_DATABASE_URL
    ? {
        datasources: { db: { url: process.env.BLUEPRINT_TEST_DATABASE_URL } }
      }
    : {}

  const db = new PrismaClient(options)

  const prisma = db as PrismaService

  const emitter = new EventEmitter2()

  const published: { name: string; assignmentId: number; dueTime?: Date }[] = []

  emitter.onAny((name, payload) => {
    published.push({
      name: String(name),
      ...(typeof payload === 'number' ? { assignmentId: payload } : payload)
    })
  })

  const events = new AssignmentEventService(emitter)

  const service = new BlueprintAssignmentService(
    prisma,
    new BlueprintAccessService(prisma),
    events
  )

  let user: AuthenticatedUser

  let courseId: number

  let groups: number[]

  let problemId: number

  let input: CreateBlueprintAssignmentInput

  const getCopy = (id: number) =>
    db.assignment.findUniqueOrThrow({
      where: { id },
      include: { assignmentProblem: true, assignmentRecord: true }
    })

  beforeEach(async () => {
    const tag = randomUUID()
    const owner = await db.user.create({
      data: {
        username: tag,
        email: `${tag}@test.invalid`,
        password: '',
        role: Role.User
      }
    })
    user = new AuthenticatedUser(owner.id, owner.username, owner.role)
    const course = await db.blueprintCourse.create({
      data: {
        courseTitle: tag,
        courseNum: 'CS',
        semester: '2026',
        professor: 'P',
        createdById: owner.id
      }
    })
    courseId = course.id
    groups = []
    for (const classNum of [1, 2]) {
      const group = await db.group.create({
        data: {
          groupName: tag,
          config: {},
          courseInfo: {
            create: {
              courseNum: 'CS',
              classNum,
              semester: '2026',
              professor: 'P',
              blueprintCourseId: courseId
            }
          },
          userGroup: { create: { userId: owner.id, isGroupLeader: true } }
        }
      })
      groups.push(group.id)
    }
    const problem = await db.problem.create({
      data: {
        title: tag,
        description: 'D',
        inputDescription: '',
        outputDescription: '',
        hint: '',
        languages: ['Python3'],
        timeLimit: 1000,
        memoryLimit: 128,
        difficulty: 'Level1',
        source: '',
        visibleLockTime: MAX_DATE,
        createdById: owner.id,
        solution: [{ language: 'Python3', code: 'pass' }]
      }
    })
    problemId = problem.id
    input = {
      operationId: randomUUID(),
      title: 'A',
      description: 'D',
      week: 1,
      isVisible: true,
      isRankVisible: true,
      isJudgeResultVisible: true,
      autoFinalizeScore: false,
      enableCopyPaste: true,
      isExercise: false,
      sections: groups.map((groupId) => ({
        groupId,
        startTime: new Date('2027-01-01'),
        dueTime: new Date('2027-01-02'),
        endTime: new Date('2027-01-03')
      }))
    }
  })

  afterEach(() => restore())

  after(async () => {
    await db.$disconnect()
  })

  const sourceCount = () =>
    db.blueprintAssignment.count({ where: { blueprintCourseId: courseId } })

  const copyCount = () =>
    db.assignment.count({ where: { groupId: { in: groups } } })

  const receiptCount = () =>
    db.blueprintAssignmentSave.count({ where: { blueprintCourseId: courseId } })

  const problemState = () =>
    db.problem.findUniqueOrThrow({
      where: { id: problemId },
      include: { sharedGroups: { orderBy: { id: 'asc' } } }
    })

  it('creates the source, copies and member records, leaving problem import to its own API', async () => {
    const result = await service.save(user, courseId, input)
    expect(result.id).to.be.a('number')
    expect(result.assignment).to.have.length(2)
    expect(result).not.to.have.property('targets')
    expect(await receiptCount()).to.equal(1)
    for (const copy of result.assignment) {
      expect((await getCopy(copy.id)).assignmentRecord).to.have.length(1)
      expect(
        await db.assignmentProblemRecord.count({
          where: { assignmentId: copy.id }
        })
      ).to.equal(0)
      expect(copy.problems).to.have.length(0)
    }
  })

  it('rolls back the source and every earlier section when the second section fails after writing member records', async () => {
    const beforeProblem = await problemState()
    const eventCount = published.length
    let calls = 0
    const query = db.$extends({
      query: {
        assignmentRecord: {
          async createMany({ args, query }) {
            const result = await query(args)
            if (++calls === 2)
              throw new Error('second section failed after record creation')
            return result
          }
        }
      }
    })
    const failing = new BlueprintAssignmentService(
      query as unknown as PrismaService,
      new BlueprintAccessService(prisma),
      events
    )
    await expect(failing.save(user, courseId, input)).to.be.rejectedWith(
      'second section failed'
    )
    expect(calls).to.equal(2)
    expect(await sourceCount()).to.equal(0)
    expect(await copyCount()).to.equal(0)
    expect(await receiptCount()).to.equal(0)
    expect(await problemState()).to.deep.equal(beforeProblem)
    expect(
      await db.assignmentRecord.count({ where: { userId: user.id } })
    ).to.equal(0)
    expect(
      await db.assignmentProblemRecord.count({ where: { userId: user.id } })
    ).to.equal(0)
    expect(
      await db.blueprintAssignmentProblem.count({ where: { problemId } })
    ).to.equal(0)
    expect(published.length).to.equal(eventCount)
    // No partial state remains: resending the complete request is safe.
    const saved = await service.save(user, courseId, input)
    expect(saved.assignment).to.have.length(2)
    expect(await sourceCount()).to.equal(1)
    expect(await receiptCount()).to.equal(1)
  })

  it('rolls back earlier copies when a section fails the membership recheck', async () => {
    const eventCount = published.length
    let checks = 0
    const query = db.$extends({
      query: {
        courseInfo: {
          async findFirst({ args, query }) {
            const section = await query(args)
            return ++checks === 2 ? null : section
          }
        }
      }
    })
    const failing = new BlueprintAssignmentService(
      query as unknown as PrismaService,
      new BlueprintAccessService(prisma),
      events
    )
    await expect(failing.save(user, courseId, input)).to.be.rejectedWith(
      'Section no longer belongs to Blueprint'
    )
    expect(checks).to.equal(2)
    expect(await sourceCount()).to.equal(0)
    expect(await copyCount()).to.equal(0)
    expect(await receiptCount()).to.equal(0)
    expect(
      await db.assignmentRecord.count({ where: { userId: user.id } })
    ).to.equal(0)
    expect(published.length).to.equal(eventCount)
    expect(
      (await service.save(user, courseId, input)).assignment
    ).to.have.length(2)
  })

  it('leaves no content or events if writing the completed-request receipt fails', async () => {
    const beforeProblem = await problemState()
    const eventCount = published.length
    const query = db.$extends({
      query: {
        blueprintAssignmentSave: {
          async create() {
            throw new Error('receipt failed')
          }
        }
      }
    })
    const failing = new BlueprintAssignmentService(
      query as unknown as PrismaService,
      new BlueprintAccessService(prisma),
      events
    )
    await expect(failing.save(user, courseId, input)).to.be.rejectedWith(
      'receipt failed'
    )
    expect(await sourceCount()).to.equal(0)
    expect(await copyCount()).to.equal(0)
    expect(await receiptCount()).to.equal(0)
    expect(await problemState()).to.deep.equal(beforeProblem)
    expect(published.length).to.equal(eventCount)
  })

  it('concurrent duplicate requests create one source and one copy per section', async () => {
    const [first, second] = await Promise.all([
      service.save(user, courseId, input),
      service.save(user, courseId, input)
    ])
    expect(first.id).to.equal(second.id)
    expect(await sourceCount()).to.equal(1)
    expect(await copyCount()).to.equal(2)
    expect(await receiptCount()).to.equal(1)
  })

  it('rejects a changed request with the same operation ID without changing saved content', async () => {
    const saved = await service.save(user, courseId, input)
    const eventCount = published.length
    await expect(
      service.save(user, courseId, { ...input, title: 'Changed' })
    ).to.be.rejectedWith('Operation ID belongs to another request')
    expect(await service.save(user, courseId, input)).to.deep.equal(saved)
    expect(await sourceCount()).to.equal(1)
    expect(await copyCount()).to.equal(2)
    expect(await receiptCount()).to.equal(1)
    expect(published.length).to.equal(eventCount)
  })

  it('rejects operation ID reuse by another authorized section leader', async () => {
    const saved = await service.save(user, courseId, input)
    const tag = randomUUID()
    const leader = await db.user.create({
      data: { username: tag, email: `${tag}@test.invalid`, password: '' }
    })
    await db.userGroup.create({
      data: { userId: leader.id, groupId: groups[0], isGroupLeader: true }
    })
    const eventCount = published.length
    await expect(
      service.save(
        new AuthenticatedUser(leader.id, leader.username, leader.role),
        courseId,
        input
      )
    ).to.be.rejectedWith('Operation ID belongs to another request')
    expect(await service.save(user, courseId, input)).to.deep.equal(saved)
    expect(await sourceCount()).to.equal(1)
    expect(await copyCount()).to.equal(2)
    expect(await receiptCount()).to.equal(1)
    expect(published.length).to.equal(eventCount)
  })

  for (const [label, patch, message] of [
    ['blank title', { title: ' ' }, 'Title must contain 1 to 120 characters'],
    [
      'long title',
      { title: 'A'.repeat(121) },
      'Title must contain 1 to 120 characters'
    ],
    ['blank description', { description: ' ' }, 'Description is required'],
    ['week below range', { week: 0 }, 'Invalid week'],
    ['week above course range', { week: 100 }, 'Invalid week'],
    ['no sections', { sections: [] }, 'Select at least one section']
  ] as const) {
    it(`rejects ${label} without persisting content or events`, async () => {
      const eventCount = published.length
      await expect(
        service.save(user, courseId, {
          ...input,
          ...patch,
          sections: patch.sections ? [...patch.sections] : input.sections
        })
      ).to.be.rejectedWith(message)
      expect(await sourceCount()).to.equal(0)
      expect(await copyCount()).to.equal(0)
      expect(await receiptCount()).to.equal(0)
      expect(published.length).to.equal(eventCount)
    })
  }

  for (const [label, schedule, message] of [
    [
      'start equals end',
      { endTime: new Date('2027-01-01') },
      'The startTime must be earlier than the endTime'
    ],
    [
      'due equals start',
      { dueTime: new Date('2027-01-01') },
      'The startTime must be earlier than the dueTime'
    ],
    [
      'due precedes start',
      { dueTime: new Date('2026-12-31') },
      'The startTime must be earlier than the dueTime'
    ],
    [
      'due exceeds end',
      { dueTime: new Date('2027-01-04') },
      'The dueTime must not be later than the endTime'
    ]
  ] as const) {
    it(`rolls back all sections when ${label}`, async () => {
      const eventCount = published.length
      await expect(
        service.save(user, courseId, {
          ...input,
          sections: [input.sections[0], { ...input.sections[1], ...schedule }]
        })
      ).to.be.rejectedWith(message)
      expect(await sourceCount()).to.equal(0)
      expect(await copyCount()).to.equal(0)
      expect(await receiptCount()).to.equal(0)
      expect(published.length).to.equal(eventCount)
    })
  }

  it('checks access and validates foreign sections, duplicate sections and schedules before saving', async () => {
    const outsider = new AuthenticatedUser(999999, 'outsider', Role.User)
    await expect(service.save(outsider, courseId, input)).to.be.rejected
    await expect(
      service.save(user, courseId, {
        ...input,
        sections: [{ ...input.sections[0], groupId: 999999 }]
      })
    ).to.be.rejected
    await expect(
      service.save(user, courseId, {
        ...input,
        sections: [input.sections[0], input.sections[0]]
      })
    ).to.be.rejected
    await expect(
      service.save(user, courseId, {
        ...input,
        sections: [{ ...input.sections[0], dueTime: new Date('2028-01-01') }]
      })
    ).to.be.rejected
    expect(await sourceCount()).to.equal(0)
    expect(await receiptCount()).to.equal(0)
  })

  it('publishes lifecycle events only after all source and copy writes have committed', async () => {
    const seen: number[] = []
    emitter.on('assignment.created', async (event) => {
      const copy = await getCopy(event.assignmentId)
      expect(
        await db.assignment.count({
          where: { blueprintAssignmentId: copy.blueprintAssignmentId! }
        })
      ).to.equal(2)
      expect(await receiptCount()).to.equal(1)
      seen.push(copy.id)
    })
    try {
      const source = await service.save(user, courseId, input)
      expect(seen).to.deep.equal(source.assignment.map((copy) => copy.id))
    } finally {
      emitter.removeAllListeners('assignment.created')
      emitter.on('assignment.created', () => undefined)
    }
  })

  it('keeps committed content on notification failure without retrying on a duplicate save', async () => {
    const listener = () => {
      throw new Error('notification unavailable')
    }
    emitter.on('assignment.created', listener)
    try {
      const saved = await service.save(user, courseId, input)
      expect(saved.assignment).to.have.length(2)
      const count = published.length
      await service.save(user, courseId, input)
      expect(published.length).to.equal(count)
    } finally {
      emitter.off('assignment.created', listener)
    }
  })

  it('creates each section with its schedule and defaults, honoring explicit per-section false values', async () => {
    const source = await service.save(user, courseId, {
      ...input,
      sections: [
        {
          ...input.sections[0],
          isVisible: false,
          isRankVisible: false,
          isJudgeResultVisible: false,
          isFinalScoreVisible: true
        },
        {
          ...input.sections[1],
          startTime: new Date('2027-02-01'),
          dueTime: null,
          endTime: new Date('2027-02-03')
        }
      ]
    })
    expect(source.assignment[0].isVisible).to.equal(false)
    expect(source.assignment[0].isRankVisible).to.equal(false)
    expect(source.assignment[0].isJudgeResultVisible).to.equal(false)
    expect(source.assignment[0].isFinalScoreVisible).to.equal(true)
    expect(source.assignment[1].isVisible).to.equal(input.isVisible)
    expect(source.assignment[1].isRankVisible).to.equal(input.isRankVisible)
    expect(source.assignment[1].isFinalScoreVisible).to.equal(false)
    expect(source.assignment[1].startTime.toISOString()).to.equal(
      '2027-02-01T00:00:00.000Z'
    )
    expect(source.assignment[1].dueTime).to.equal(null)
  })
})
