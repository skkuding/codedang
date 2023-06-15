import { Test, type TestingModule } from '@nestjs/testing'
import { expect } from 'chai'
import { UserResolver } from './user.resolver'
import { UserService } from './user.service'
import { PrismaService } from '@admin/prisma/prisma.service'

describe('UserResolver', () => {
  let resolver: UserResolver

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserResolver,
        UserService,
        { provide: PrismaService, useValue: {} }
      ]
    }).compile()

    resolver = module.get<UserResolver>(UserResolver)
  })

  it('should be defined', () => {
    expect(resolver).to.be.ok
  })
})
