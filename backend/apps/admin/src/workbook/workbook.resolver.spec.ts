import { Test, type TestingModule } from '@nestjs/testing'
import { expect } from 'chai'
import { PrismaService } from '@libs/prisma'
import { WorkbookResolver } from './workbook.resolver'
import { WorkbookService } from './workbook.service'

describe('WorkbookResolver', () => {
  let resolver: WorkbookResolver

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkbookResolver,
        WorkbookService,
        { provide: PrismaService, useValue: {} }
      ]
    }).compile()

    resolver = module.get<WorkbookResolver>(WorkbookResolver)
  })

  it('should be defined', () => {
    expect(resolver).to.be.ok
  })
})
