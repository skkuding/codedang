import { Test, type TestingModule } from '@nestjs/testing'
import { expect } from 'chai'
import { ContestproblemResolver } from './contestproblem.resolver'
import { ContestproblemService } from './contestproblem.service'

describe('ContestproblemResolver', () => {
  let resolver: ContestproblemResolver

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ContestproblemResolver, ContestproblemService]
    }).compile()

    resolver = module.get<ContestproblemResolver>(ContestproblemResolver)
  })

  it('should be defined', () => {
    expect(resolver).to.be.ok
  })
})
