import { Test, TestingModule } from '@nestjs/testing'
import { WorkbookService } from './workbook.service'

describe('WorkbookService', () => {
  let service: WorkbookService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WorkbookService, { provide: 'prisma', useValue: {} }]
    }).compile()

    service = module.get<WorkbookService>(WorkbookService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
