import { Test, type TestingModule } from '@nestjs/testing'
import { expect } from 'chai'
import { MandeuldangProblemResolver } from './problem.resolver'

describe('MandeuldangProblemResolver', () => {
  let resolver: MandeuldangProblemResolver

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MandeuldangProblemResolver]
    }).compile()

    resolver = module.get<MandeuldangProblemResolver>(
      MandeuldangProblemResolver
    )
  })

  it('should be defined', () => {
    expect(resolver).to.be.ok
  })
})
