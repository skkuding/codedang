import { Test, TestingModule } from '@nestjs/testing'
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
