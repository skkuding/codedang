import { ConfigService } from '@nestjs/config'
import { Test, type TestingModule } from '@nestjs/testing'
import { expect } from 'chai'
import { PrismaService } from '@libs/prisma'
import { StorageService } from '@libs/storage'
import { S3MediaProvider, S3Provider } from '@libs/storage'
import { TestcaseService } from '@admin/testcase/testcase.service'
import {
  TagService,
  TestcaseService as ProblemTestcaseService
} from '../services'
import { ProblemService } from '../services/problem.service'
import { ProblemResolver } from './problem.resolver'

describe('ProblemResolver', () => {
  let resolver: ProblemResolver

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProblemResolver,
        ProblemService,
        TestcaseService,
        ProblemTestcaseService,
        TagService,
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
