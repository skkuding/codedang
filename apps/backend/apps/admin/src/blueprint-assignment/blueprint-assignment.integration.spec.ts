import { EventEmitter2 } from '@nestjs/event-emitter'
import { PrismaClient, Role, type Prisma } from '@prisma/client'
import { expect } from 'chai'
import { randomUUID } from 'crypto'
import { restore } from 'sinon'
import { AuthenticatedUser, type AuthenticatedRequest } from '@libs/auth'
import { MAX_DATE } from '@libs/constants'
import {
  EntityNotExistException,
  UnprocessableDataException
} from '@libs/exception'
import type { PrismaService } from '@libs/prisma'
import { AssignmentEventService } from '@admin/assignment/assignment-event.service'
import { AssignmentProblemService } from '@admin/assignment/assignment-problem.service'
import { AssignmentService } from '@admin/assignment/assignment.service'
import { BlueprintAccessService } from '@admin/blueprint-course/blueprint-access.service'
import { BlueprintAssignmentResolver } from './blueprint-assignment.resolver'
import { BlueprintAssignmentService } from './blueprint-assignment.service'
import type {
  CreateBlueprintAssignmentInput,
  UpdateBlueprintAssignmentInput
} from './model/blueprint-assignment.input'

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

  const assignments = new AssignmentService(prisma, emitter, {} as never)

  const configs = new AssignmentProblemService(prisma)

  let user: AuthenticatedUser

  const resolver = new BlueprintAssignmentResolver(service)
  const request = () => ({ user }) as AuthenticatedRequest

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

  const addProblemFixture = async (
    source: Awaited<ReturnType<typeof service.save>>
  ) => {
    await db.$transaction(async (tx) => {
      await tx.blueprintAssignmentProblem.create({
        data: {
          blueprintAssignmentId: source.id,
          problemId,
          order: 0,
          score: 10
        }
      })
      for (const [index, copy] of source.assignment.entries()) {
        await tx.assignmentProblem.create({
          data: {
            assignmentId: copy.id,
            problemId,
            order: 0,
            score: 10,
            solutionReleaseTime: new Date(`2027-01-0${index + 2}`)
          }
        })
        await tx.assignmentProblemRecord.create({
          data: {
            assignmentId: copy.id,
            problemId,
            userId: user.id
          }
        })
      }
      await tx.problem.update({
        where: { id: problemId },
        data: {
          sharedGroups: {
            connect: source.assignment.map((copy) => ({ id: copy.groupId }))
          },
          visibleLockTime: new Date(
            Math.max(...source.assignment.map((copy) => Number(copy.endTime)))
          )
        }
      })
    })
  }

  const editedInput = (): UpdateBlueprintAssignmentInput => ({
    operationId: randomUUID(),
    expectedRevision: 1,
    title: 'Updated',
    description: input.description,
    week: input.week,
    enableCopyPaste: input.enableCopyPaste,
    autoFinalizeScore: input.autoFinalizeScore,
    isExercise: input.isExercise,
    sections: input.sections
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

  const snapshot = async (id: number) => ({
    source: await service.getAssignment(user, courseId, id),
    problem: await problemState(),
    records: await db.assignmentProblemRecord.findMany({
      where: {
        assignmentId: {
          in: (
            await db.assignment.findMany({
              where: { blueprintAssignmentId: id }
            })
          ).map((copy) => copy.id)
        }
      },
      orderBy: [
        { assignmentId: 'asc' },
        { userId: 'asc' },
        { problemId: 'asc' }
      ]
    }),
    receipts: await receiptCount(),
    events: published.length
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

  it('rolls back an edit of the source, all copies, schedules, problems, grades and queued events', async () => {
    const source = await service.save(user, courseId, input)
    await addProblemFixture(source)
    await db.assignmentProblemRecord.updateMany({
      where: { userId: user.id },
      data: { finalScore: 7, comment: 'keep' }
    })
    const before = await snapshot(source.id)
    let calls = 0
    const query = db.$extends({
      query: {
        assignment: {
          async update({ args, query }) {
            const copy = await query(args)
            if (++calls === 2)
              throw new Error('second edit failed after copy update')
            return copy
          }
        }
      }
    })
    const failing = new BlueprintAssignmentService(
      query as unknown as PrismaService,
      new BlueprintAccessService(prisma),
      events
    )
    const edit = {
      ...editedInput(),
      sections: input.sections.map((section) => ({
        ...section,
        dueTime: null,
        endTime: new Date('2027-02-01')
      }))
    }
    await expect(
      failing.save(user, courseId, edit, source.id)
    ).to.be.rejectedWith('second edit failed')
    expect(calls).to.equal(2)
    expect(await snapshot(source.id)).to.deep.equal(before)
    const saved = await service.save(user, courseId, edit, source.id)
    expect(saved.revision).to.equal(2)
    for (const copy of saved.assignment) {
      expect(copy.title).to.equal('Updated')
      expect(copy.dueTime).to.equal(null)
      expect(copy.problems[0].score).to.equal(10)
    }
    expect(
      (
        await db.assignmentProblemRecord.findMany({
          where: { userId: user.id }
        })
      ).every((record) => Number(record.finalScore) === 7)
    ).to.equal(true)
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

  it('does not restore unlinked copies or reapply an older completed request', async () => {
    const source = await service.save(user, courseId, input)
    const unlinked = source.assignment[0]
    await service.unlink(unlinked.groupId, unlinked.id)
    const latest = await service.save(
      user,
      courseId,
      { ...editedInput(), sections: [input.sections[1]] },
      source.id
    )
    const duplicate = await service.save(user, courseId, input)
    expect(duplicate.id).to.equal(source.id)
    expect(duplicate.title).to.equal(latest.title)
    expect(duplicate.assignment).to.have.length(1)
    expect((await getCopy(unlinked.id)).blueprintAssignmentId).to.equal(null)
    expect((await getCopy(unlinked.id)).title).to.equal('A')
  })

  it('rejects changed request IDs, stale revisions and edit target reselection without writing', async () => {
    const source = await service.save(user, courseId, input)
    const before = await snapshot(source.id)
    await expect(service.save(user, courseId, { ...input, title: 'Different' }))
      .to.be.rejected
    await expect(
      service.save(
        user,
        courseId,
        { ...editedInput(), expectedRevision: 99 },
        source.id
      )
    ).to.be.rejected
    await expect(
      service.save(
        user,
        courseId,
        { ...editedInput(), sections: [{ groupId: 999999 }] },
        source.id
      )
    ).to.be.rejected
    expect(await snapshot(source.id)).to.deep.equal(before)
  })

  it('serializes concurrent edits so the same expected revision cannot be applied twice', async () => {
    const source = await service.save(user, courseId, input)
    const results = await Promise.allSettled([
      service.save(user, courseId, editedInput(), source.id),
      service.save(
        user,
        courseId,
        { ...editedInput(), title: 'Other' },
        source.id
      )
    ])
    expect(
      results.filter((result) => result.status === 'fulfilled')
    ).to.have.length(1)
    expect(
      results.filter((result) => result.status === 'rejected')
    ).to.have.length(1)
    expect(
      (await service.getAssignment(user, courseId, source.id)).revision
    ).to.equal(2)
  })

  it('keeps the explicit unlink requirement on all linked content write paths', async () => {
    const source = await service.save(user, courseId, input)
    const copy = source.assignment[0]
    await expect(
      assignments.updateAssignment(copy.groupId, {
        id: copy.id,
        title: 'Local'
      })
    ).to.be.rejected
    await expect(
      assignments.importProblemsToAssignment(copy.groupId, copy.id, [])
    ).to.be.rejected
    await expect(
      assignments.removeProblemsFromAssignment(copy.groupId, copy.id, [
        problemId
      ])
    ).to.be.rejected
    await expect(
      configs.updateAssignmentProblems(copy.groupId, copy.id, [
        { problemId, score: 100 }
      ])
    ).to.be.rejected
    await expect(
      configs.updateAssignmentProblemsOrder(copy.groupId, copy.id, [problemId])
    ).to.be.rejected
    await service.unlink(copy.groupId, copy.id)
    expect((await getCopy(copy.id)).blueprintAssignmentId).to.equal(null)
  })

  it('updates and clears section solution release time without unlinking or changing other copies', async () => {
    const source = await service.save(user, courseId, input)
    await addProblemFixture(source)
    const [target, other] = source.assignment
    const original = await getCopy(other.id)
    const solutionReleaseTime = new Date('2027-01-04')
    await configs.updateAssignmentProblems(target.groupId, target.id, [
      { problemId, solutionReleaseTime }
    ])
    let copy = await getCopy(target.id)
    expect(copy.blueprintAssignmentId).to.equal(source.id)
    expect(copy.assignmentProblem[0].solutionReleaseTime).to.deep.equal(
      solutionReleaseTime
    )
    expect(copy.assignmentProblem[0].score).to.equal(
      original.assignmentProblem[0].score
    )
    expect((await getCopy(other.id)).assignmentProblem).to.deep.equal(
      original.assignmentProblem
    )
    await expect(
      configs.updateAssignmentProblems(target.groupId, target.id, [
        { problemId, solutionReleaseTime: null, score: 200 }
      ])
    ).to.be.rejectedWith(UnprocessableDataException)
    expect(
      (await getCopy(target.id)).assignmentProblem[0].solutionReleaseTime
    ).to.deep.equal(solutionReleaseTime)
    await configs.updateAssignmentProblems(target.groupId, target.id, [
      { problemId, solutionReleaseTime: null }
    ])
    copy = await getCopy(target.id)
    expect(copy.assignmentProblem[0].solutionReleaseTime).to.equal(null)
    expect(copy.blueprintAssignmentId).to.equal(source.id)
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

  const invalidInputs: [string, Record<string, unknown>, string][] = [
    ...['title', 'description', 'week', 'sections'].map(
      (key): [string, Record<string, unknown>, string] => [
        `missing ${key}`,
        { [key]: undefined },
        'Create requires content and section schedules'
      ]
    ),
    ...[
      'isVisible',
      'isRankVisible',
      'isJudgeResultVisible',
      'enableCopyPaste',
      'autoFinalizeScore',
      'isExercise'
    ].map((key): [string, Record<string, unknown>, string] => [
      `invalid ${key}`,
      { [key]: 'true' },
      `${key} must be a boolean`
    ]),
    ['null sections', { sections: null }, 'sections must be an array'],
    ['object sections', { sections: {} }, 'sections must be an array']
  ]
  for (const [label, patch, message] of invalidInputs) {
    it(`defensively rejects ${label} without writes or events`, async () => {
      const eventCount = published.length
      // Bypass GraphQL coercion deliberately to verify the service boundary.
      const invalid = { ...input, ...patch } as CreateBlueprintAssignmentInput
      await expect(service.save(user, courseId, invalid)).to.be.rejectedWith(
        message
      )
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

  it('retains searchable, paginated Assignment and Exercise reads', async () => {
    await service.save(user, courseId, {
      ...input,
      title: 'First'
    })
    const newer = await service.save(user, courseId, {
      ...input,
      operationId: randomUUID(),
      title: 'Newest'
    })
    await service.save(user, courseId, {
      ...input,
      operationId: randomUUID(),
      isExercise: true
    })
    const page = await resolver.getBlueprintAssignments(
      request(),
      courseId,
      false,
      1
    )
    expect(page[0].id).to.equal(newer.id)
    expect(
      (
        await resolver.getBlueprintAssignments(
          request(),
          courseId,
          false,
          1,
          page[0].id
        )
      )[0].title
    ).to.equal('First')
    expect(
      (
        await resolver.getBlueprintAssignments(
          request(),
          courseId,
          false,
          10,
          undefined,
          'NEW'
        )
      )[0].title
    ).to.equal('Newest')
    expect(await service.getAssignments(user, courseId, true)).to.have.length(1)
    expect(await service.getAssignments(user, courseId)).to.deep.equal(
      await service.getAssignments(user, courseId, false)
    )
  })

  it('rejects invalid page sizes and missing assignment IDs', async () => {
    for (const take of [0, 101, 1.5])
      await expect(
        service.getAssignments(user, courseId, false, take)
      ).to.be.rejectedWith(
        UnprocessableDataException,
        'take must be between 1 and 100'
      )
    await expect(
      resolver.getBlueprintAssignment(request(), 2147483647)
    ).to.be.rejectedWith(
      EntityNotExistException,
      'BlueprintAssignment does not exist'
    )
  })

  it('saves title changes without waiting for an unrelated problem row lock', async () => {
    const source = await service.save(user, courseId, input)
    await addProblemFixture(source)
    let started!: () => void
    let release!: () => void
    const locked = new Promise<void>((resolve) => {
      started = resolve
    })
    const released = new Promise<void>((resolve) => {
      release = resolve
    })
    const holder = db.$transaction(
      async (tx) => {
        await tx.$queryRaw`SELECT id FROM problem WHERE id = ${problemId} FOR UPDATE`
        started()
        await released
      },
      { timeout: 10000 }
    )
    await locked
    const save = resolver.updateBlueprintAssignment(request(), source.id, {
      operationId: randomUUID(),
      expectedRevision: source.revision,
      title: 'Only title'
    })
    let timer: ReturnType<typeof setTimeout> | undefined
    try {
      const completed = await Promise.race([
        save.then(() => true),
        new Promise<boolean>((resolve) => {
          timer = setTimeout(() => resolve(false), 2000)
        })
      ])
      expect(completed).to.equal(true)
    } finally {
      clearTimeout(timer)
      release()
      await holder
      await save
    }
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

  it('never writes problem composition or problem records during Assignment Create or Edit', async () => {
    const query = db.$extends({
      query: {
        $allModels: {
          async $allOperations({ model, operation, args, query }) {
            if (
              [
                'BlueprintAssignmentProblem',
                'AssignmentProblem',
                'AssignmentProblemRecord'
              ].includes(model) &&
              [
                'create',
                'createMany',
                'update',
                'updateMany',
                'delete',
                'deleteMany',
                'upsert'
              ].includes(operation)
            ) {
              throw new Error(
                `Assignment CRUD must not write ${model}.${operation}`
              )
            }
            return query(args)
          }
        }
      }
    })
    const isolated = new BlueprintAssignmentService(
      query as unknown as PrismaService,
      new BlueprintAccessService(prisma),
      events
    )
    const source = await isolated.save(user, courseId, input)
    expect(source.blueprintAssignmentProblem).to.have.length(0)
    await addProblemFixture(source)
    const before = await service.getAssignment(user, courseId, source.id)
    const records = await db.assignmentProblemRecord.findMany({
      where: { userId: user.id }
    })
    const updated = await isolated.save(
      user,
      courseId,
      {
        ...editedInput(),
        sections: input.sections.map((section) => ({
          ...section,
          dueTime: null,
          endTime: new Date('2027-02-01')
        }))
      },
      source.id
    )
    expect(updated.blueprintAssignmentProblem).to.deep.equal(
      before.blueprintAssignmentProblem
    )
    for (const [index, copy] of updated.assignment.entries()) {
      expect(copy.problems).to.deep.equal(before.assignment[index].problems)
      expect(copy.title).to.equal('Updated')
    }
    expect(
      await db.assignmentProblemRecord.findMany({ where: { userId: user.id } })
    ).to.deep.equal(records)
    expect((await problemState()).visibleLockTime.toISOString()).to.equal(
      '2027-02-01T00:00:00.000Z'
    )
  })

  it('reads Problem-owned rows in details without recomputing or changing per-section release times', async () => {
    const source = await service.save(user, courseId, input)
    await addProblemFixture(source)
    const detail = await resolver.getBlueprintAssignment(request(), source.id)
    expect(
      detail.blueprintAssignmentProblem.map(
        ({ problemId: id, score, order }) => ({
          id,
          score,
          order
        })
      )
    ).to.deep.equal([{ id: problemId, score: 10, order: 0 }])
    expect(
      detail.assignment.map((copy) =>
        copy.problems[0].solutionReleaseTime?.toISOString()
      )
    ).to.deep.equal(['2027-01-02T00:00:00.000Z', '2027-01-03T00:00:00.000Z'])
    expect(
      await db.blueprintAssignmentProblem.count({
        where: { blueprintAssignmentId: source.id }
      })
    ).to.equal(1)
  })

  const settingsOnlyInput = (
    revision: number,
    sections: UpdateBlueprintAssignmentInput['sections']
  ): UpdateBlueprintAssignmentInput => ({
    operationId: randomUUID(),
    expectedRevision: revision,
    sections
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

  it('preserves different section settings on a common-only save and never touches solution release times', async () => {
    const source = await service.save(user, courseId, input)
    await addProblemFixture(source)
    await service.save(
      user,
      courseId,
      settingsOnlyInput(1, [
        {
          groupId: groups[0],
          isVisible: false,
          isFinalScoreVisible: true,
          isRankVisible: false,
          isJudgeResultVisible: false,
          dueTime: null
        },
        {
          groupId: groups[1],
          startTime: new Date('2027-02-01'),
          dueTime: null,
          endTime: new Date('2027-02-03')
        }
      ]),
      source.id
    )
    const before = await service.getAssignment(user, courseId, source.id)
    const updated = await service.save(
      user,
      courseId,
      { operationId: randomUUID(), expectedRevision: 2, title: 'Common title' },
      source.id
    )
    for (const [index, copy] of updated.assignment.entries()) {
      const previous = before.assignment[index]
      expect(copy.title).to.equal('Common title')
      for (const key of [
        'startTime',
        'dueTime',
        'endTime',
        'isVisible',
        'isFinalScoreVisible',
        'isRankVisible',
        'isJudgeResultVisible'
      ] as const) {
        expect(copy[key]).to.deep.equal(previous[key])
      }
      expect(copy.problems).to.deep.equal(previous.problems)
    }
  })

  it('updates only the specified section settings, preserving other copies and every Link', async () => {
    const source = await service.save(user, courseId, input)
    const before = await getCopy(source.assignment[1].id)
    const updated = await service.save(
      user,
      courseId,
      settingsOnlyInput(1, [
        {
          groupId: groups[0],
          dueTime: null,
          isVisible: false,
          isFinalScoreVisible: true,
          isRankVisible: false,
          isJudgeResultVisible: false
        }
      ]),
      source.id
    )
    expect(updated.assignment[0].dueTime).to.equal(null)
    expect(updated.assignment[0].isVisible).to.equal(false)
    expect(updated.assignment[0].isFinalScoreVisible).to.equal(true)
    expect(await getCopy(source.assignment[1].id)).to.deep.equal(before)
    for (const copy of updated.assignment)
      expect((await getCopy(copy.id)).blueprintAssignmentId).to.equal(source.id)
  })

  it('allows linked section settings through the existing updateAssignment API without Unlink', async () => {
    const source = await service.save(user, courseId, input)
    await addProblemFixture(source)
    const target = source.assignment[0]
    const other = await getCopy(source.assignment[1].id)
    const before = await getCopy(target.id)
    await assignments.updateAssignment(target.groupId, {
      id: target.id,
      dueTime: null,
      isVisible: false,
      isFinalScoreVisible: true,
      isRankVisible: false,
      isJudgeResultVisible: false
    })
    const copy = await getCopy(target.id)
    expect(copy.blueprintAssignmentId).to.equal(source.id)
    expect(copy.dueTime).to.equal(null)
    expect(copy.isVisible).to.equal(false)
    expect(copy.isFinalScoreVisible).to.equal(true)
    expect(copy.isRankVisible).to.equal(false)
    expect(copy.isJudgeResultVisible).to.equal(false)
    expect(copy.assignmentProblem).to.deep.equal(before.assignmentProblem)
    expect(await getCopy(other.id)).to.deep.equal(other)
    await expect(
      assignments.updateAssignment(target.groupId, {
        id: target.id,
        title: 'Common edit',
        isVisible: true
      })
    ).to.be.rejected
    expect((await getCopy(target.id)).isVisible).to.equal(false)
  })

  it('rejects invalid or null settings atomically for both Blueprint Edit and linked local Edit', async () => {
    const source = await service.save(user, courseId, input)
    const before = await snapshot(source.id)
    const invalidPatches = [
      { groupId: groups[0], isVisible: null },
      { groupId: groups[0], startTime: null },
      { groupId: groups[0], dueTime: new Date('2026-01-01') },
      { groupId: groups[0], dueTime: new Date('2028-01-01') }
    ]
    for (const patch of invalidPatches) {
      await expect(
        service.save(
          user,
          courseId,
          settingsOnlyInput(1, [patch as never]),
          source.id
        )
      ).to.be.rejected
    }
    await expect(
      assignments.updateAssignment(groups[0], {
        id: source.assignment[0].id,
        isVisible: null
      } as never)
    ).to.be.rejected
    expect(await snapshot(source.id)).to.deep.equal(before)
  })

  it('cannot add a new target or update settings of an unlinked copy', async () => {
    const source = await service.save(user, courseId, input)
    const newSection = await db.group.create({
      data: {
        groupName: 'Later section',
        config: {},
        courseInfo: {
          create: {
            blueprintCourseId: courseId,
            classNum: 3,
            courseNum: 'CS',
            semester: '2026',
            professor: 'P'
          }
        }
      }
    })
    await expect(
      service.save(
        user,
        courseId,
        settingsOnlyInput(1, [{ groupId: newSection.id, isVisible: false }]),
        source.id
      )
    ).to.be.rejected
    const target = source.assignment[0]
    await service.unlink(target.groupId, target.id)
    await expect(
      service.save(
        user,
        courseId,
        settingsOnlyInput(1, [{ groupId: target.groupId, isVisible: false }]),
        source.id
      )
    ).to.be.rejected
    expect((await getCopy(target.id)).blueprintAssignmentId).to.equal(null)
    expect(
      await db.assignment.count({ where: { groupId: newSection.id } })
    ).to.equal(0)
  })

  it('rolls back every copy and queued grade event when a later section setting is invalid', async () => {
    const source = await service.save(user, courseId, input)
    const before = await snapshot(source.id)
    await expect(
      service.save(
        user,
        courseId,
        {
          ...settingsOnlyInput(1, [
            {
              groupId: groups[0],
              isVisible: false,
              isFinalScoreVisible: true,
              dueTime: null
            },
            { groupId: groups[1], endTime: new Date('2026-01-01') }
          ]),
          title: 'Must roll back'
        },
        source.id
      )
    ).to.be.rejected
    expect(await snapshot(source.id)).to.deep.equal(before)
  })

  it('publishes grades once on false-to-true transitions and refreshes reminders when clearing dueTime', async () => {
    const source = await service.save(user, courseId, input)
    const copy = source.assignment[0]
    await service.save(
      user,
      courseId,
      settingsOnlyInput(1, [
        { groupId: copy.groupId, dueTime: null, isFinalScoreVisible: true }
      ]),
      source.id
    )
    expect(
      published.filter(
        (event) =>
          event.assignmentId === copy.id && event.name === 'assignment.graded'
      ).length
    ).to.equal(1)
    const reminder = published.find(
      (event) =>
        event.assignmentId === copy.id && event.name === 'assignment.updated'
    )!
    expect(reminder.dueTime?.getTime()).to.equal(copy.endTime.getTime())
    await service.save(
      user,
      courseId,
      settingsOnlyInput(2, [
        { groupId: copy.groupId, isFinalScoreVisible: true }
      ]),
      source.id
    )
    expect(
      published.filter(
        (event) =>
          event.assignmentId === copy.id && event.name === 'assignment.graded'
      ).length
    ).to.equal(1)
    await assignments.updateAssignment(copy.groupId, {
      id: copy.id,
      isFinalScoreVisible: false
    })
    expect((await getCopy(copy.id)).isFinalScoreVisible).to.equal(false)
    expect(
      published.filter(
        (event) =>
          event.assignmentId === copy.id && event.name === 'assignment.graded'
      ).length
    ).to.equal(1)
    await assignments.updateAssignment(copy.groupId, {
      id: copy.id,
      isFinalScoreVisible: true
    })
    expect(
      published.filter(
        (event) =>
          event.assignmentId === copy.id && event.name === 'assignment.graded'
      ).length
    ).to.equal(2)
  })

  it('rejects changing the assignment type or setting visibility outside a section without writes', async () => {
    const source = await service.save(user, courseId, input)
    const before = await snapshot(source.id)
    for (const [patch, message] of [
      [{ isExercise: true }, 'Assignment type cannot change'],
      ...['isVisible', 'isRankVisible', 'isJudgeResultVisible'].map(
        (key) => [{ [key]: false }, `${key} must be set per section`] as const
      )
    ] as const) {
      await expect(
        service.updateAssignmentById(user, source.id, {
          operationId: randomUUID(),
          expectedRevision: source.revision,
          ...patch
        })
      ).to.be.rejectedWith(UnprocessableDataException, message)
      expect(await snapshot(source.id)).to.deep.equal(before)
    }
  })

  it('unlinks through the resolver, keeps repeated Unlink idempotent and rejects missing assignments', async () => {
    const source = await service.save(user, courseId, input)
    const copy = source.assignment[0]
    const other = await getCopy(source.assignment[1].id)
    const first = await resolver.unlinkBlueprintAssignment(
      copy.groupId,
      copy.id
    )
    expect(first.blueprintAssignmentId).to.equal(null)
    expect(
      await resolver.unlinkBlueprintAssignment(copy.groupId, copy.id)
    ).to.deep.equal(first)
    await expect(
      resolver.unlinkBlueprintAssignment(copy.groupId, 2147483647)
    ).to.be.rejectedWith(EntityNotExistException, 'Assignment does not exist')
    expect(await getCopy(other.id)).to.deep.equal(other)
    expect(
      (await service.getAssignmentById(user, source.id)).assignment.map(
        ({ id }) => id
      )
    ).to.deep.equal([other.id])
  })

  it('refreshes problem visibility when a linked section changes endTime and preserves the Link', async () => {
    const source = await service.save(user, courseId, input)
    await addProblemFixture(source)
    const copy = source.assignment[0]
    const other = await getCopy(source.assignment[1].id)
    const before = await getCopy(copy.id)
    const endTime = new Date('2027-03-01')
    await assignments.updateAssignment(copy.groupId, { id: copy.id, endTime })
    const updated = await getCopy(copy.id)
    expect(updated.endTime).to.deep.equal(endTime)
    expect(updated.blueprintAssignmentId).to.equal(source.id)
    expect(updated.assignmentProblem).to.deep.equal(before.assignmentProblem)
    expect(
      (await db.problem.findUniqueOrThrow({ where: { id: problemId } }))
        .visibleLockTime
    ).to.deep.equal(endTime)
    expect(await getCopy(other.id)).to.deep.equal(other)
    await assignments.updateAssignment(copy.groupId, { id: copy.id, endTime })
    expect(await getCopy(copy.id)).to.deep.equal(updated)
  })

  it('rejects an old Blueprint save after a local section edit and accepts a refreshed revision', async () => {
    const source = await service.save(user, courseId, input)
    const copy = source.assignment[0]
    const dueTime = new Date('2027-01-02T12:00:00Z')
    await assignments.updateAssignment(copy.groupId, { id: copy.id, dueTime })
    const before = await snapshot(source.id)
    expect(before.source.revision).to.equal(source.revision + 1)
    expect((await getCopy(copy.id)).blueprintAssignmentId).to.equal(source.id)
    await expect(
      service.updateAssignmentById(user, source.id, {
        operationId: randomUUID(),
        expectedRevision: source.revision,
        title: 'Stale edit',
        sections: input.sections
      })
    ).to.be.rejectedWith(UnprocessableDataException, 'STALE_REVISION')
    expect(await snapshot(source.id)).to.deep.equal(before)
    const saved = await service.updateAssignmentById(user, source.id, {
      operationId: randomUUID(),
      expectedRevision: before.source.revision,
      title: 'Refreshed edit',
      sections: [{ groupId: copy.groupId, dueTime }]
    })
    expect(saved.title).to.equal('Refreshed edit')
    expect((await getCopy(copy.id)).dueTime).to.deep.equal(dueTime)
  })

  it('increments the Blueprint revision for local visibility changes but not no-op or failed edits', async () => {
    const source = await service.save(user, courseId, input)
    const copy = source.assignment[0]
    await assignments.updateAssignment(copy.groupId, {
      id: copy.id,
      isVisible: !copy.isVisible
    })
    const before = await snapshot(source.id)
    expect(before.source.revision).to.equal(source.revision + 1)
    await assignments.updateAssignment(copy.groupId, {
      id: copy.id,
      isVisible: !copy.isVisible,
      startTime: new Date(copy.startTime),
      endTime: new Date(copy.endTime),
      dueTime: copy.dueTime
    })
    expect(await snapshot(source.id)).to.deep.equal(before)
    await expect(
      assignments.updateAssignment(copy.groupId, {
        id: copy.id,
        isVisible: copy.isVisible,
        endTime: new Date('2026-01-01')
      })
    ).to.be.rejectedWith(UnprocessableDataException)
    expect(await snapshot(source.id)).to.deep.equal(before)
  })

  it('does not change the Blueprint revision when editing an unlinked assignment', async () => {
    const source = await service.save(user, courseId, input)
    const copy = source.assignment[0]
    await service.unlink(copy.groupId, copy.id)
    const before = await snapshot(source.id)
    await assignments.updateAssignment(copy.groupId, {
      id: copy.id,
      isVisible: !copy.isVisible
    })
    expect((await getCopy(copy.id)).isVisible).to.equal(!copy.isVisible)
    expect((await getCopy(copy.id)).blueprintAssignmentId).to.equal(null)
    expect(await snapshot(source.id)).to.deep.equal(before)
  })
})
