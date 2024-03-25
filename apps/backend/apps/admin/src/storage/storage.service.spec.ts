import { ConfigService } from '@nestjs/config'
import { Test, type TestingModule } from '@nestjs/testing'
import { expect } from 'chai'
import { S3MediaProvider, S3Provider } from './s3.provider'
import { StorageService } from './storage.service'

describe('StorageService', () => {
  let service: StorageService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StorageService, S3Provider, S3MediaProvider, ConfigService]
    }).compile()

    service = module.get<StorageService>(StorageService)
  })

  it('should be defined', () => {
    expect(service).to.be.ok
  })
})
