import { Test, TestingModule } from '@nestjs/testing'
import { PrismaService } from 'src/prisma/prisma.service'
import { GroupService } from './group.service'

describe('GroupService', () => {
  let service: GroupService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GroupService, { provide: PrismaService, useValue: {} }]
    }).compile()

    service = module.get<GroupService>(GroupService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
