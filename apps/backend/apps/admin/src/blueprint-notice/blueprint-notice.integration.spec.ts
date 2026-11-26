import { ApolloDriver } from '@nestjs/apollo'
import { ValidationPipe, type INestApplication } from '@nestjs/common'
import { GraphQLModule } from '@nestjs/graphql'
import { Test } from '@nestjs/testing'
import { PrismaClient, Role, type Prisma } from '@prisma/client'
import { expect } from 'chai'
import { randomUUID } from 'crypto'
import { AuthenticatedUser, GroupLeaderGuard } from '@libs/auth'
import {
  AdminExceptionFilter,
  apolloErrorFormatter,
  ForbiddenAccessException,
  UnprocessableDataException
} from '@libs/exception'
import type { PrismaService } from '@libs/prisma'
import { BlueprintAccessService } from '@admin/blueprint-course/blueprint-access.service'
import { CourseNoticeService } from '@admin/group/group.service'
import { BlueprintNoticeResolver } from './blueprint-notice.resolver'
import { BlueprintNoticeService } from './blueprint-notice.service'
import type {
  CreateBlueprintNoticeInput,
  UpdateBlueprintNoticeInput
} from './model/blueprint-notice.input'

const integration = process.env.BLUEPRINT_TEST_DATABASE_URL
  ? describe
  : describe.skip

