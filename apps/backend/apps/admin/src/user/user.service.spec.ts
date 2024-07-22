import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { BadRequestException } from '@nestjs/common'
import { Test, type TestingModule } from '@nestjs/testing'
import { faker } from '@faker-js/faker'
import type { User, UserGroup } from '@prisma/client'
import { Role } from '@prisma/client'
import type { Cache } from 'cache-manager'
import { expect } from 'chai'
import { stub } from 'sinon'
import { joinGroupCacheKey } from '@libs/cache'
import { JOIN_GROUP_REQUEST_EXPIRE_TIME } from '@libs/constants'
import { PrismaService } from '@libs/prisma'
import { UserService } from './user.service'

const groupId = 2

const user1: User = {
  id: 3,
  username: 'user1',
  email: 'example@codedang.com',
  password: 'password',
  role: Role.User,
  lastLogin: faker.date.past(),
  createTime: faker.date.past(),
  updateTime: faker.date.past(),
  studentID: null,
  major: null
}

const user2: User = {
  id: 4,
  username: 'user2',
  email: 'example@codedang.com',
  password: 'password',
  role: Role.Admin,
  lastLogin: faker.date.past(),
  createTime: faker.date.past(),
  updateTime: faker.date.past(),
  studentID: null,
  major: null
}

const user3: User = {
  id: 5,
  username: 'user3',
  email: 'example@codedang.com',
  password: 'password',
  role: Role.User,
  lastLogin: faker.date.past(),
  createTime: faker.date.past(),
  updateTime: faker.date.past(),
  studentID: null,
  major: null
}

const userGroup1: UserGroup = {
  userId: 3,
  groupId: 2,
  isGroupLeader: true,
  createTime: faker.date.past(),
  updateTime: faker.date.past()
}

const userGroup2: UserGroup = {
  userId: 4,
  groupId: 2,
  isGroupLeader: true,
  createTime: faker.date.past(),
  updateTime: faker.date.past()
}

const userGroup3: UserGroup = {
  userId: 5,
  groupId: 2,
  isGroupLeader: false,
  createTime: faker.date.past(),
  updateTime: faker.date.past()
}

const updateFindResult = [
  {
    userId: user1.id,
    user: {
      role: user1.role
    },
    isGroupLeader: userGroup1.isGroupLeader
  },
  {
    userId: user2.id,
    user: {
      role: user2.role
    },
    isGroupLeader: userGroup2.isGroupLeader
  },
  {
    userId: user3.id,
    user: {
      role: user3.role
    },
    isGroupLeader: userGroup3.isGroupLeader
  }
]

const deleteFindResult = [
  {
    userId: user1.id,
    user: {
      role: user1.role
    },
    isGroupLeader: userGroup1.isGroupLeader
  },
  {
    userId: user3.id,
    user: {
      role: user3.role
    },
    isGroupLeader: userGroup3.isGroupLeader
  }
]

const db = {
  userGroup: {
    findMany: stub(),
    findFirst: stub(),
    count: stub(),
    update: stub(),
    delete: stub(),
    create: stub()
  },
  user: {
    findUnique: stub(),
    findMany: stub()
  },
  getPaginator: PrismaService.prototype.getPaginator
}

