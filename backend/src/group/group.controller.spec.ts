import { ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { PrismaService } from 'src/prisma/prisma.service'
import { GroupController } from './group.controller'
import { GroupService } from './group.service'

describe('GroupController', () => {
  let controller: GroupController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GroupController],
      providers: [GroupService, PrismaService, ConfigService]
    }).compile()

    controller = module.get<GroupController>(GroupController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
