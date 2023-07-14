import { Test, type TestingModule } from '@nestjs/testing'
import { expect } from 'chai'
import { StorageService } from './storage.service'

describe('S3Service', () => {
  let service: StorageService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StorageService]
    }).compile()

    service = module.get<StorageService>(StorageService)
  })

  it('should be defined', () => {
    expect(service).to.be.ok
  })
})
