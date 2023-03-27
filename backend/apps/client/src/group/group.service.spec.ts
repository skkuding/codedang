import { CACHE_MANAGER } from '@nestjs/common'
import { Test, type TestingModule } from '@nestjs/testing'
import { expect } from 'chai'
import { fake } from 'sinon'
import { PrismaService } from '~/prisma/prisma.service'
import { GroupService } from './group.service'

const mockPrismaService = {
  userGroup: {
    findFirst: fake()
  }
}

describe('GroupService', () => {
  let service: GroupService
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GroupService,
        { provide: PrismaService, useValue: mockPrismaService },
        {
          provide: CACHE_MANAGER,
          useFactory: () => ({
            set: () => [],
            get: () => []
          })
        }
      ]
    }).compile()
    service = module.get<GroupService>(GroupService)
  })

  it('should be defined', () => {
    expect(service).to.be.ok
  })
})
