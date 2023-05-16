import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Test, type TestingModule } from '@nestjs/testing'
import { expect } from 'chai'
import {
  groups,
  userGroups,
  publicGroupDatas,
  mockGroupData
} from './mock/group.mock'
import { stub } from 'sinon'
import { PrismaService } from '@client/prisma/prisma.service'
import { GroupService } from './group.service'
import { type Cache } from 'cache-manager'
import { type UserGroup } from '@prisma/client'
import { joinGroupCacheKey } from '@client/common/cache/keys'
import {
  ActionNotAllowedException,
  EntityNotExistException
} from '@client/common/exception/business.exception'

const db = {
  user: {
    findMany: stub(),
    findFirst: stub(),
    findUnique: stub()
  },
  group: {
    findMany: stub(),
    findFirst: stub(),
    findUnique: stub()
  },
  userGroup: {
    create: stub(),
    delete: stub(),
    findFirst: stub(),
    findMany: stub(),
    findUnique: stub()
  }
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
      db.group.findFirst.resolves(mockGroupData)
      stub(service, 'getGroupLeaders').resolves(['manager'])

      //when
      const result = await service.getGroup(userId, groupId)

      //then
      expect(result).to.deep.equal({
        ...publicGroupDatas[1],
        leaders: ['manager']
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
        }
      })

      //when
      const result = await service.getGroup(userId, groupId)

      //then
      expect(result).to.deep.equal({
        id: mockGroup.id,
        groupName: mockGroup.groupName,
        description: mockGroup.description
      })
    })

    it('should throw EntityNotExistException when group not exists', async () => {
      //given
      const userId = 1
      const groupId = 4
      db.userGroup.findFirst.resolves(null)
      db.group.findFirst.rejects(new EntityNotExistException('group'))

      //when

      //then
      await expect(service.getGroup(userId, groupId)).to.be.rejectedWith(
        EntityNotExistException
      )
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
        userGroups
          .filter(
            (userGroup) => userGroup.userId == userId && userGroup.groupId !== 1
          )
          .map((userGroup) => {
            return { groupId: userGroup.groupId }
          })
      )
      db.group.findMany.resolves([mockGroupData])

      //when
      const result = await service.getJoinedGroups(userId)

      //then
      expect(result).to.deep.equal([publicGroupDatas[1]])
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
      db.group.findFirst.resolves({
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
      db.group.findFirst.resolves({
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
      expect(cacheSpyGet.calledWith(joinGroupCacheKey(userId, groupId))).to.be
        .true
      expect(cacheSpyGet.calledOnce).to.be.true
      expect(
        cacheSpySet.calledWith(joinGroupCacheKey(userId, groupId), {
          userId,
          groupId
        })
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

    it('should throw ActionNotAllowedException when user is already group memeber', async () => {
      //given
      const userId = 2
      const groupId = 2
      db.group.findFirst.resolves({
        config: groups[1].config,
        userGroup: userGroups.filter(
          (userGroup) => userGroup.groupId === groupId
        )
      })

      //when
      const result = async () => await service.joinGroupById(userId, groupId)

      //then
      expect(result()).to.be.rejectedWith(ActionNotAllowedException)
    })

    it('should throw ActionNotAllowedException when join request already exists in cache', async () => {
      //given
      const userId = 3
      const groupId = 2
      db.group.findFirst.resolves({
        config: groups[1].config,
        userGroup: userGroups.filter(
          (userGroup) => userGroup.groupId === groupId
        )
      })
      const cacheSpy = stub(cache, 'get').resolves(
        `user:${userId}:group:${groupId}`
      )

      //when
      await expect(service.joinGroupById(userId, groupId)).to.be.rejectedWith(
        ActionNotAllowedException
      )

      //then
      expect(cacheSpy.calledOnce).to.be.true
      expect(cacheSpy.calledWith(joinGroupCacheKey(userId, groupId))).to.be.true
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

  describe('getUserGroup', () => {
    it('should return isGroupLeader', async () => {
      //given
      const userId = 2
      const groupId = 2
      db.userGroup.findFirst.resolves(
        userGroups
          .filter(
            (userGroup) =>
              userGroup.userId == userId && userGroup.groupId === groupId
          )
          .pop().isGroupLeader
      )

      //when
      const result = await service.getUserGroup(userId, groupId)

      //then
      expect(result).to.deep.equal(userGroups[3].isGroupLeader)
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
