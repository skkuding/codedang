import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { ConfigService } from '@nestjs/config'
import { Test, type TestingModule } from '@nestjs/testing'
import { Prisma, PrismaClient } from '@prisma/client'
import type { Cache } from 'cache-manager'
import { expect } from 'chai'
import * as chai from 'chai'
import chaiExclude from 'chai-exclude'
import { stub } from 'sinon'
import { JOIN_GROUP_REQUEST_EXPIRE_TIME } from '@libs/constants'
import {
  ConflictFoundException,
  EntityNotExistException
} from '@libs/exception'
import { PrismaService, type FlatTransactionClient } from '@libs/prisma'
import { transactionExtension } from '@libs/prisma'
import { GroupService } from './group.service'
import type { UserGroupData } from './interface/user-group-data.interface'

chai.use(chaiExclude)
describe('GroupService', () => {
  let service: GroupService
  let cache: Cache
  let tx: FlatTransactionClient

  const prisma = new PrismaClient().$extends(transactionExtension)

  beforeEach(async function () {
    // TODO: CI 테스트에서 timeout이 걸리는 문제를 우회하기 위해서 timeout을 0으로 설정 (timeout disabled)
    // local에서는 timeout을 disable 하지 않아도 테스트가 정상적으로 동작함 (default setting: 2000ms)
    this.timeout(0)
    //transaction client
    tx = await prisma.$begin()
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GroupService,
        { provide: PrismaService, useValue: tx },
        ConfigService,
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
      const user01Id = 4
      const groupId = 3
      const res = await service.getGroup(groupId, user01Id)

      expect(res).to.deep.equal({
        id: 3,
        groupName: 'Example Private Group 2',
        description:
          'This is an example private group just for testing. Check if this group is not shown to users not registered to this group.',
        allowJoin: true,
        memberNum: 1,
        leaders: ['manager'],
        isJoined: false
      })
    })

    it('should return groupData when user is joined to a group', async () => {
      const user01Id = 4
      const groupId = 2

      const res = await service.getGroup(groupId, user01Id)

      expect(res).to.deep.equal({
        id: 2,
        groupName: 'Example Private Group',
        description:
          'This is an example private group just for testing. Check if this group is not shown to users not registered to this group.',
        isGroupLeader: true,
        isJoined: true
      })
    })

    it('should throw PrismaClientKnownRequestError when group not exists', async () => {
      const user01Id = 4
      const groupId = 99999

      await expect(service.getGroup(groupId, user01Id)).to.be.rejectedWith(
        Prisma.PrismaClientKnownRequestError
      )
    })
  })

  describe('getGroupByInvitation', () => {
    it('should call getGroup', async () => {
      const groupId = 2
      const userId = 4
      stub(cache, 'get').resolves(groupId)

      const res = await service.getGroupByInvitation(
        'invitationCodeKey',
        userId
      )
      expect(res).to.deep.equal({
        id: 2,
        groupName: 'Example Private Group',
        description:
          'This is an example private group just for testing. Check if this group is not shown to users not registered to this group.',
        isGroupLeader: true,
        isJoined: true
      })
    })

    it('should throw error if given invitation is invalid', async () => {
      const userId = 4
      stub(cache, 'get').resolves(null)

      await expect(
        service.getGroupByInvitation('invalidInvitationCodeKey', userId)
      ).to.be.rejectedWith(EntityNotExistException)
    })
  })

  describe('getGroups', () => {
    it('should return a list of groups that showOnList is true', async () => {
      const take = 10
      const cursor = null
      const res = await service.getGroups(cursor, take)

      expect(res).to.deep.equal([
        {
          id: 3,
          groupName: 'Example Private Group 2',
          description:
            'This is an example private group just for testing. Check if this group is not shown to users not registered to this group.',
          memberNum: 1
        },
        {
          id: 4,
          groupName: 'Example Private Group 3',
          description:
            'This is an example private group just for testing. Check if this group is not shown to users not registered to this group.',
          memberNum: 2
        }
      ])
    })
  })

  describe('getJoinedGroups', () => {
    it('should return a list of groups to which user belongs to', async () => {
      const userId = 4
      const res = await service.getJoinedGroups(userId)

      expect(res).to.deep.equal([
        {
          id: 2,
          groupName: 'Example Private Group',
          description:
            'This is an example private group just for testing. Check if this group is not shown to users not registered to this group.',
          memberNum: 11,
          isGroupLeader: true
        }
      ])
    })
  })

  describe('joinGroupById', () => {
    let groupId: number
    const userId = 4
    beforeEach(async () => {
      const group = await tx.group.create({
        data: {
          groupName: 'test',
          description: 'test',
          config: {
            allowJoinFromSearch: true,
            requireApprovalBeforeJoin: false
          }
        }
      })
      groupId = group.id
    })

    afterEach(async () => {
      await tx.$rollback()
    })

    it('should return {isJoined: true} when group not set as requireApprovalBeforeJoin', async () => {
      const res = await service.joinGroupById(userId, groupId)
      const userGroupData: UserGroupData = {
        userId,
        groupId,
        isGroupLeader: false
      }

      expect(res)
        .excludingEvery(['createTime', 'updateTime'])
        .to.deep.equal({
          userGroupData: {
            ...userGroupData,
            createTime: undefined,
            updateTime: undefined
          },
          isJoined: true
        })
    })

    it('should return {isJoined: false} when group set as requireApprovalBeforeJoin', async () => {
      await tx.group.update({
        where: {
          id: groupId
        },
        data: {
          config: {
            allowJoinFromSearch: true,
            requireApprovalBeforeJoin: true
          }
        }
      })

      stub(cache, 'get').resolves([])

      const res = await service.joinGroupById(userId, groupId)
      expect(res).to.deep.equal({
        userGroupData: {
          userId,
          groupId
        },
        isJoined: false
      })
    })

    it('should throw ConflictFoundException when user is already group memeber', async () => {
      await tx.userGroup.create({
        data: {
          userId,
          groupId,
          isGroupLeader: false,
          createTime: new Date(),
          updateTime: new Date()
        }
      })

      await expect(service.joinGroupById(userId, groupId)).to.be.rejectedWith(
        ConflictFoundException
      )
    })

    it('should throw ConflictFoundException when join request already exists in cache', async () => {
      stub(cache, 'get').resolves([
        { userId, expiresAt: Date.now() + JOIN_GROUP_REQUEST_EXPIRE_TIME }
      ])

      await tx.group.update({
        where: {
          id: groupId
        },
        data: {
          config: {
            allowJoinFromSearch: true,
            requireApprovalBeforeJoin: true
          }
        }
      })

      await expect(service.joinGroupById(userId, groupId)).to.be.rejectedWith(
        ConflictFoundException
      )
    })
  })

  describe('leaveGroup', () => {
    const groupId = 3
    const userId = 4
    beforeEach(async () => {
      await tx.userGroup.createMany({
        data: [
          {
            userId,
            groupId,
            isGroupLeader: false
          },
          {
            userId: 5,
            groupId,
            isGroupLeader: true
          }
        ]
      })
    })

    afterEach(async () => {
      await tx.$rollback()
    })

    it('should return deleted userGroup when valid userId and groupId passed', async () => {
      const res = await service.leaveGroup(userId, groupId)

      expect(res).excluding(['createTime', 'updateTime']).to.deep.equal({
        userId,
        groupId,
        isGroupLeader: false,
        createTime: undefined,
        updateTime: undefined
      })
    })
  })

  describe('getGroupMembers', () => {
    it('should return group members', async () => {
      const res = await service.getGroupMembers(2)

      expect(res).to.deep.equal([
        'user02',
        'user03',
        'user04',
        'user05',
        'user06',
        'user07',
        'user08',
        'user09',
        'user10'
      ])
    })
  })

  describe('getGroupLeaders', () => {
    it('should return group leaders', async () => {
      const res = await service.getGroupLeaders(2)

      expect(res).to.deep.equal(['manager', 'user01'])
    })
  })
})
