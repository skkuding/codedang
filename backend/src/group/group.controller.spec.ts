import { Test, TestingModule } from '@nestjs/testing'
import { UserService } from 'src/user/user.service'
import {
  GroupAdminController,
  GroupMemberController
} from './group-admin.controller'
import { GroupController } from './group.controller'
import { GroupService } from './group.service'

describe('GroupController', () => {
  let controller: GroupController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GroupController],
      providers: [{ provide: GroupService, useValue: {} }]
    }).compile()

    controller = module.get<GroupController>(GroupController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})

describe('GroupAdminController', () => {
  let controller: GroupAdminController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GroupAdminController],
      providers: [
        { provide: GroupService, useValue: {} },
        { provide: UserService, useValue: {} }
      ]
    }).compile()

    controller = module.get<GroupAdminController>(GroupAdminController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})

describe('GroupMemberController', () => {
  let controller: GroupMemberController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GroupMemberController],
      providers: [
        { provide: GroupService, useValue: {} },
        { provide: UserService, useValue: {} }
      ]
    }).compile()

    controller = module.get<GroupMemberController>(GroupMemberController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
