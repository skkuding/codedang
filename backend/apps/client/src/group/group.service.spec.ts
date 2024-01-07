import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Test, type TestingModule } from '@nestjs/testing'
import { Prisma, type UserGroup } from '@prisma/client'
import type { Cache } from 'cache-manager'
import { expect } from 'chai'
import { spy, stub, match } from 'sinon'
import { joinGroupCacheKey } from '@libs/cache'
import { JOIN_GROUP_REQUEST_EXPIRE_TIME } from '@libs/constants'
import {
  ConflictFoundException,
  EntityNotExistException
} from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import { GroupService } from './group.service'
import {
  groups,
  userGroups,
  publicGroupDatas,
  mockGroupData,
  userGroupsForJoinedGroups
} from './mock/group.mock'

const db = {
  user: {
    findMany: stub(),
    findFirst: stub(),
    findFirstOrThrow: stub(),
    findUnique: stub(),
    findUniqueOrThrow: stub()
  },
  group: {
    findMany: stub(),
    findFirst: stub(),
    findFirstOrThrow: stub(),
    findUnique: stub(),
    findUniqueOrThrow: stub()
  },
  userGroup: {
    create: stub(),
    delete: stub(),
    findFirst: stub(),
    findMany: stub(),
    findUnique: stub()
  },
  getPaginator: PrismaService.prototype.getPaginator
}

