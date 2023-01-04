import { Test, TestingModule } from '@nestjs/testing'
import { expect } from 'chai'
import { WorkbookController } from './workbook.controller'
import { WorkbookService } from './workbook.service'

describe('WorkbookController', () => {
  let controller: WorkbookController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkbookController],
      providers: [{ provide: WorkbookService, useValue: {} }]
    }).compile()

    controller = module.get<WorkbookController>(WorkbookController)
  })

  it('should be defined', () => {
    expect(controller).to.be.ok
  })
})
