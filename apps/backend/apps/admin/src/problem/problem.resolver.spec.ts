import { Test, type TestingModule } from '@nestjs/testing'
import { expect } from 'chai'
import { ProblemResolver } from './problem.resolver'
import { ProblemService } from './problem.service'

describe('ProblemResolver', () => {
  let resolver: ProblemResolver

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProblemResolver, { provide: ProblemService, useValue: {} }]
    }).compile()

    resolver = module.get<ProblemResolver>(ProblemResolver)
  })

  it('should be defined', () => {
    expect(resolver).to.be.ok
  })
})
