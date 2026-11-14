import { NestFactory } from '@nestjs/core'
import {
  GraphQLSchemaBuilderModule,
  GraphQLSchemaFactory,
  Query,
  Resolver
} from '@nestjs/graphql'
import { Test, type TestingModule } from '@nestjs/testing'
import { Role } from '@prisma/client'
import { expect } from 'chai'
import {
  getNamedType,
  graphql,
  isObjectType,
  type GraphQLObjectType,
  type GraphQLSchema
} from 'graphql'
import { stub } from 'sinon'
import { AuthenticatedUser, type AuthenticatedRequest } from '@libs/auth'
import { ADMIN_NOT_NEEDED_KEY } from '../../../../libs/auth/src/guard.decorator'
import { BlueprintCourseResolver } from './blueprint-course.resolver'
import { BlueprintCourseService } from './blueprint-course.service'
import type { BlueprintCourseInput } from './model/blueprint-course.input'

const user = new AuthenticatedUser(1, 'professor', Role.User)
const req = { user } as AuthenticatedRequest

const input: BlueprintCourseInput = {
  courseTitle: '소프트웨어공학개론',
  courseNum: 'SWE3002',
  semester: '2026 Fall',
  week: 16,
  professor: '김교수'
}

const createdBlueprintCourse = {
  id: 1,
  ...input,
  createdById: user.id
}

const blueprintCourseService = {
  createBlueprintCourse: stub(),
  getBlueprintCourses: stub()
}

describe('BlueprintCourseResolver', () => {
  let resolver: BlueprintCourseResolver

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlueprintCourseResolver,
        { provide: BlueprintCourseService, useValue: blueprintCourseService }
      ]
    }).compile()

    resolver = module.get<BlueprintCourseResolver>(BlueprintCourseResolver)
  })

  afterEach(() => {
    blueprintCourseService.createBlueprintCourse.reset()
    blueprintCourseService.getBlueprintCourses.reset()
  })

  it('should be defined', () => {
    expect(resolver).to.be.ok
  })

  describe('getBlueprintCourses', () => {
    it('should allow regular authenticated users through the admin guard', () => {
      expect(
        Reflect.getMetadata(
          ADMIN_NOT_NEEDED_KEY,
          BlueprintCourseResolver.prototype.getBlueprintCourses
        )
      ).to.equal(true)
    })

    for (const role of [Role.User, Role.Admin, Role.SuperAdmin]) {
      it(`should pass the authenticated user ID for ${role}`, async () => {
        const request = {
          user: new AuthenticatedUser(42, 'requester', role)
        } as AuthenticatedRequest
        const courses = [{ id: 1, sections: [] }]
        blueprintCourseService.getBlueprintCourses.resolves(courses)
        expect(await resolver.getBlueprintCourses(request)).to.equal(courses)
        expect(
          blueprintCourseService.getBlueprintCourses.calledOnceWithExactly(42)
        ).to.be.true
      })
    }

    it('should preserve an empty result', async () => {
      blueprintCourseService.getBlueprintCourses.resolves([])
      expect(await resolver.getBlueprintCourses(req)).to.deep.equal([])
    })

    it('should propagate service errors', async () => {
      blueprintCourseService.getBlueprintCourses.rejects(
        new Error('Query failed')
      )
      await expect(resolver.getBlueprintCourses(req)).to.be.rejectedWith(
        'Query failed'
      )
    })
  })

  describe('createBlueprintCourse', () => {
    it('should call service with input and request user', async () => {
      blueprintCourseService.createBlueprintCourse.resolves(
        createdBlueprintCourse
      )

      await resolver.createBlueprintCourse(req, input)

      expect(blueprintCourseService.createBlueprintCourse.calledOnce).to.be.true
      expect(
        blueprintCourseService.createBlueprintCourse.calledOnceWithExactly(
          input,
          user
        )
      ).to.be.true
    })

    it('should return the result of service as is', async () => {
      blueprintCourseService.createBlueprintCourse.resolves(
        createdBlueprintCourse
      )

      const res = await resolver.createBlueprintCourse(req, input)

      expect(res).to.equal(createdBlueprintCourse)
    })
  })
})

// GraphQL schema requires a Query root type, so add a minimal one for building.
@Resolver()
class SchemaRootResolver {
  @Query(() => Boolean)
  ping() {
    return true
  }
}

describe('BlueprintCourseResolver GraphQL schema', () => {
  let schema: GraphQLSchema

  before(async () => {
    const app = await NestFactory.create(GraphQLSchemaBuilderModule, {
      logger: false
    })
    await app.init()
    schema = await app
      .get(GraphQLSchemaFactory)
      .create([BlueprintCourseResolver, SchemaRootResolver])
    await app.close()
  })

  it('should expose a non-null list with the agreed summary fields', () => {
    const query = schema.getQueryType()!.getFields().getBlueprintCourses
    expect(String(query.type)).to.equal('[BlueprintCourseListItemOutput!]!')
    expect(query.args).to.be.empty
    const item = getNamedType(query.type) as GraphQLObjectType
    expect(Object.keys(item.getFields())).to.have.members([
      'id',
      'courseTitle',
      'courseNum',
      'semester',
      'sections'
    ])
    expect(String(item.getFields().sections.type)).to.equal('[FindGroup!]!')
  })

  it('should serialize section fields and empty sections through GraphQL', async () => {
    const courses = [
      {
        id: 1,
        courseTitle: 'Course',
        courseNum: 'SWE2015',
        semester: '2026 Fall',
        sections: [
          {
            id: 101,
            groupName: 'Section 41',
            config: { showOnList: true },
            memberNum: 0,
            courseInfo: { classNum: 41 }
          }
        ]
      },
      {
        id: 2,
        courseTitle: 'Empty',
        courseNum: 'SWE3004',
        semester: '2026 Fall',
        sections: []
      }
    ]
    const result = await graphql({
      schema,
      source: `{
        getBlueprintCourses {
          id courseTitle courseNum semester
          sections { id groupName config memberNum courseInfo { classNum } }
        }
      }`,
      rootValue: { getBlueprintCourses: courses }
    })
    expect(result.errors).to.equal(undefined)
    expect(JSON.parse(JSON.stringify(result.data))).to.deep.equal({
      getBlueprintCourses: courses.map((course) => ({
        ...course,
        id: String(course.id),
        sections: course.sections.map((section) => ({
          ...section,
          id: String(section.id)
        }))
      }))
    })
  })

  it('should serialize an empty course list', async () => {
    const result = await graphql({
      schema,
      source: '{ getBlueprintCourses { id } }',
      rootValue: { getBlueprintCourses: [] }
    })
    expect(result.errors).to.equal(undefined)
    expect(result.data?.getBlueprintCourses).to.deep.equal([])
  })

  it('should not expose fields that the service does not populate', () => {
    const mutation = schema.getMutationType() as GraphQLObjectType
    const returnType = getNamedType(
      mutation.getFields().createBlueprintCourse.type
    )

    expect(isObjectType(returnType)).to.be.true
    const fields = Object.keys((returnType as GraphQLObjectType).getFields())
    for (const field of [
      '_count',
      'createdBy',
      'courseInfo',
      'blueprintAssignment'
    ]) {
      expect(fields).to.not.include(field)
    }
    expect(fields).to.include.members([
      'id',
      'courseTitle',
      'courseNum',
      'semester',
      'week',
      'professor',
      'createdById'
    ])
  })
})
