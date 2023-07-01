import { Test, type TestingModule } from '@nestjs/testing'
import { expect } from 'chai'
import { RolesService } from '@libs/auth'
import { GroupController } from './group.controller'
import { GroupService } from './group.service'

describe('GroupController', () => {
  let controller: GroupController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GroupController],
      providers: [
        { provide: GroupService, useValue: {} },
        { provide: RolesService, useValue: {} }
      ]
    }).compile()

    controller = module.get<GroupController>(GroupController)
  })

  it('should be defined', () => {
    expect(controller).to.be.ok
  })
})
