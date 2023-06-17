import { Test, type TestingModule } from '@nestjs/testing'
import { expect } from 'chai'
import { UserService } from './user.service'
import { PrismaModule } from '@libs/prisma'

describe('UserService', () => {
  let service: UserService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule],
      providers: [UserService]
    }).compile()

    service = module.get<UserService>(UserService)
  })

  it('should be defined', () => {
    expect(service).to.be.ok
  })
})
