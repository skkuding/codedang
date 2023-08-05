import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { BadRequestException } from '@nestjs/common'
import { Test, type TestingModule } from '@nestjs/testing'
import type { User, UserGroup } from '@prisma/client'
import { Role } from '@prisma/client'
import { expect } from 'chai'
import { stub } from 'sinon'
import { PrismaService } from '@libs/prisma'
import { UserService } from './user.service'

const groupId = 2

const user1: User = {
  id: 1,
  username: 'user1',
  email: 'example@codedang.com',
  password: 'password',
  role: Role.User,
  lastLogin: undefined,
  createTime: undefined,
  updateTime: undefined
}

const user2: User = {
  id: 2,
  username: 'user2',
  email: 'example@codedang.com',
  password: 'password',
  role: Role.User,
  lastLogin: undefined,
  createTime: undefined,
  updateTime: undefined
}

const user3: User = {
  id: 3,
  username: 'user3',
  email: 'example@codedang.com',
  password: 'password',
  role: Role.User,
  lastLogin: undefined,
  createTime: undefined,
  updateTime: undefined
}

const userGroup1: UserGroup = {
  userId: 1,
  groupId: 2,
  isGroupLeader: true,
  createTime: undefined,
  updateTime: undefined
}

const userGroup2: UserGroup = {
  userId: 2,
  groupId: 2,
  isGroupLeader: false,
  createTime: undefined,
  updateTime: undefined
}

const userGroup3: UserGroup = {
  userId: 3,
  groupId: 2,
  isGroupLeader: true,
  createTime: undefined,
  updateTime: undefined
}

const findResult = [
  {
    user: {
      id: user1.id
    },
    isGroupLeader: userGroup1.isGroupLeader
  },
  {
    user: {
      id: user2.id
    },
    isGroupLeader: userGroup2.isGroupLeader
  },
  {
    user: {
      id: user3.id
    },
    isGroupLeader: userGroup3.isGroupLeader
  }
]

const db = {
  userGroup: {
    findMany: stub(),
    update: stub(),
    delete: stub(),
    create: stub()
  },
  user: {
    findMany: stub()
  }
}

describe('UserService', () => {
  let service: UserService
  // let cache: Cache
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: PrismaService, useValue: db },
        {
          provide: CACHE_MANAGER,
          useFactory: () => ({
            set: () => [],
            get: () => []
          })
        }
      ]
    }).compile()

    service = module.get<UserService>(UserService)
    // cache = module.get<Cache>(CACHE_MANAGER)
  })

  it('should be defined', () => {
    expect(service).to.be.ok
  })

  describe('getGroupMembers', () => {
    it('should return userGroup of groupLeader', async () => {
      const result = [
        {
          user: {
            id: user1.id,
            username: user1.username,
            userProfile: {
              realName: undefined
            },
            email: user1.email
          }
        }
      ]
      db.userGroup.findMany.resolves(result)

      const res = await service.getGroupMembers(groupId, 0, 2, true)
      expect(res).to.deep.equal([
        {
          studentId: user1.username,
          userId: userGroup1.userId,
          name: '',
          email: user1.email
        }
      ])
    })

    it('should return userGroup of groupMember', async () => {
      const result = [
        {
          user: {
            id: user2.id,
            username: user2.username,
            userProfile: {
              realName: undefined
            },
            email: user2.email
          }
        }
      ]
      db.userGroup.findMany.resolves(result)

      const res = await service.getGroupMembers(groupId, 0, 2, true)
      expect(res).to.deep.equal([
        {
          studentId: user2.username,
          userId: userGroup2.userId,
          name: '',
          email: user2.email
        }
      ])
    })
  })

  describe('updateGroupMemberRole', () => {
    it("should upgrade group member's role", async () => {
      db.userGroup.findMany.resolves(findResult)
      db.userGroup.update.resolves({
        userId: userGroup2.userId,
        groupId: userGroup2.groupId,
        isGroupLeader: !userGroup2.isGroupLeader
      })

      const res = await service.updateGroupMemberRole(
        userGroup2.userId,
        groupId,
        true
      )
      expect(res).to.deep.equal({
        userId: userGroup2.userId,
        groupId: userGroup2.groupId,
        isGroupLeader: !userGroup2.isGroupLeader
      })
    })

    it("should downgrade group member's role", async () => {
      db.userGroup.findMany.resolves(findResult)
      db.userGroup.update.resolves({
        userId: userGroup1.userId,
        groupId: userGroup1.groupId,
        isGroupLeader: !userGroup1.isGroupLeader
      })

      const res = await service.updateGroupMemberRole(
        userGroup1.userId,
        groupId,
        false
      )
      expect(res).to.deep.equal({
        userId: userGroup1.userId,
        groupId: userGroup1.groupId,
        isGroupLeader: !userGroup1.isGroupLeader
      })
    })

    it('should throw BadRequestException when group leader is less than 2', async () => {
      db.userGroup.findMany.resolves(findResult)

      const res = async () =>
        await service.updateGroupMemberRole(userGroup1.userId, groupId, false)
      expect(res()).to.be.rejectedWith(BadRequestException)
    })
  })

  describe('deleteGroupMember', () => {
    it('should return userGroup', async () => {
      db.userGroup.findMany.resolves(findResult)
      db.userGroup.delete.resolves(userGroup2)

      const res = await service.deleteGroupMember(
        userGroup2.userId,
        userGroup2.groupId
      )
      expect(res).to.deep.equal(userGroup2)
    })
  })
})
