import { Test, type TestingModule } from '@nestjs/testing'
import { ContestResolver } from './contest.resolver'

describe('ContestResolver', () => {
  let resolver: ContestResolver

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ContestResolver]
    }).compile()

    resolver = module.get<ContestResolver>(ContestResolver)
  })

  it('should be defined', () => {
    expect(resolver).toBeDefined()
  })
})
