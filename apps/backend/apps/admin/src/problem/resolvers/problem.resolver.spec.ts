import { Test, type TestingModule } from '@nestjs/testing'
import { expect } from 'chai'
import { buildSchema, Kind, parse, type GraphQLResolveInfo } from 'graphql'
import { stub, type SinonStub } from 'sinon'
import type { ProblemWithIsVisible } from '../model/problem.output'
import { TagService, TestcaseService } from '../services'
import { ProblemService } from '../services/problem.service'
import { ProblemResolver } from './problem.resolver'

const schema = buildSchema(`
  type ProblemTestcase {
    id: Int
    order: Int
    isHidden: Boolean
    input: String
    output: String
  }
  type Query { testcase: [ProblemTestcase] }
`)
const testcaseType = schema.getQueryType()!.getFields().testcase.type

describe('ProblemResolver', () => {
  let resolver: ProblemResolver
  let getProblemTestcases: SinonStub

  beforeEach(async () => {
    getProblemTestcases = stub().resolves([])
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProblemResolver,
        { provide: ProblemService, useValue: {} },
        { provide: TagService, useValue: {} },
        { provide: TestcaseService, useValue: { getProblemTestcases } }
      ]
    }).compile()

    resolver = module.get<ProblemResolver>(ProblemResolver)
  })

  it('should be defined', () => {
    expect(resolver).to.be.ok
  })

  it('skips IO for a metadata-only testcase selection', async () => {
    const document = parse('query { testcase { id order isHidden } }')
    const operation = document.definitions[0]
    if (operation.kind !== Kind.OPERATION_DEFINITION) throw new Error()
    const field = operation.selectionSet.selections[0]
    if (field.kind !== Kind.FIELD) throw new Error()
    const info = {
      fieldNodes: [field],
      returnType: testcaseType,
      parentType: schema.getQueryType(),
      schema,
      fragments: {},
      variableValues: {}
    } as unknown as GraphQLResolveInfo

    await resolver.getProblemTestCases({ id: 1 } as ProblemWithIsVisible, info)

    expect(getProblemTestcases.calledOnceWithExactly(1, false)).to.be.true
  })

  it('includes IO requested through a fragment', async () => {
    const document = parse(`
      query { testcase { id ...TestcaseIO } }
      fragment TestcaseIO on ProblemTestcase { input }
    `)
    const operation = document.definitions[0]
    const fragment = document.definitions[1]
    if (
      operation.kind !== Kind.OPERATION_DEFINITION ||
      fragment.kind !== Kind.FRAGMENT_DEFINITION
    ) {
      throw new Error()
    }
    const field = operation.selectionSet.selections[0]
    if (field.kind !== Kind.FIELD) throw new Error()
    const info = {
      fieldNodes: [field],
      returnType: testcaseType,
      parentType: schema.getQueryType(),
      schema,
      fragments: { TestcaseIO: fragment },
      variableValues: {}
    } as unknown as GraphQLResolveInfo

    await resolver.getProblemTestCases({ id: 1 } as ProblemWithIsVisible, info)

    expect(getProblemTestcases.calledOnceWithExactly(1, true)).to.be.true
  })
})
