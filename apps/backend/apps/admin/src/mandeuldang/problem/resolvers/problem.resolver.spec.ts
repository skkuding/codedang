import { Test, type TestingModule } from '@nestjs/testing'
import { ProblemStatus, Role } from '@prisma/client'
import { expect } from 'chai'
import { stub } from 'sinon'
import type { AuthenticatedRequest } from '@libs/auth'
import { MandeuldangProblemService } from '../services/problem.service'
import { MandeuldangProblemResolver } from './problem.resolver'

const problemService = {
  getMyProblems: stub(),
  getInProgressProblems: stub(),
  getProblem: stub()
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
})
