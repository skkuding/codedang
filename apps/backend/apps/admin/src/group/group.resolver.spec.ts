import {
  GraphQLSchemaBuilderModule,
  GraphQLSchemaFactory
} from '@nestjs/graphql'
import { Test, type TestingModule } from '@nestjs/testing'
import { expect } from 'chai'
import { stub } from 'sinon'
import { RolesService } from '@libs/auth'
import {
  CourseResolver,
  GroupResolver,
  WhitelistResolver
} from './group.resolver'
import { CourseService, GroupService, WhitelistService } from './group.service'

describe('GroupResolver', () => {
  let resolver: GroupResolver

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GroupResolver,
        { provide: GroupService, useValue: {} },
        { provide: RolesService, useValue: {} }
      ]
    }).compile()

    resolver = module.get<GroupResolver>(GroupResolver)
  })

  it('should be defined', () => {
    expect(resolver).to.be.ok
  })
})

describe('WhitelistResolver', () => {
  it('should return the number of deleted whitelist entries', async () => {
    const service = { deleteWhitelist: stub().resolves(2) }
    const resolver = new WhitelistResolver(
      service as unknown as WhitelistService
    )

    expect(await resolver.deleteWhitelist(1)).to.equal(2)
    expect(service.deleteWhitelist.calledOnceWithExactly(1)).to.be.true
  })

  it('should expose whitelist objects and an integer group ID in the GraphQL schema', async () => {
    const module = await Test.createTestingModule({
      imports: [GraphQLSchemaBuilderModule]
    }).compile()

    try {
      const factory = module.get(GraphQLSchemaFactory)
      const schema = await factory.create([WhitelistResolver])
      const query = schema.getQueryType()!.getFields().getWhitelist

      expect(query.type.toString()).to.equal('[GroupWhitelist!]!')
      expect(
        query.args.find(({ name }) => name === 'groupId')?.type.toString()
      ).to.equal('Int!')
      const whitelistType = schema.getType('GroupWhitelist')
      expect(whitelistType).not.to.equal(undefined)
    } finally {
      await module.close()
    }
  })

  it('should return student IDs and names from the whitelist service', async () => {
    const students = [{ studentId: '20250001', studentName: 'Student' }]
    const service = { getWhitelist: stub().resolves(students) }
    const resolver = new WhitelistResolver(
      service as unknown as WhitelistService
    )

    expect(await resolver.getWhitelist(1)).to.deep.equal(students)
    expect(service.getWhitelist.calledOnceWithExactly(1)).to.be.true
  })
})

describe('CourseResolver', () => {
  it('should forward the course and question identifiers and return the question', async () => {
    const question = { id: 3, groupId: 1, order: 2 }
    const service = { getCourseQnA: stub().resolves(question) }
    const resolver = new CourseResolver(service as unknown as CourseService)

    expect(await resolver.getCourseQnA(1, 2)).to.deep.equal(question)
    expect(service.getCourseQnA.calledOnceWithExactly(1, 2)).to.be.true
  })
})
