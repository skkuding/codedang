import { Test, TestingModule } from '@nestjs/testing'
import { expect } from 'chai'
import { GroupService } from 'src/group/group.service'
import { UserService } from 'src/user/user.service'
import {
  PublicWorkbookController,
  GroupWorkbookController
} from './workbook.controller'
import { WorkbookService } from './workbook.service'

describe('WorkbookController', () => {
  let publicController: PublicWorkbookController
  let groupController: GroupWorkbookController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PublicWorkbookController, GroupWorkbookController],
      providers: [
        { provide: WorkbookService, useValue: {} },
        { provide: UserService, useValue: {} },
        { provide: GroupService, useValue: {} }
      ]
    }).compile()

    publicController = module.get<PublicWorkbookController>(
      PublicWorkbookController
    )
    groupController = module.get<GroupWorkbookController>(
      GroupWorkbookController
    )
  })

  it('public controller should be defined', () => {
    expect(publicController).to.be.ok
  })
  it('group controller should be defined', () => {
    expect(groupController).to.be.ok
  })
})
