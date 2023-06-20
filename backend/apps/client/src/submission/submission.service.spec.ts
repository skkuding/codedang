import { Test, type TestingModule } from '@nestjs/testing'
import { expect } from 'chai'
import { PrismaService } from '@libs/prisma'
import { SubmissionService } from './submission.service'

describe('SubmissionService', () => {
  let service: SubmissionService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SubmissionService, { provide: PrismaService, useValue: {} }]
    }).compile()

    service = module.get<SubmissionService>(SubmissionService)
  })

  it('should be defined', () => {
    expect(service).to.be.ok
  })
})
