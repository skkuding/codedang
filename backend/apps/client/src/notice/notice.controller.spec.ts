import { Test, type TestingModule } from '@nestjs/testing'
import { expect } from 'chai'
import { RolesService } from '@libs/auth'
import { NoticeController } from './notice.controller'
import { NoticeService } from './notice.service'

describe('NoticeController', () => {
  let controller: NoticeController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NoticeController],
      providers: [
        { provide: NoticeService, useValue: {} },
        { provide: RolesService, useValue: {} }
      ]
    }).compile()

    controller = module.get<NoticeController>(NoticeController)
  })

  it('should be defined', () => {
    expect(controller).to.be.ok
  })
})
