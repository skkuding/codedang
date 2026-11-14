import {
  GraphQLSchemaBuilderModule,
  GraphQLSchemaFactory
} from '@nestjs/graphql'
import { Test, type TestingModule } from '@nestjs/testing'
import { ProblemType } from '@generated'
import { ProblemStatus, Role } from '@prisma/client'
import { expect } from 'chai'
import { stub } from 'sinon'
import type { AuthenticatedRequest } from '@libs/auth'
import { MandeuldangProblemService } from '../services/problem.service'
import { MandeuldangProblemResolver } from './problem.resolver'

const problemService = {
  getMyProblems: stub(),
  getInProgressProblems: stub(),
  getProblem: stub(),
  createProblem: stub(),
  deleteProblem: stub()
}

const req = {
  user: { id: 1, role: Role.User }
} as unknown as AuthenticatedRequest

describe('MandeuldangProblemResolver', () => {
  let resolver: MandeuldangProblemResolver

  beforeEach(async () => {
    problemService.getMyProblems.reset()
    problemService.getInProgressProblems.reset()
    problemService.getProblem.reset()
    problemService.createProblem.reset()
    problemService.deleteProblem.reset()

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MandeuldangProblemResolver,
        { provide: MandeuldangProblemService, useValue: problemService }
      ]
    }).compile()

    resolver = module.get<MandeuldangProblemResolver>(
      MandeuldangProblemResolver
    )
  })

  it('should be defined', () => {
    expect(resolver).to.be.ok
  })

  it('getMyMandeuldangProblems delegates to the service with the requester id', async () => {
    problemService.getMyProblems.resolves([])

    await resolver.getMyMandeuldangProblems(req, null, 10, undefined)

    expect(
      problemService.getMyProblems.calledOnceWith(1, null, 10, undefined)
    ).to.equal(true)
  })

  it('getMyMandeuldangProblems forwards an explicit status filter', async () => {
    problemService.getMyProblems.resolves([])

    await resolver.getMyMandeuldangProblems(req, null, 10, ProblemStatus.Draft)

    expect(
      problemService.getMyProblems.calledOnceWith(
        1,
        null,
        10,
        ProblemStatus.Draft
      )
    ).to.equal(true)
  })

  it('getInProgressMandeuldangProblems delegates to the service with the requester id', async () => {
    problemService.getInProgressProblems.resolves([])

    await resolver.getInProgressMandeuldangProblems(req, null, 10, undefined)

    expect(
      problemService.getInProgressProblems.calledOnceWith(
        1,
        null,
        10,
        undefined
      )
    ).to.equal(true)
  })

  it('getMandeuldangProblem delegates to the service with id, requester id, and role', async () => {
    problemService.getProblem.resolves({})

    await resolver.getMandeuldangProblem(req, 42)

    expect(problemService.getProblem.calledOnceWith(42, 1, Role.User)).to.equal(
      true
    )
  })

  it('creates a problem with the input and requester id and returns the created problem', async () => {
    const input = { title: 'New problem', problemType: ProblemType.General }
    const created = { id: 42, ...input }
    problemService.createProblem.resolves(created)

    const result = await resolver.createMandeuldangProblem(req, input)

    expect(
      problemService.createProblem.calledOnceWithExactly(input, req.user.id)
    ).to.equal(true)
    expect(result).to.equal(created)
  })

  it('deletes the requested problem with the requester id and returns the deleted problem', async () => {
    const deleted = { id: 42 }
    problemService.deleteProblem.resolves(deleted)

    const result = await resolver.deleteMandeuldangProblem(req, deleted.id)

    expect(
      problemService.deleteProblem.calledOnceWithExactly(
        deleted.id,
        req.user.id
      )
    ).to.equal(true)
    expect(result).to.equal(deleted)
  })

  it('exposes the create and delete mutations with their required GraphQL types', async () => {
    const module = await Test.createTestingModule({
      imports: [GraphQLSchemaBuilderModule]
    }).compile()
    try {
      const schema = await module
        .get(GraphQLSchemaFactory)
        .create([MandeuldangProblemResolver])
      const mutations = schema.getMutationType()!.getFields()
      const create = mutations.createMandeuldangProblem
      const remove = mutations.deleteMandeuldangProblem
      expect(String(create.type)).to.equal('MandeuldangProblemOutput!')
      expect(create.args.map((arg) => arg.name)).to.deep.equal(['input'])
      expect(String(create.args[0].type)).to.equal(
        'CreateMandeuldangProblemInput!'
      )
      expect(String(remove.type)).to.equal('MandeuldangProblemOutput!')
      expect(remove.args.map((arg) => arg.name)).to.deep.equal(['id'])
      expect(String(remove.args[0].type)).to.equal('Int!')
    } finally {
      await module.close()
    }
  })
})
