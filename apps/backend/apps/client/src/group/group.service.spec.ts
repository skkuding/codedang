import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { ConfigService } from '@nestjs/config'
import { Test, type TestingModule } from '@nestjs/testing'
import { GroupType, Prisma } from '@prisma/client'
import type { Cache } from 'cache-manager'
import { expect } from 'chai'
import * as chai from 'chai'
import chaiExclude from 'chai-exclude'
import * as sinon from 'sinon'
import { JOIN_GROUP_REQUEST_EXPIRE_TIME } from '@libs/constants'
import {
  ConflictFoundException,
  EntityNotExistException
} from '@libs/exception'
import {
  PrismaService,
  PrismaTestService,
  type FlatTransactionClient
} from '@libs/prisma'
import { GroupService } from './group.service'
import type { UserGroupData } from './interface/user-group-data.interface'

chai.use(chaiExclude)
describe('GroupService', () => {
  let service: GroupService
  let cache: Cache
  let prisma: PrismaTestService
  let transaction: FlatTransactionClient

  const sandbox = sinon.createSandbox()

  before(async function () {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GroupService,
        PrismaTestService,
        {
          provide: PrismaService,
          useExisting: PrismaTestService
        },
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
    prisma = module.get<PrismaTestService>(PrismaTestService)
  })

  beforeEach(async () => {
    transaction = await prisma.$begin()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(service as any).prisma = transaction
  })

  after(async () => {
    await prisma.$disconnect()
  })

  afterEach(async () => {
    await transaction.$rollback()
    sandbox.restore()
  })

  it('should be defined', () => {
    expect(service).to.be.ok
  })

  describe('getCourse', () => {
    it('should return groupData for join when user is not joined to a group', async () => {
      const user01Id = 4
      const groupId = 3
      const res = await service.getCourse(groupId, user01Id)

      expect(res).to.deep.equal({
        id: 3,
        groupName: 'Example Private Group 2',
        groupType: 'Course',
        courseInfo: null,
        isJoined: false
      })
    })

    it('should return groupData when user is joined to a group', async () => {
      const user01Id = 4
      const groupId = 2

      const res = await service.getCourse(groupId, user01Id)

      expect(res).to.deep.equal({
        id: 2,
        groupName: 'Example Private Group',
        groupType: 'Course',
        courseInfo: null,
        isGroupLeader: true,
        isJoined: true
      })
    })

    it('should throw PrismaClientKnownRequestError when group not exists', async () => {
      const user01Id = 4
      const groupId = 99999

      await expect(service.getCourse(groupId, user01Id)).to.be.rejectedWith(
        Prisma.PrismaClientKnownRequestError
      )
    })
  })

  describe('getGroupByInvitation', () => {
    it('should call getGroup', async () => {
      const groupId = 2
      const userId = 4
      sandbox.stub(cache, 'get').resolves(groupId)

      const res = await service.getGroupByInvitation(
        'invitationCodeKey',
        userId
      )

      expect(res).to.deep.equal({
        id: 2,
        groupName: 'Example Private Group',
        groupType: 'Course',
        courseInfo: null,
        isGroupLeader: true,
        isJoined: true
      })
    })

    it('should throw error if given invitation is invalid', async () => {
      const userId = 4
      sandbox.stub(cache, 'get').resolves(null)

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

      expect(res).to.deep.equal({
        data: [
          {
            id: 3,
            groupName: 'Example Private Group 2',
            description: 'This is an example private group just for testing.',
            memberNum: 1
          },
          {
            id: 4,
            groupName: 'Example Private Group 3',
            description: 'This is an example private group just for testing.',
            memberNum: 2
          }
        ],
        total: 2
      })
    })
  })

  describe('getJoinedGroups', () => {
    it('should return a list of groups to which user belongs to', async () => {
      const userId = 4
      const res = await service.getJoinedGroups(userId, GroupType.Course)

      expect(res).to.deep.equal([
        {
          id: 2,
          groupName: 'Example Private Group',
          memberNum: 11,
          isGroupLeader: true
        }
      ])
    })
  })

  describe('joinGroupById', () => {
    let groupId: number
    const userId = 4

    const createTestGroup = async function () {
      const group = await transaction.group.create({
        data: {
          groupName: 'test',
          description: 'test',
          config: {
            allowJoinFromSearch: true,
            requireApprovalBeforeJoin: false,
            allowJoinWithURL: true
          }
        }
      })
      return group.id
    }

    it('should return {isJoined: true} when group not set as requireApprovalBeforeJoin', async () => {
      groupId = await createTestGroup()
      sandbox.stub(cache, 'get').resolves(groupId)
      const res = await service.joinGroupById(userId, groupId, 'invitationCode')
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

    it('should throw ConflictFoundException when user is already group memeber', async () => {
      groupId = await createTestGroup()
      sandbox.stub(cache, 'get').resolves(groupId)
      await transaction.userGroup.create({
        data: {
          userId,
          groupId,
          isGroupLeader: false,
          createTime: new Date(),
          updateTime: new Date()
        }
      })

      await expect(
        service.joinGroupById(userId, groupId, 'invitationCode')
      ).to.be.rejectedWith(ConflictFoundException)
    })
  })

  describe('leaveGroup', () => {
    const groupId = 3
    const userId = 4
    beforeEach(async () => {
      await transaction.userGroup.createMany({
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

      expect(res).to.deep.equal(['instructor', 'user01'])
    })
  })
})
