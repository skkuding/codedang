import { Test, type TestingModule } from '@nestjs/testing'
import { ProblemResolver } from './problem.resolver'
import { expect } from 'chai'

describe('ProblemResolver', () => {
  let resolver: ProblemResolver

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProblemResolver]
    }).compile()

    resolver = module.get<ProblemResolver>(ProblemResolver)
  })

  it('should be defined', () => {
    expect(resolver).to.be.ok
  })
})
