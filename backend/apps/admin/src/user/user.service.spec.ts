import { Test, type TestingModule } from '@nestjs/testing'
import { expect } from 'chai'
import { UserService } from './user.service'
import { PrismaModule, PrismaService } from '@libs/prisma'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { stub } from 'sinon'

const ID = 1
const EMAIL_ADDRESS = 'email@email.com'
const user = {
  id: ID,
  username: 'user',
  password: 'thisIsPassword',
  role: 'User',
  email: EMAIL_ADDRESS,
  lastLogin: undefined,
  createTime: undefined,
  updateTime: undefined
}
const profile = {
  id: ID,
  userId: ID,
  realName: 'real name',
  createTime: undefined,
  updateTime: undefined
}
const db = {
  user: {
    create: stub().resolves(user),
    findUnique: stub(),
    update: stub().resolves(user),
    delete: stub()
  },
  userProfile: {
    create: stub(),
    findUnique: stub(),
    update: stub().resolves({ ...profile, realName: 'new name' })
  },
  userGroup: {
    create: stub()
  }
}

describe('UserService', () => {
  let service: UserService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule, ConfigModule],
      providers: [
        UserService,
        ConfigService,
        { provide: PrismaService, useValue: db }
      ]
    }).compile()

    service = module.get<UserService>(UserService)
  })

  it('should be defined', () => {
    expect(service).to.be.ok
  })
})