describe('GroupService', () => {
  let service: GroupService
  let cache: Cache
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GroupService,
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
    service = module.get<GroupService>(GroupService)
    cache = module.get<Cache>(CACHE_MANAGER)
  })

  it('should be defined', () => {
    expect(service).to.be.ok
  })

  describe('getGroup', () => {
    it('should return groupData for join when user is not joined to a group', async () => {
      //given
      const userId = 3
      const groupId = 2
      db.userGroup.findFirst.resolves(null)
      db.group.findUniqueOrThrow.resolves(mockGroupData)
      stub(service, 'getGroupLeaders').resolves(['manager'])

      //when
      const result = await service.getGroup(groupId, userId)

      //then
      expect(result).to.deep.equal({
        ...publicGroupDatas[1],
        allowJoin: true,
        leaders: ['manager'],
        isJoined: false
      })
    })

    it('should return groupData when user is joined to a group', async () => {
      //given
      const userId = 1
      const groupId = 1
      const mockGroup = groups.filter((group) => group.id === groupId)[0]
      db.userGroup.findFirst.resolves({
        group: {
          id: mockGroup.id,
          groupName: mockGroup.groupName,
          description: mockGroup.description
        },
        isGroupLeader: true
      })

      //when
      const result = await service.getGroup(groupId, userId)

      //then
      expect(result).to.deep.equal({
        id: mockGroup.id,
        groupName: mockGroup.groupName,
        description: mockGroup.description,
        isGroupLeader: true,
        isJoined: true
      })
    })

    it('should throw PrismaClientKnownRequestError when group not exists', async () => {
      //given
      const userId = 1
      const groupId = 4
      db.userGroup.findFirst.resolves(null)
      db.group.findUniqueOrThrow.rejects(
        new Prisma.PrismaClientKnownRequestError('group', {
          code: 'P2002',
          clientVersion: '5.1.1'
        })
      )

      //when

      //then
      await expect(service.getGroup(groupId, userId)).to.be.rejectedWith(
        Prisma.PrismaClientKnownRequestError
      )
    })
  })

  describe('getGroupByInvitation', () => {
    const userId = 1
    const groupId = 1

    it('should call getGroup', async () => {
      const getGroupSpy = stub(service, 'getGroup').resolves()
      stub(cache, 'get').resolves(groupId)

      await service.getGroupByInvitation('abcdef', userId)
      expect(getGroupSpy.calledWith(groupId)).to.be.true
    })

    it('should throw error if given invitation is invalid', async () => {
      const getGroupSpy = spy(service, 'getGroup')
      stub(cache, 'get').resolves(null)

      await expect(
        service.getGroupByInvitation('abcdef', userId)
      ).to.be.rejectedWith(EntityNotExistException)
      expect(getGroupSpy.called).to.be.false
    })
  })

  describe('getGroups', () => {
    it('should return a list of groups that showOnList is true', async () => {
      //given
      const cursor = 0
      const take = 5
      db.group.findMany.resolves([mockGroupData])

      //when
      const result = await service.getGroups(cursor, take)

      //then
      expect(result).to.deep.equal([publicGroupDatas[1]])
    })
  })

  describe('getJoinedGroups', () => {
    it('should return a list of groups to which user belongs to', async () => {
      //given
      const userId = 1
      db.userGroup.findMany.resolves(
        userGroupsForJoinedGroups.filter(
          (userGroup) => userGroup.userId == userId && userGroup.groupId !== 1
        )
      )
      db.group.findMany.resolves([mockGroupData])

      //when
      const result = await service.getJoinedGroups(userId)

      //then
      expect(result).to.deep.equal([
        { ...publicGroupDatas[1], isGroupLeader: true }
      ])
    })
  })

  describe('joinGroupById', () => {
    it('should return {isJoined: true} when group not set as requireApprovalBeforeJoin', async () => {
      //given
      const userId = 3
      const groupId = 1
      const fakeUserGroup: UserGroup = {
        userId,
        groupId,
        isGroupLeader: false,
        createTime: new Date('2023-02-22T00:00:00.000Z'),
        updateTime: new Date('2023-02-22T0:00:00.000Z')
      }
      db.group.findUniqueOrThrow.resolves({
        config: groups[0].config,
        userGroup: userGroups.filter(
          (userGroup) => userGroup.groupId === groupId
        )
      })
      stub(service, 'createUserGroup').resolves(fakeUserGroup)

      //when
      const result = await service.joinGroupById(userId, groupId)

      //then
      expect(result).to.deep.equal({
        userGroupData: fakeUserGroup,
        isJoined: true
      })
    })

    it('should return {isJoined: false} when group set as requireApprovalBeforeJoin', async () => {
      //given
      const userId = 3
      const groupId = 2
      db.group.findUniqueOrThrow.resolves({
        config: groups[1].config,
        userGroup: userGroups.filter(
          (userGroup) => userGroup.groupId === groupId
        )
      })
      const cacheSpyGet = stub(cache, 'get').resolves(undefined)
      const cacheSpySet = stub(cache, 'set').resolves()

      //when
      const result = await service.joinGroupById(userId, groupId)

      //then
      expect(cacheSpyGet.calledWith(joinGroupCacheKey(groupId))).to.be.true
      expect(cacheSpyGet.calledOnce).to.be.true
      expect(
        cacheSpySet.calledWith(
          joinGroupCacheKey(groupId),
          match.any,
          JOIN_GROUP_REQUEST_EXPIRE_TIME
        )
      ).to.be.true
      expect(cacheSpySet.calledOnce).to.be.true
      expect(result).to.deep.equal({
        userGroupData: {
          userId,
          groupId
        },
        isJoined: false
      })
    })

    it('should throw ConflictFoundException when user is already group memeber', async () => {
      //given
      const userId = 2
      const groupId = 2
      db.group.findUniqueOrThrow.resolves({
        config: groups[1].config,
        userGroup: userGroups.filter(
          (userGroup) => userGroup.groupId === groupId
        )
      })

      //when
      const result = async () => await service.joinGroupById(userId, groupId)

      //then
      expect(result()).to.be.rejectedWith(ConflictFoundException)
    })

    it('should throw ConflictFoundException when join request already exists in cache', async () => {
      //given
      const userId = 3
      const groupId = 2
      db.group.findFirst.resolves({
        config: groups[1].config,
        userGroup: userGroups.filter(
          (userGroup) => userGroup.groupId === groupId
        )
      })
      const joinRequestTimeLimit = Date.now() + JOIN_GROUP_REQUEST_EXPIRE_TIME
      const cacheSpy = stub(cache, 'get').resolves([
        { userId, expiresAt: joinRequestTimeLimit }
      ])

      //when
      await expect(service.joinGroupById(userId, groupId)).to.be.rejectedWith(
        ConflictFoundException
      )

      //then
      expect(cacheSpy.calledOnce).to.be.true
      expect(cacheSpy.calledWith(joinGroupCacheKey(groupId))).to.be.true
    })
  })

  describe('leaveGroup', () => {
    it('should return deleted userGroup when valid userId and groupId passed', async () => {
      //given
      const userId = 2
      const groupId = 2
      db.userGroup.delete.resolves(
        userGroups
          .filter(
            (userGroup) =>
              userGroup.userId === userId && userGroup.groupId === groupId
          )
          .pop()
      )

      //when
      const result = await service.leaveGroup(userId, groupId)

      //then
      expect(result).to.deep.equal(userGroups[3])
    })
  })

  describe('getGroupMembers', () => {
    it('should return group members', async () => {
      //given
      const groupId = 2
      const queryResult = [
        { user: { username: 'user01' } },
        { user: { username: 'user03' } }
      ]
      db.userGroup.findMany.resolves(queryResult)

      //when
      const result = await service.getGroupMembers(groupId)

      //then
      expect(result).to.deep.equal(['user01', 'user03'])
    })
  })

  describe('getGroupLeaders', () => {
    it('should return group leaders', async () => {
      //given
      const groupId = 2
      const queryResult = [{ user: { username: 'manager' } }]
      db.userGroup.findMany.resolves(queryResult)

      //when
      const result = await service.getGroupLeaders(groupId)

      //then
      expect(result).to.deep.equal(['manager'])
    })
  })
})
