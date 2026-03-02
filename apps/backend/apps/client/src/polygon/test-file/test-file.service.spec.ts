import type { TestingModule } from '@nestjs/testing'
import { Test } from '@nestjs/testing'
import { TestFileService } from './test-file.service'

describe('TestFileService', () => {
  let service: TestFileService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TestFileService]
    }).compile()

    service = module.get<TestFileService>(TestFileService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
