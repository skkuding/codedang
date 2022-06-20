import { ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { PrismaService } from 'src/prisma/prisma.service'
import { NoticeService } from './notice.service'

describe('NoticeService', () => {
  let service: NoticeService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NoticeService, PrismaService, ConfigService]
    }).compile()

    service = module.get<NoticeService>(NoticeService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
