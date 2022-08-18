import { Test, TestingModule } from '@nestjs/testing'
import { GroupService } from 'src/group/group.service'
import { UserService } from 'src/user/user.service'
import { WorkbookController } from './workbook.controller'
import { WorkbookService } from './workbook.service'

describe('WorkbookController', () => {
  let controller: WorkbookController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkbookController],
      providers: [
        { provide: WorkbookService, useValue: {} },
        { provide: UserService, useValue: {} },
        { provide: GroupService, useValue: {} }
      ]
    }).compile()

    controller = module.get<WorkbookController>(WorkbookController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
