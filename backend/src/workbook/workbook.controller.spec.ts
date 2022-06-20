import { Test, TestingModule } from '@nestjs/testing'
import { WorkbookController } from './workbook.controller'

describe('WorkbookController', () => {
  let controller: WorkbookController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkbookController],
      providers: [{ provide: 'workbook', useValue: {} }]
    }).compile()

    controller = module.get<WorkbookController>(WorkbookController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
