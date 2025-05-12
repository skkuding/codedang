import { ConfigService } from '@nestjs/config'
import { Test, type TestingModule } from '@nestjs/testing'
import { expect } from 'chai'
import { PrismaService } from '@libs/prisma'
import { S3MediaProvider, S3Provider } from '@admin/storage/s3.provider'
import { StorageService } from '@admin/storage/storage.service'
import { TestcaseService } from '@admin/testcase/testcase.service'
import { ProblemResolver } from './problem.resolver'
import { ProblemService } from './problem.service'

describe('ProblemResolver', () => {
  let resolver: ProblemResolver

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProblemResolver,
        ProblemService,
        TestcaseService,
        PrismaService,
        StorageService,
        ConfigService,
        S3Provider,
        S3MediaProvider
      ]
    }).compile()

    resolver = module.get<ProblemResolver>(ProblemResolver)
  })

  it('should be defined', () => {
    expect(resolver).to.be.ok
  })
})
