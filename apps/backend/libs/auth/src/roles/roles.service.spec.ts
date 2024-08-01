import { UnauthorizedException } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { faker } from '@faker-js/faker'
import type { User, UserGroup } from '@prisma/client'
import { expect } from 'chai'
import { stub } from 'sinon'
import { PrismaService } from '@libs/prisma'
import { RolesService } from './roles.service'

const user: User = {
  id: 1,
  username: 'user',
  password: 'thisIsPassword',
  role: 'User',
  email: 'email@codedang.com',
  lastLogin: faker.date.past(),
  createTime: faker.date.past(),
  updateTime: faker.date.past(),
  studentId: '0000000000',
  major: 'default'
}

const userGroup: UserGroup = {
  groupId: 1,
  userId: 1,
  createTime: faker.date.past(),
  updateTime: faker.date.past(),
  isGroupLeader: true
}

const db = {
  user: {
    findUnique: stub(),
    findUniqueOrThrow: stub()
  },
  userGroup: {
    findFirst: stub()
  }
}

describe('RolesService', () => {
  let service: RolesService

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [RolesService, { provide: PrismaService, useValue: db }]
    }).compile()

    service = module.get(RolesService)
  })

  it('should be defined', () => {
    expect(service).to.be.not.undefined
  })

  describe('getUserRole', () => {
    it('return given user role', async () => {
      db.user.findUniqueOrThrow.resolves(user.role)
      const result = await service.getUserRole(user.id)
      expect(result).to.equal(user.role)
    })

    it('throw UnauthorizedException', async () => {
      db.user.findUniqueOrThrow.rejects(new UnauthorizedException())
      await expect(service.getUserRole(user.id)).to.be.rejectedWith(
        UnauthorizedException
      )
    })
  })

  describe('getUserGroup', () => {
    it('should return isGroupLeader', async () => {
      const { isGroupLeader } = userGroup
      db.userGroup.findFirst.resolves(isGroupLeader)

      const result = await service.getUserGroup(
        userGroup.userId,
        userGroup.groupId
      )
      expect(result).to.deep.equal(isGroupLeader)
    })
  })
})
