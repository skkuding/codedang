import { ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { PrismaService } from 'src/prisma/prisma.service'
import { WorkbookService } from './workbook.service'

describe('WorkbookService', () => {
  let service: WorkbookService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WorkbookService, PrismaService, ConfigService]
    }).compile()

    service = module.get<WorkbookService>(WorkbookService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
