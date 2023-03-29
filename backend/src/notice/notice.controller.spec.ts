import { Test, type TestingModule } from '@nestjs/testing'
import { expect } from 'chai'
import { NoticeController, GroupNoticeController } from './notice.controller'
import {
  GroupNoticeAdminController,
  NoticeAdminController
} from './notice-admin.controller'
import { NoticeService } from './notice.service'
import { GroupService } from 'src/group/group.service'
import { UserService } from 'src/user/user.service'

describe('NoticeController', () => {
  let controller: NoticeController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NoticeController],
      providers: [
        { provide: NoticeService, useValue: {} },
        { provide: UserService, useValue: {} },
        { provide: GroupService, useValue: {} }
      ]
    }).compile()

    controller = module.get<NoticeController>(NoticeController)
  })

  it('should be defined', () => {
    expect(controller).to.be.ok
  })
})

describe('GroupNoticeController', () => {
  let controller: GroupNoticeController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GroupNoticeController],
      providers: [
        { provide: NoticeService, useValue: {} },
        { provide: UserService, useValue: {} },
        { provide: GroupService, useValue: {} }
      ]
    }).compile()

    controller = module.get<GroupNoticeController>(GroupNoticeController)
  })

  it('should be defined', () => {
    expect(controller).to.be.ok
  })
})

describe('NoticeAdminController', () => {
  let controller: NoticeAdminController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NoticeAdminController],
      providers: [
        { provide: NoticeService, useValue: {} },
        { provide: UserService, useValue: {} }
      ]
    }).compile()

    controller = module.get<NoticeAdminController>(NoticeAdminController)
  })

  it('should be defined', () => {
    expect(controller).to.be.ok
  })
})

describe('GroupNoticeAdminController', () => {
  let controller: GroupNoticeAdminController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GroupNoticeAdminController],
      providers: [
        { provide: NoticeService, useValue: {} },
        { provide: UserService, useValue: {} },
        { provide: GroupService, useValue: {} }
      ]
    }).compile()

    controller = module.get<GroupNoticeAdminController>(
      GroupNoticeAdminController
    )
  })

  it('should be defined', () => {
    expect(controller).to.be.ok
  })
})
