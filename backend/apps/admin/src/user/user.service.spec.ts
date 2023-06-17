import { Test, type TestingModule } from '@nestjs/testing'
import { expect } from 'chai'
import { UserService } from './user.service'
import { PrismaService } from '@libs/prisma'

describe('UserService', () => {
  let service: UserService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserService, PrismaService]
    }).compile()

    service = module.get<UserService>(UserService)
  })

  it('should be defined', () => {
    expect(service).to.be.ok
  })
})
