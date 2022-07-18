import { Test, TestingModule } from '@nestjs/testing'
import { UserGroup } from '@prisma/client'
import { PrismaService } from 'src/prisma/prisma.service'
import { GroupService } from './group.service'

const userId = 1
const groupId = 1

const mockPrismaService = {
  userGroup: {
    findFirst: jest.fn()
  }
}

describe('GroupService', () => {
  let service: GroupService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GroupService,
        { provide: PrismaService, useValue: mockPrismaService }
      ]
    }).compile()

    service = module.get<GroupService>(GroupService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
