import { Test, type TestingModule } from '@nestjs/testing'
import { expect } from 'chai'
import { TagService, TestcaseService } from '../services'
import { ProblemService } from '../services/problem.service'
import { ProblemResolver } from './problem.resolver'

describe('ProblemResolver', () => {
  let resolver: ProblemResolver

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProblemResolver,
        { provide: ProblemService, useValue: {} },
        { provide: TagService, useValue: {} },
        { provide: TestcaseService, useValue: {} }
      ]
    }).compile()

    resolver = module.get<ProblemResolver>(ProblemResolver)
  })

  it('should be defined', () => {
    expect(resolver).to.be.ok
  })
})
