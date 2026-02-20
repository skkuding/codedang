import { Test, type TestingModule } from '@nestjs/testing'
import { expect } from 'chai'
import {
  PrismaService,
  PrismaTestService,
  type FlatTransactionClient
} from '@libs/prisma'
import { StudyService } from './study.service'

describe('StudyService', () => {
  let service: StudyService
  let prisma: PrismaTestService
  let transaction: FlatTransactionClient

  before(async function () {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StudyService,
        PrismaTestService,
        {
          provide: PrismaService,
          useExisting: PrismaTestService
        }
      ]
    }).compile()
    service = module.get<StudyService>(StudyService)
    prisma = module.get<PrismaTestService>(PrismaTestService)
  })

  beforeEach(async () => {
    transaction = await prisma.$begin()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(service as any).prisma = transaction
  })

  after(async () => {
    await prisma.$disconnect()
  })

  afterEach(async () => {
    await transaction.$rollback()
  })

  it('should be defined', () => {
    expect(service).to.be.ok
  })
})
