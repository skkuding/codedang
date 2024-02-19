import { Test, type TestingModule } from '@nestjs/testing'
import { expect } from 'chai'
import {
  ProblemResolver,
  ProblemWithTestcaseResolver
} from './problem.resolver'
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

describe('ProblemWithTestcaseResolver', () => {
  let resolver: ProblemWithTestcaseResolver

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProblemWithTestcaseResolver,
        { provide: ProblemService, useValue: {} }
      ]
    }).compile()

    resolver = module.get<ProblemWithTestcaseResolver>(
      ProblemWithTestcaseResolver
    )
  })

  it('should be defined', () => {
    expect(resolver).to.be.ok
  })
})
