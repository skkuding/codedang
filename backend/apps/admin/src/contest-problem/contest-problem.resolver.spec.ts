import { Test, type TestingModule } from '@nestjs/testing'
import { expect } from 'chai'
import { ContestProblemResolver } from './contest-problem.resolver'
import { ContestProblemService } from './contest-problem.service'

describe('ContestProblemResolver', () => {
  let resolver: ContestProblemResolver

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ContestProblemResolver, ContestProblemService]
    }).compile()

    resolver = module.get<ContestProblemResolver>(ContestProblemResolver)
  })

  it('should be defined', () => {
    expect(resolver).to.be.ok
  })
})
