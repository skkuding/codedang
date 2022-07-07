import { Test, TestingModule } from '@nestjs/testing'
import {
  PublicNoticeController,
  GroupNoticeController
} from './notice.controller'
import { NoticeService } from './notice.service'

describe('PublicNoticeController', () => {
  let controller: PublicNoticeController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PublicNoticeController],
      providers: [{ provide: NoticeService, useValue: {} }]
    }).compile()

    controller = module.get<PublicNoticeController>(PublicNoticeController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})

describe('GroupNoticeController', () => {
  let controller: GroupNoticeController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GroupNoticeController],
      providers: [{ provide: NoticeService, useValue: {} }]
    }).compile()

    controller = module.get<GroupNoticeController>(GroupNoticeController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