integration('Blueprint Notice database transactions', () => {
  const options: Prisma.PrismaClientOptions = process.env
    .BLUEPRINT_TEST_DATABASE_URL
    ? {
        datasources: { db: { url: process.env.BLUEPRINT_TEST_DATABASE_URL } }
      }
    : {}

  const db = new PrismaClient(options)

  const prisma = db as PrismaService

  const service = new BlueprintNoticeService(
    prisma,
    new BlueprintAccessService(prisma)
  )

  const sectionNotices = new CourseNoticeService(prisma)

  let user: AuthenticatedUser

  let courseId: number

  let groups: number[]

  let input: CreateBlueprintNoticeInput

  let app: INestApplication

  let graphqlUrl: string

  const createUser = async () => {
    const tag = randomUUID()
    const created = await db.user.create({
      data: {
        username: tag,
        email: `${tag}@test.invalid`,
        password: '',
        role: Role.User
      }
    })
    return new AuthenticatedUser(created.id, created.username, created.role)
  }

  const createSection = (
    blueprintCourseId: number,
    classNum: number,
    leaderId: number
  ) =>
    db.group.create({
      data: {
        groupName: `section-${classNum}`,
        config: {},
        courseInfo: {
          create: {
            courseNum: 'CS',
            classNum,
            semester: '2026',
            professor: 'P',
            blueprintCourseId
          }
        },
        userGroup: { create: { userId: leaderId, isGroupLeader: true } }
      }
    })

  const createBlueprint = (createdById: number) =>
    db.blueprintCourse.create({
      data: {
        courseTitle: randomUUID(),
        courseNum: 'CS',
        semester: '2026',
        professor: 'P',
        createdById
      }
    })

  const sourceCount = () =>
    db.blueprintNotice.count({ where: { blueprintCourseId: courseId } })

  const copyCount = () =>
    db.courseNotice.count({ where: { groupId: { in: groups } } })

  const receiptCount = () =>
    db.blueprintNoticeSave.count({ where: { blueprintCourseId: courseId } })

  const counts = async () => ({
    sources: await sourceCount(),
    copies: await copyCount(),
    receipts: await receiptCount()
  })

  before(async () => {
    // Real GraphQL transport, validation and error formatting.
    // The identity is a fixture; JWT verification and GroupLeaderGuard are tested elsewhere.
    const module = await Test.createTestingModule({
      imports: [
        GraphQLModule.forRoot({
          driver: ApolloDriver,
          autoSchemaFile: true,
          context: () => ({ req: { user } }),
          formatError: apolloErrorFormatter
        })
      ],
      providers: [
        BlueprintNoticeResolver,
        { provide: BlueprintNoticeService, useValue: service }
      ]
    })
      // GroupLeaderGuard is covered by its own tests; identity is a fixture here.
      .overrideGuard(GroupLeaderGuard)
      .useValue({ canActivate: () => true })
      .compile()
    app = module.createNestApplication()
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }))
    app.useGlobalFilters(new AdminExceptionFilter())
    await app.listen(0, '127.0.0.1')
    graphqlUrl = (await app.getUrl()) + '/graphql'
  })

  const graphql = async (
    query: string,
    variables: Record<string, unknown> = {}
  ) => {
    const response = await fetch(graphqlUrl, {
      method: 'POST',
      headers: new Headers([['content-type', 'application/json']]),
      body: JSON.stringify({ query, variables })
    })
    return response.json() as Promise<{
      data?: Record<
        string,
        {
          id: string
          title: string
          revision: number
          courseNotice: {
            id: string
            groupId: number
            isPublic: boolean
            isFixed: boolean
          }[]
        }
      > | null
      errors?: { message: string; extensions?: { code?: string } }[]
    }>
  }

  beforeEach(async () => {
    user = await createUser()
    courseId = (await createBlueprint(user.id)).id
    groups = []
    for (const classNum of [1, 2])
      groups.push((await createSection(courseId, classNum, user.id)).id)
    input = {
      operationId: randomUUID(),
      title: 'Midterm exam notice',
      content: '<p>October 20</p>',
      // Copies are created in groupId order even for unsorted input.
      sectionGroupIds: [...groups].reverse()
    }
  })

  after(async () => {
    if (app) await app.close()
    await db.$disconnect()
  })

  it('creates the source, one public unpinned copy per section and a receipt', async () => {
    const result = await service.createNotice(user, courseId, input)

    expect(result.revision).to.equal(1)
    expect(result.createdById).to.equal(user.id)
    expect(result.courseNotice.map(({ groupId }) => groupId)).to.deep.equal(
      groups
    )
    for (const copy of result.courseNotice) {
      expect(copy).to.include({
        title: input.title,
        content: input.content,
        isPublic: true,
        isFixed: false,
        createdById: user.id,
        blueprintNoticeId: result.id
      })
      expect(copy.readBy).to.deep.equal([])
    }
    expect(await counts()).to.deep.equal({ sources: 1, copies: 2, receipts: 1 })
    expect(await service.getNoticeById(user, result.id)).to.deep.equal(result)
  })

  it('returns the saved result for a repeated request without creating again', async () => {
    const first = await service.createNotice(user, courseId, input)
    const second = await service.createNotice(user, courseId, input)

    expect(second).to.deep.equal(first)
    expect(await counts()).to.deep.equal({ sources: 1, copies: 2, receipts: 1 })
  })

  it('creates one source and one copy per section for concurrent duplicate requests', async () => {
    const results = await Promise.all(
      [1, 2, 3].map(() => service.createNotice(user, courseId, input))
    )

    expect(new Set(results.map(({ id }) => id)).size).to.equal(1)
    expect(await counts()).to.deep.equal({ sources: 1, copies: 2, receipts: 1 })
  })

  it('rejects a changed request with the same operation ID without changing saved content', async () => {
    const first = await service.createNotice(user, courseId, input)

    await expect(
      service.createNotice(user, courseId, { ...input, title: 'Changed' })
    ).to.be.rejectedWith(
      UnprocessableDataException,
      'Operation ID belongs to another request'
    )
    expect(await service.getNoticeById(user, first.id)).to.deep.equal(first)
    expect(await counts()).to.deep.equal({ sources: 1, copies: 2, receipts: 1 })
  })

  it('rejects operation ID reuse by another authorized section leader', async () => {
    await service.createNotice(user, courseId, input)
    const assistant = await createUser()
    await db.userGroup.create({
      data: { userId: assistant.id, groupId: groups[0], isGroupLeader: true }
    })

    await expect(
      service.createNotice(assistant, courseId, input)
    ).to.be.rejectedWith(
      UnprocessableDataException,
      'Operation ID belongs to another request'
    )
    expect(await counts()).to.deep.equal({ sources: 1, copies: 2, receipts: 1 })
  })

  it('leaves no source or copies if writing the receipt fails, and the request can be resent', async () => {
    const query = db.$extends({
      query: {
        blueprintNoticeSave: {
          async create() {
            throw new Error('receipt write failed')
          }
        }
      }
    })
    const failing = new BlueprintNoticeService(
      query as unknown as PrismaService,
      new BlueprintAccessService(prisma)
    )

    await expect(
      failing.createNotice(user, courseId, input)
    ).to.be.rejectedWith('receipt write failed')
    expect(await counts()).to.deep.equal({ sources: 0, copies: 0, receipts: 0 })

    const saved = await service.createNotice(user, courseId, input)
    expect(saved.courseNotice).to.have.length(2)
    expect(await counts()).to.deep.equal({ sources: 1, copies: 2, receipts: 1 })
  })

  it('rejects a section of another blueprint without writing anything', async () => {
    const other = await createBlueprint(user.id)
    const foreign = await createSection(other.id, 1, user.id)

    await expect(
      service.createNotice(user, courseId, {
        ...input,
        sectionGroupIds: [groups[0], foreign.id]
      })
    ).to.be.rejectedWith(
      UnprocessableDataException,
      'All sections must belong to this Blueprint'
    )
    expect(await counts()).to.deep.equal({ sources: 0, copies: 0, receipts: 0 })
    expect(
      await db.courseNotice.count({ where: { groupId: foreign.id } })
    ).to.equal(0)
  })

  it('lets a leader of any section create and read, and rejects others', async () => {
    const assistant = await createUser()
    await db.userGroup.create({
      data: { userId: assistant.id, groupId: groups[1], isGroupLeader: true }
    })
    const created = await service.createNotice(assistant, courseId, input)
    expect(created.courseNotice).to.have.length(2)
    expect(await service.getNoticeById(assistant, created.id)).to.deep.equal(
      created
    )

    const outsider = await createUser()
    await expect(
      service.createNotice(outsider, courseId, {
        ...input,
        operationId: randomUUID()
      })
    ).to.be.rejectedWith(ForbiddenAccessException)
    await expect(service.getNotices(outsider, courseId)).to.be.rejectedWith(
      ForbiddenAccessException
    )
    await expect(
      service.getNoticeById(outsider, created.id)
    ).to.be.rejectedWith(ForbiddenAccessException)
  })

  it('lists only this blueprint, newest first, with cursor pagination and title search', async () => {
    const created: number[] = []
    for (const title of ['Week 1 notice', 'Exam notice', 'Week 2 notice'])
      created.push(
        (
          await service.createNotice(user, courseId, {
            ...input,
            operationId: randomUUID(),
            title
          })
        ).id
      )
    const other = await createBlueprint(user.id)
    const otherSection = await createSection(other.id, 1, user.id)
    await service.createNotice(user, other.id, {
      ...input,
      operationId: randomUUID(),
      sectionGroupIds: [otherSection.id]
    })

    const firstPage = await service.getNotices(user, courseId, 2)
    expect(firstPage.map(({ id }) => id)).to.deep.equal([
      created[2],
      created[1]
    ])
    const secondPage = await service.getNotices(
      user,
      courseId,
      2,
      firstPage[1].id
    )
    expect(secondPage.map(({ id }) => id)).to.deep.equal([created[0]])

    const searched = await service.getNotices(
      user,
      courseId,
      10,
      undefined,
      'WEEK'
    )
    expect(searched.map(({ id }) => id)).to.deep.equal([created[2], created[0]])
  })

  it('serves create and read through GraphQL and rejects invalid input before the service', async () => {
    const create = `mutation ($id: Int!, $input: CreateBlueprintNoticeInput!) {
      createBlueprintNotice(blueprintCourseId: $id, input: $input) {
        id title revision courseNotice { id groupId isPublic isFixed }
      }
    }`
    const created = await graphql(create, { id: courseId, input })
    expect(created.errors).to.equal(undefined)
    const notice = created.data!.createBlueprintNotice
    expect(notice.revision).to.equal(1)
    expect(notice.courseNotice.map(({ groupId }) => groupId)).to.deep.equal(
      groups
    )

    const read = await graphql(
      `
        query ($id: Int!) {
          getBlueprintNotice(blueprintNoticeId: $id) {
            id
            title
            courseNotice {
              groupId
            }
          }
        }
      `,
      { id: Number(notice.id) }
    )
    expect(read.errors).to.equal(undefined)
    expect(read.data!.getBlueprintNotice.title).to.equal(input.title)

    const list = `query ($id: Int!, $take: Int!, $search: String) {
      getBlueprintNotices(blueprintCourseId: $id, take: $take, search: $search) {
        id title courseNotice { groupId }
      }
    }`
    const listed = (await graphql(list, {
      id: courseId,
      take: 10,
      search: 'MIDTERM'
    })) as unknown as {
      data?: { getBlueprintNotices: { id: string; title: string }[] }
      errors?: unknown
    }
    expect(listed.errors).to.equal(undefined)
    expect(listed.data!.getBlueprintNotices).to.deep.equal([
      {
        id: notice.id,
        title: input.title,
        courseNotice: groups.map((groupId) => ({ groupId }))
      }
    ])
    const tooMany = await graphql(list, { id: courseId, take: 101 })
    expect(tooMany.errors?.[0].extensions?.code).to.equal('UNPROCESSABLE')

    const invalid = await graphql(create, {
      id: courseId,
      input: { ...input, operationId: randomUUID(), title: '   ' }
    })
    expect(invalid.errors?.[0].extensions?.code).to.equal('BAD_REQUEST')
    expect(await sourceCount()).to.equal(1)

    const missing = await graphql(`
      query {
        getBlueprintNotice(blueprintNoticeId: 2147483647) {
          id
        }
      }
    `)
    expect(missing.errors?.[0].extensions?.code).to.equal('NOT_FOUND')
  })

  describe('update and unlink', () => {
    const edit = (
      expectedRevision: number,
      change: Omit<
        UpdateBlueprintNoticeInput,
        'operationId' | 'expectedRevision'
      >
    ): UpdateBlueprintNoticeInput => ({
      operationId: randomUUID(),
      expectedRevision,
      ...change
    })

    const copiesOf = () =>
      db.courseNotice.findMany({
        where: { groupId: { in: groups } },
        orderBy: { groupId: 'asc' }
      })

    it('syncs title and content to linked copies only, keeping section settings', async () => {
      const created = await service.createNotice(user, courseId, input)
      const [linked, detached] = created.courseNotice
      await service.unlink(detached.groupId, detached.id)
      await sectionNotices.updateCourseNotice(linked.groupId, linked.id, {
        isFixed: true,
        isPublic: false
      })

      const updated = await service.updateNotice(
        user,
        created.id,
        edit(1, { title: 'Updated', content: '<p>updated</p>' })
      )

      expect(updated.revision).to.equal(2)
      expect(updated.title).to.equal('Updated')
      expect(updated.courseNotice.map(({ id }) => id)).to.deep.equal([
        linked.id
      ])
      const [linkedRow, detachedRow] = await copiesOf()
      expect(linkedRow).to.include({
        title: 'Updated',
        content: '<p>updated</p>',
        isFixed: true,
        isPublic: false,
        blueprintNoticeId: created.id
      })
      expect(detachedRow).to.include({
        title: input.title,
        content: input.content,
        blueprintNoticeId: null
      })
    })

    it('resets read records only when the content actually changes', async () => {
      const created = await service.createNotice(user, courseId, input)
      await db.courseNotice.updateMany({
        where: { blueprintNoticeId: created.id },
        data: { readBy: [user.id] }
      })

      await service.updateNotice(
        user,
        created.id,
        edit(1, { title: input.title, content: input.content })
      )
      for (const copy of await copiesOf())
        expect(copy.readBy).to.deep.equal([user.id])

      await service.updateNotice(user, created.id, edit(2, { title: 'New' }))
      for (const copy of await copiesOf()) expect(copy.readBy).to.deep.equal([])
    })

    it('rejects a stale revision without changing the source or copies', async () => {
      const created = await service.createNotice(user, courseId, input)
      await service.updateNotice(user, created.id, edit(1, { title: 'First' }))
      const before = await service.getNoticeById(user, created.id)

      await expect(
        service.updateNotice(user, created.id, edit(1, { title: 'Stale' }))
      ).to.be.rejectedWith(UnprocessableDataException, 'STALE_REVISION')
      expect(await service.getNoticeById(user, created.id)).to.deep.equal(
        before
      )
    })

    it('returns the saved state for a repeated update without applying it twice', async () => {
      const created = await service.createNotice(user, courseId, input)
      const request = edit(1, { title: 'Once' })

      const first = await service.updateNotice(user, created.id, request)
      const second = await service.updateNotice(user, created.id, request)

      expect(second).to.deep.equal(first)
      expect(second.revision).to.equal(2)
      expect(await receiptCount()).to.equal(2)
    })

    it('rolls back the source when syncing the copies fails', async () => {
      const created = await service.createNotice(user, courseId, input)
      const before = await service.getNoticeById(user, created.id)
      const query = db.$extends({
        query: {
          courseNotice: {
            async updateMany({ args, query }) {
              await query(args)
              throw new Error('copy sync failed')
            }
          }
        }
      })
      const failing = new BlueprintNoticeService(
        query as unknown as PrismaService,
        new BlueprintAccessService(prisma)
      )
      const request = edit(1, { title: 'Lost' })

      await expect(
        failing.updateNotice(user, created.id, request)
      ).to.be.rejectedWith('copy sync failed')
      expect(await service.getNoticeById(user, created.id)).to.deep.equal(
        before
      )
      expect(await receiptCount()).to.equal(1)

      // Nothing was recorded, so the same request can be resent.
      const saved = await service.updateNotice(user, created.id, request)
      expect(saved.title).to.equal('Lost')
    })

    it('requires unlink before a section edits the content of a copy', async () => {
      const created = await service.createNotice(user, courseId, input)
      const [copy] = created.courseNotice

      await expect(
        sectionNotices.updateCourseNotice(copy.groupId, copy.id, {
          title: 'Section edit'
        })
      ).to.be.rejectedWith(
        UnprocessableDataException,
        'Confirm unlinkBlueprintNotice'
      )

      const unlinked = await service.unlink(copy.groupId, copy.id)
      expect(unlinked).to.deep.equal({
        id: copy.id,
        groupId: copy.groupId,
        blueprintNoticeId: null
      })
      // Unlink is idempotent.
      expect(await service.unlink(copy.groupId, copy.id)).to.deep.equal(
        unlinked
      )

      await sectionNotices.updateCourseNotice(copy.groupId, copy.id, {
        title: 'Section edit'
      })
      await service.updateNotice(user, created.id, edit(1, { title: 'Source' }))
      const [row] = await copiesOf()
      expect(row.title).to.equal('Section edit')
    })

    it('rejects unlinking a notice through another section', async () => {
      const created = await service.createNotice(user, courseId, input)
      const [copy] = created.courseNotice
      const otherGroup = groups.find((id) => id !== copy.groupId)!

      await expect(service.unlink(otherGroup, copy.id)).to.be.rejectedWith(
        'CourseNotice'
      )
      expect(
        (await db.courseNotice.findUniqueOrThrow({ where: { id: copy.id } }))
          .blueprintNoticeId
      ).to.equal(created.id)
    })

    it('serializes a concurrent update and unlink without losing either', async () => {
      const created = await service.createNotice(user, courseId, input)
      const [linked, detached] = created.courseNotice

      await Promise.all([
        service.updateNotice(user, created.id, edit(1, { title: 'Race' })),
        service.unlink(detached.groupId, detached.id)
      ])

      const [linkedRow, detachedRow] = await copiesOf()
      expect(linkedRow).to.include({ id: linked.id, title: 'Race' })
      expect(detachedRow.blueprintNoticeId).to.equal(null)
      // Either order is valid; the copy is never half-updated.
      expect([input.title, 'Race']).to.include(detachedRow.title)
      expect((await service.getNoticeById(user, created.id)).revision).to.equal(
        2
      )
    })

    it('serves update and unlink through GraphQL', async () => {
      const created = await service.createNotice(user, courseId, input)
      const update = `mutation ($id: Int!, $input: UpdateBlueprintNoticeInput!) {
        updateBlueprintNotice(blueprintNoticeId: $id, input: $input) {
          id title revision courseNotice { id groupId }
        }
      }`

      const updated = await graphql(update, {
        id: created.id,
        input: edit(1, { title: 'Via GraphQL' })
      })
      expect(updated.errors).to.equal(undefined)
      expect(updated.data!.updateBlueprintNotice).to.include({
        title: 'Via GraphQL',
        revision: 2
      })

      const nullTitle = await graphql(update, {
        id: created.id,
        input: { ...edit(2, {}), title: null }
      })
      expect(nullTitle.errors?.[0].extensions?.code).to.equal('BAD_REQUEST')

      const [copy] = created.courseNotice
      const unlinked = await graphql(
        `
          mutation ($groupId: Int!, $id: Int!) {
            unlinkBlueprintNotice(groupId: $groupId, courseNoticeId: $id) {
              id
              groupId
              blueprintNoticeId
            }
          }
        `,
        { groupId: copy.groupId, id: copy.id }
      )
      expect(unlinked.errors).to.equal(undefined)
      expect(unlinked.data!.unlinkBlueprintNotice).to.deep.include({
        groupId: copy.groupId,
        blueprintNoticeId: null
      })
    })
  })

  describe('delete', () => {
    const createMany = async (count: number) => {
      const created: Awaited<ReturnType<typeof service.createNotice>>[] = []
      for (let index = 0; index < count; index++)
        created.push(
          await service.createNotice(user, courseId, {
            ...input,
            operationId: randomUUID(),
            title: `Notice ${index}`
          })
        )
      return created
    }

    const addComments = async (courseNoticeId: number) => {
      const visible = await db.courseNoticeComment.create({
        data: { courseNoticeId, createdById: user.id, content: 'visible' }
      })
      await db.courseNoticeComment.create({
        data: {
          courseNoticeId,
          createdById: user.id,
          content: 'reply',
          replyOnId: visible.id
        }
      })
      await db.courseNoticeComment.create({
        data: {
          courseNoticeId,
          createdById: user.id,
          content: 'removed',
          isDeleted: true
        }
      })
    }

    const commentCount = () =>
      db.courseNoticeComment.count({
        where: { courseNotice: { groupId: { in: groups } } }
      })

    it('reports the impact and deletes selected sources, linked copies and their comments', async () => {
      const [first, second, kept] = await createMany(3)
      await addComments(first.courseNotice[0].id)
      await addComments(second.courseNotice[1].id)
      await addComments(kept.courseNotice[0].id)
      const ids = [second.id, first.id]

      expect(
        await service.getDeletionImpact(user, courseId, ids)
      ).to.deep.equal({
        noticeCount: 2,
        copyCount: 4,
        sectionCount: 2,
        commentCount: 4
      })

      const deleted = await service.deleteNotices(user, courseId, ids)

      expect(deleted.map(({ id }) => id)).to.deep.equal([second.id, first.id])
      expect(deleted[0].courseNotice).to.have.length(2)
      expect(await sourceCount()).to.equal(1)
      expect(await copyCount()).to.equal(2)
      expect(await commentCount()).to.equal(3)
      expect(
        await db.courseNotice.count({ where: { blueprintNoticeId: kept.id } })
      ).to.equal(2)
    })

    it('keeps unlinked copies and success receipts', async () => {
      const created = await service.createNotice(user, courseId, input)
      const [detached] = created.courseNotice
      await service.unlink(detached.groupId, detached.id)

      expect(
        (await service.getDeletionImpact(user, courseId, [created.id]))
          .copyCount
      ).to.equal(1)
      await service.deleteNotices(user, courseId, [created.id])

      expect(await sourceCount()).to.equal(0)
      expect(
        await db.courseNotice.findMany({ where: { groupId: { in: groups } } })
      ).to.have.length(1)
      expect(
        (
          await db.courseNotice.findUniqueOrThrow({
            where: { id: detached.id }
          })
        ).blueprintNoticeId
      ).to.equal(null)
      expect(await receiptCount()).to.equal(1)
    })

    it('does not recreate a deleted notice when the old create request is resent', async () => {
      const created = await service.createNotice(user, courseId, input)
      await service.deleteNotices(user, courseId, [created.id])

      // The receipt still points to the deleted source, so the replay is NOT_FOUND (P2025).
      await expect(
        service.createNotice(user, courseId, input)
      ).to.be.rejected.and.eventually.have.property('code', 'P2025')
      expect(await counts()).to.deep.equal({
        sources: 0,
        copies: 0,
        receipts: 1
      })
    })

    it('deletes nothing when a notice of another blueprint is included', async () => {
      const [mine] = await createMany(1)
      const other = await createBlueprint(user.id)
      const otherSection = await createSection(other.id, 1, user.id)
      const foreign = await service.createNotice(user, other.id, {
        ...input,
        operationId: randomUUID(),
        sectionGroupIds: [otherSection.id]
      })

      for (const call of [
        () => service.getDeletionImpact(user, courseId, [mine.id, foreign.id]),
        () => service.deleteNotices(user, courseId, [mine.id, foreign.id])
      ])
        await expect(call()).to.be.rejectedWith('BlueprintNotice')
      expect(await sourceCount()).to.equal(1)
      expect(await copyCount()).to.equal(2)
      expect(
        await db.blueprintNotice.count({ where: { id: foreign.id } })
      ).to.equal(1)
    })

    it('rolls back every deleted copy when deleting the sources fails', async () => {
      await createMany(2)
      const before = await counts()
      const ids = (
        await db.blueprintNotice.findMany({
          where: { blueprintCourseId: courseId }
        })
      ).map(({ id }) => id)
      const query = db.$extends({
        query: {
          blueprintNotice: {
            async deleteMany() {
              throw new Error('source delete failed')
            }
          }
        }
      })
      const failing = new BlueprintNoticeService(
        query as unknown as PrismaService,
        new BlueprintAccessService(prisma)
      )

      await expect(
        failing.deleteNotices(user, courseId, ids)
      ).to.be.rejectedWith('source delete failed')
      expect(await counts()).to.deep.equal(before)
    })

    it('rejects a user who is not a blueprint leader without deleting', async () => {
      const [created] = await createMany(1)
      const outsider = await createUser()

      for (const call of [
        () => service.getDeletionImpact(outsider, courseId, [created.id]),
        () => service.deleteNotices(outsider, courseId, [created.id])
      ])
        await expect(call()).to.be.rejectedWith(ForbiddenAccessException)
      expect(await sourceCount()).to.equal(1)
    })

    it('serializes overlapping concurrent deletions without deadlock', async () => {
      const [a, b, c] = await createMany(3)

      const results = await Promise.allSettled([
        service.deleteNotices(user, courseId, [c.id, a.id]),
        service.deleteNotices(user, courseId, [a.id, b.id, c.id])
      ])

      // One request wins; the other sees a missing notice and deletes nothing.
      expect(results.map(({ status }) => status).sort()).to.deep.equal([
        'fulfilled',
        'rejected'
      ])
      const failed = results.find(
        (result): result is PromiseRejectedResult =>
          result.status === 'rejected'
      )!
      expect(String(failed.reason)).to.include('BlueprintNotice')
      const remaining = await db.blueprintNotice.findMany({
        where: { blueprintCourseId: courseId }
      })
      expect(remaining.map(({ id }) => id)).to.satisfy(
        (ids: number[]) =>
          ids.length === 0 || (ids.length === 1 && ids[0] === b.id)
      )
    })

    it('keeps a copy unlinked concurrently with the deletion', async () => {
      const created = await service.createNotice(user, courseId, input)
      const [, detached] = created.courseNotice

      const [unlinked] = await Promise.allSettled([
        service.unlink(detached.groupId, detached.id),
        service.deleteNotices(user, courseId, [created.id])
      ])

      expect(await sourceCount()).to.equal(0)
      // Unlink either commits first and keeps the copy, or waits and finds it deleted.
      const survivors = await db.courseNotice.findMany({
        where: { groupId: { in: groups } }
      })
      if (unlinked.status === 'fulfilled') {
        expect(survivors.map(({ id }) => id)).to.deep.equal([detached.id])
        expect(survivors[0].blueprintNoticeId).to.equal(null)
      } else expect(survivors).to.have.length(0)
    })

    it('serves the deletion impact and bulk deletion through GraphQL', async () => {
      const [first, second] = await createMany(2)
      const ids = [first.id, second.id]

      const impact = (await graphql(
        `
          query ($courseId: Int!, $ids: [Int!]!) {
            getBlueprintNoticeDeletionImpact(
              blueprintCourseId: $courseId
              blueprintNoticeIds: $ids
            ) {
              noticeCount
              copyCount
              sectionCount
              commentCount
            }
          }
        `,
        { courseId, ids }
      )) as unknown as {
        data?: { getBlueprintNoticeDeletionImpact: Record<string, number> }
        errors?: unknown
      }
      expect(impact.errors).to.equal(undefined)
      expect(impact.data!.getBlueprintNoticeDeletionImpact).to.deep.equal({
        noticeCount: 2,
        copyCount: 4,
        sectionCount: 2,
        commentCount: 0
      })

      const remove = `mutation ($courseId: Int!, $ids: [Int!]!) {
        deleteBlueprintNotices(blueprintCourseId: $courseId, blueprintNoticeIds: $ids) {
          id courseNotice { id }
        }
      }`
      const empty = await graphql(remove, { courseId, ids: [] })
      expect(empty.errors?.[0].extensions?.code).to.equal('UNPROCESSABLE')

      const deleted = (await graphql(remove, { courseId, ids })) as unknown as {
        data?: { deleteBlueprintNotices: { id: string }[] }
        errors?: unknown
      }
      expect(deleted.errors).to.equal(undefined)
      expect(
        deleted.data!.deleteBlueprintNotices.map(({ id }) => Number(id))
      ).to.deep.equal([second.id, first.id])
      expect(await counts()).to.deep.equal({
        sources: 0,
        copies: 0,
        receipts: 2
      })
    })
  })
})
