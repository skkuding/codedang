import { ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { PrismaService } from 'src/prisma/prisma.service'
import { SubmissionService } from './submission.service'

describe('SubmissionService', () => {
  let service: SubmissionService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SubmissionService, PrismaService, ConfigService]
    }).compile()

    service = module.get<SubmissionService>(SubmissionService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
