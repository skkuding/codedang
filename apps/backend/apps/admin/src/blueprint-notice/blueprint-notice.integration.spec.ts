import { ApolloDriver } from '@nestjs/apollo'
import { ValidationPipe, type INestApplication } from '@nestjs/common'
import { GraphQLModule } from '@nestjs/graphql'
import { Test } from '@nestjs/testing'
import { PrismaClient, Role, type Prisma } from '@prisma/client'
import { expect } from 'chai'
import { randomUUID } from 'crypto'
import { AuthenticatedUser } from '@libs/auth'
import {
  AdminExceptionFilter,
  apolloErrorFormatter,
  ForbiddenAccessException,
  UnprocessableDataException
} from '@libs/exception'
import type { PrismaService } from '@libs/prisma'
import { BlueprintAccessService } from '@admin/blueprint-course/blueprint-access.service'
import { BlueprintNoticeResolver } from './blueprint-notice.resolver'
import { BlueprintNoticeService } from './blueprint-notice.service'
import type { CreateBlueprintNoticeInput } from './model/blueprint-notice.input'

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
    // The identity is a fixture; JWT verification is tested elsewhere.
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
    }).compile()
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
})
