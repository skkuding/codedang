import { CACHE_MANAGER } from '@nestjs/common'
import { Test, type TestingModule } from '@nestjs/testing'
import { expect } from 'chai'
import { groups, userGroups } from './mock/group.mock'
import { stub } from 'sinon'
import { PrismaService } from 'src/prisma/prisma.service'
import { GroupService } from './group.service'
import { Cache } from 'cache-manager'
import { UserGroup } from '@prisma/client'

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
      const cacheSpy = stub(cache, 'get').resolves(undefined)

      //when
      const result = await service.joinGroupById(userId, groupId)

      //then
      expect(cacheSpy.calledOnce).to.be.true
      expect(result).to.deep.equal({
        userGroupData: {
          userId,
          groupId
        },
        isJoined: false
      })
    })
  })
})
