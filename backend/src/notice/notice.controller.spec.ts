import { ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { PrismaService } from 'src/prisma/prisma.service'
import { NoticeController } from './notice.controller'
import { NoticeService } from './notice.service'

describe('NoticeController', () => {
  let controller: NoticeController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NoticeController],
      providers: [NoticeService, PrismaService, ConfigService]
    }).compile()

    controller = module.get<NoticeController>(NoticeController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