describe('UserService', () => {
  let service: UserService
  let cache: Cache
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
    cache = module.get<Cache>(CACHE_MANAGER)
  })

  it('should be defined', () => {
    expect(service).to.be.ok
  })

  describe('getGroupMembers', () => {
    it('should return userGroups of groupLeaders', async () => {
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
          username: user1.username,
          userId: userGroup1.userId,
          name: '',
          email: user1.email
        }
      ])
    })

    it('should return userGroups of groupMembers', async () => {
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

      const res = await service.getGroupMembers(groupId, 1, 2, true)
      expect(res).to.deep.equal([
        {
          username: user2.username,
          userId: userGroup2.userId,
          name: '',
          email: user2.email
        }
      ])
    })
  })

  describe('updateGroupMemberRole', () => {
    it("should upgrade group member's role", async () => {
      db.userGroup.findFirst.resolves(updateFindResult[2])
      db.userGroup.count.resolves(
        updateFindResult.filter((e) => e.isGroupLeader === true).length
      )
      db.userGroup.update.resolves({
        userId: userGroup3.userId,
        groupId: userGroup3.groupId,
        isGroupLeader: !userGroup3.isGroupLeader
      })

      const res = await service.updateGroupRole(
        userGroup3.userId,
        groupId,
        true
      )
      expect(res).to.deep.equal({
        userId: userGroup3.userId,
        groupId: userGroup3.groupId,
        isGroupLeader: !userGroup3.isGroupLeader
      })
    })

    it("should downgrade group member's role", async () => {
      db.userGroup.findFirst.resolves(updateFindResult[0])
      db.userGroup.count.resolves(
        updateFindResult.filter((e) => e.isGroupLeader === true).length
      )
      db.userGroup.update.resolves({
        userId: userGroup1.userId,
        groupId: userGroup1.groupId,
        isGroupLeader: !userGroup1.isGroupLeader
      })

      const res = await service.updateGroupRole(
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

    it('should throw BadRequestException when the member to downgrade is already not manager', async () => {
      db.userGroup.findMany.resolves(updateFindResult)

      const res = async () =>
        await service.updateGroupRole(userGroup3.userId, groupId, false)
      expect(res()).to.be.rejectedWith(BadRequestException)
    })

    it('should throw BadRequestException when the member to upgrade is already manager', async () => {
      db.userGroup.findMany.resolves(updateFindResult)

      const res = async () =>
        await service.updateGroupRole(userGroup2.userId, groupId, false)
      expect(res()).to.be.rejectedWith(BadRequestException)
    })

    it('should throw BadRequestException when the member is Admin', async () => {
      db.userGroup.findMany.resolves(updateFindResult)

      const res = async () =>
        await service.updateGroupRole(userGroup2.userId, groupId, false)
      expect(res()).to.be.rejectedWith(BadRequestException)
    })

    it('should throw BadRequestException when group leader is less than 2', async () => {
      db.userGroup.findMany.resolves(updateFindResult)

      const res = async () =>
        await service.updateGroupRole(userGroup1.userId, groupId, false)
      expect(res()).to.be.rejectedWith(BadRequestException)
    })
  })

  describe('deleteGroupMember', () => {
    it('should return userGroup', async () => {
      db.userGroup.findMany.resolves(deleteFindResult)
      db.userGroup.delete.resolves(userGroup3)

      const res = await service.deleteGroupMember(
        userGroup3.userId,
        userGroup3.groupId
      )
      expect(res).to.deep.equal(userGroup3)
    })

    it('should throw BadRequestException when the userId is not member', async () => {
      db.userGroup.findMany.resolves(deleteFindResult)

      const res = async () =>
        await service.deleteGroupMember(userGroup2.userId, userGroup2.groupId)
      expect(res()).to.be.rejectedWith(BadRequestException)
    })

    it('should throw BadRequestException when you try to delete manager but there is only one manager', async () => {
      db.userGroup.findMany.resolves(deleteFindResult)

      const res = async () =>
        await service.deleteGroupMember(userGroup1.userId, userGroup1.groupId)
      expect(res()).to.be.rejectedWith(BadRequestException)
    })
  })

  describe('getJoinRequests', () => {
    it('should return user array', async () => {
      const groupId = 1
      db.user.findMany.resolves([user1, user2, user3])
      const joinRequestTimeLimit = Date.now() + JOIN_GROUP_REQUEST_EXPIRE_TIME
      const cacheSpyGet = stub(cache, 'get').resolves([
        [userGroup1.userId, joinRequestTimeLimit],
        [userGroup2.userId, joinRequestTimeLimit],
        [userGroup3.userId, joinRequestTimeLimit]
      ])
      const res = await service.getJoinRequests(groupId)

      expect(cacheSpyGet.calledWith(joinGroupCacheKey(groupId))).to.be.true
      expect(cacheSpyGet.calledOnce).to.be.true

      expect(res).to.deep.equal([user1, user2, user3])
    })
  })

  describe('handleJoinRequest', () => {
    it('should return created userGroup when accepted', async () => {
      const groupId = 1
      const joinRequestTimeLimit = Date.now() + JOIN_GROUP_REQUEST_EXPIRE_TIME
      const cacheSpyGet = stub(cache, 'get').resolves([
        { userId: userGroup1.userId, expiresAt: joinRequestTimeLimit },
        { userId: userGroup2.userId, expiresAt: joinRequestTimeLimit },
        { userId: userGroup3.userId, expiresAt: joinRequestTimeLimit }
      ])
      const cacheSpySet = stub(cache, 'set').resolves()

      db.user.findUnique.resolves({
        role: user3.role
      })

      db.userGroup.create.resolves({
        userId: userGroup3.userId,
        groupId: 1,
        isGroupLeader: false,
        createTime: undefined,
        updateTime: undefined
      })
      const res = await service.handleJoinRequest(
        groupId,
        userGroup3.userId,
        true
      )

      expect(cacheSpyGet.calledWith(joinGroupCacheKey(groupId))).to.be.true
      expect(cacheSpyGet.calledOnce).to.be.true
      expect(
        cacheSpySet.calledOnceWithExactly(
          joinGroupCacheKey(groupId),
          [
            { userId: userGroup1.userId, expiresAt: joinRequestTimeLimit },
            { userId: userGroup2.userId, expiresAt: joinRequestTimeLimit }
          ],
          JOIN_GROUP_REQUEST_EXPIRE_TIME
        )
      ).to.be.true
      expect(cacheSpySet.calledOnce).to.be.true

      expect(res).to.deep.equal({
        userId: userGroup3.userId,
        groupId: 1,
        isGroupLeader: false,
        createTime: undefined,
        updateTime: undefined
      })
    })

    it('should return userId when rejected', async () => {
      const groupId = 1
      const joinRequestTimeLimit = Date.now() + JOIN_GROUP_REQUEST_EXPIRE_TIME
      const cacheSpyGet = stub(cache, 'get').resolves([
        { userId: userGroup1.userId, expiresAt: joinRequestTimeLimit },
        { userId: userGroup2.userId, expiresAt: joinRequestTimeLimit },
        { userId: userGroup3.userId, expiresAt: joinRequestTimeLimit }
      ])
      const cacheSpySet = stub(cache, 'set').resolves()
      const res = await service.handleJoinRequest(
        groupId,
        userGroup3.userId,
        false
      )

      expect(cacheSpyGet.calledWith(joinGroupCacheKey(groupId))).to.be.true
      expect(cacheSpyGet.calledOnce).to.be.true
      expect(
        cacheSpySet.calledOnceWithExactly(
          joinGroupCacheKey(groupId),
          [
            { userId: userGroup1.userId, expiresAt: joinRequestTimeLimit },
            { userId: userGroup2.userId, expiresAt: joinRequestTimeLimit }
          ],
          JOIN_GROUP_REQUEST_EXPIRE_TIME
        )
      ).to.be.true
      expect(cacheSpySet.calledOnce).to.be.true

      expect(res).to.deep.equal(userGroup3.userId)
    })

    it('should throw BadRequestException when the userId did not request join', async () => {
      const groupId = 1
      const joinRequestTimeLimit = Date.now() + JOIN_GROUP_REQUEST_EXPIRE_TIME
      const cacheSpyGet = stub(cache, 'get').resolves([
        { userId: userGroup1.userId, expiresAt: joinRequestTimeLimit },
        { userId: userGroup2.userId, expiresAt: joinRequestTimeLimit }
      ])

      const res = async () =>
        await service.handleJoinRequest(groupId, userGroup3.userId, false)

      expect(res()).to.be.rejectedWith(BadRequestException)
      expect(cacheSpyGet.calledWith(joinGroupCacheKey(groupId))).to.be.true
    })
  })
})
