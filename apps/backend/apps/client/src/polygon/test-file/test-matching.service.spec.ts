import type { TestingModule } from '@nestjs/testing'
import { Test } from '@nestjs/testing'
import { TestMatchingService } from './test-matching.service'

describe('TestMatchingService', () => {
  let service: TestMatchingService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TestMatchingService]
    }).compile()

    service = module.get<TestMatchingService>(TestMatchingService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
