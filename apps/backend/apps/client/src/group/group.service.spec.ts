import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { ConfigService } from '@nestjs/config'
import { Test, type TestingModule } from '@nestjs/testing'
import type KeyvRedis from '@keyv/redis'
import { createKeyv } from '@keyv/redis'
import { GroupType, Prisma } from '@prisma/client'
import { createCache, type Cache } from 'cache-manager'
import { expect } from 'chai'
import * as chai from 'chai'
import chaiExclude from 'chai-exclude'
import * as sinon from 'sinon'
import { invitationCodeKey, studentRetryKey } from '@libs/cache'
import {
  MAX_STUDENT_RETRY_COUNT,
  STUDENT_RETRY_EXPIRE_TIME
} from '@libs/constants'
import {
  ConflictFoundException,
  EntityNotExistException,
  ForbiddenAccessException
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
    it('should return courseData for join when user is not joined to a group', async () => {
      const user01Id = 7
      const groupId = 3
      const res = await service.getCourse(groupId, user01Id)

      expect(res).to.deep.equal({
        id: 3,
        groupName: '자료구조',
        groupType: 'Course',
        courseInfo: {
          courseNum: 'SWE2017',
          classNum: 2,
          professor: '박영희',
          semester: '2025 Spring'
        },
        isJoined: false
      })
    })

    it('should return groupData when user is joined to a group', async () => {
      const user01Id = 7
      const groupId = 2

      const res = await service.getCourse(groupId, user01Id)

      expect(res).to.deep.equal({
        id: 2,
        groupName: '정보보호개론',
        groupType: 'Course',
        courseInfo: {
          courseNum: 'SWE3033',
          classNum: 42,
          professor: '형식킴',
          semester: '2025 Spring',
          week: 16,
          email: 'example01@skku.edu',
          website: 'https://seclab.com',
          office: null,
          phoneNum: null
        },
        isGroupLeader: true,
        isJoined: true
      })
    })

    it('should throw PrismaClientKnownRequestError when group not exists', async () => {
      const user01Id = 7
      const groupId = 99999

      await expect(service.getCourse(groupId, user01Id)).to.be.rejectedWith(
        Prisma.PrismaClientKnownRequestError
      )
    })
  })

  describe('getCourseByInvitation', () => {
    it('should call getCourse', async () => {
      const groupId = 2
      const userId = 7
      sandbox.stub(cache, 'get').resolves(groupId)

      const res = await service.getGroupByInvitation(
        'invitationCodeKey',
        userId
      )

      expect(res).to.deep.equal({
        id: 2,
        groupName: '정보보호개론',
        groupType: 'Course',
        courseInfo: {
          courseNum: 'SWE3033',
          classNum: 42,
          professor: '형식킴',
          semester: '2025 Spring',
          week: 16,
          email: 'example01@skku.edu',
          website: 'https://seclab.com',
          office: null,
          phoneNum: null
        },
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
            id: 2,
            groupName: '정보보호개론',
            description: null,
            memberNum: 11
          },
          {
            id: 3,
            groupName: '자료구조',
            description:
              '배열, 링크드리스트, 스택, 큐, 트리, 그래프 등 기본적인 자료구조와 알고리즘을 학습합니다.',
            memberNum: 1
          },
          {
            id: 4,
            groupName: '알고리즘',
            description:
              '정렬, 탐색, 동적계획법, 그리디 알고리즘 등 다양한 알고리즘 설계 기법을 학습합니다.',
            memberNum: 2
          }
        ],
        total: 3
      })
    })
  })

  describe('getJoinedGroups', () => {
    it('should return a list of groups to which user belongs to', async () => {
      const userId = 7
      const res = await service.getJoinedGroups(userId, GroupType.Course)

      expect(res).to.deep.equal([
        {
          id: 2,
          groupName: '정보보호개론',
          courseInfo: {
            groupId: 2,
            courseNum: 'SWE3033',
            classNum: 42,
            professor: '형식킴',
            semester: '2025 Spring',
            week: 16,
            email: 'example01@skku.edu',
            website: 'https://seclab.com',
            office: null,
            phoneNum: null
          },
          memberNum: 11,
          isGroupLeader: true
        }
      ])
    })
  })

  describe('joinGroupById', () => {
    let groupId: number
    const userId = 7

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
      const res = await service.joinGroupById(
        userId,
        groupId,
        'invitationCode',
        '2024000000'
      )
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

    describe('whitelist retry limit', () => {
      const listedStudentId = '2024000000'
      const wrongStudentId = '2024999999'
      const invitationCode = 'invitationCode'

      let redisCache: Cache
      let redis: Awaited<ReturnType<KeyvRedis<unknown>['getClient']>>
      let originalCacheManager: Cache
      let retryKey: string

      const setAccountStudentId = (studentId: string) =>
        transaction.user.update({
          where: { id: userId },
          data: { studentId }
        })

      const join = (studentId: string) =>
        service.joinGroupById(userId, groupId, invitationCode, studentId)

      const findMembership = () =>
        transaction.userGroup.findUnique({
          where: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            userId_groupId: { userId, groupId }
          }
        })

      before(async () => {
        const host = process.env.REDIS_HOST ?? 'localhost'
        const port = process.env.REDIS_PORT ?? '6380'
        const password = process.env.REDIS_PASSWORD
        const keyv = createKeyv(
          password
            ? `redis://:${password}@${host}:${port}/0`
            : `redis://${host}:${port}/0`,
          { throwOnErrors: true, throwOnConnectError: true }
        )
        redisCache = createCache({ stores: [keyv] })
        redis = await (keyv.store as KeyvRedis<unknown>).getClient()
      })

      after(async () => {
        await redisCache.disconnect()
      })

      beforeEach(async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        originalCacheManager = (service as any).cacheManager
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(service as any).cacheManager = redisCache

        groupId = await createTestGroup()
        await transaction.groupWhitelist.create({
          data: { groupId, studentId: listedStudentId }
        })
        await setAccountStudentId(listedStudentId)

        retryKey = studentRetryKey(groupId, userId)
        await redis.del(retryKey)
        await redisCache.set(invitationCodeKey(invitationCode), groupId)
      })

      afterEach(async () => {
        await redis.del([retryKey, invitationCodeKey(invitationCode)])
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(service as any).cacheManager = originalCacheManager
      })

      const whitelistCases = [
        {
          description:
            'join when the submitted ID matches the listed account ID',
          accountStudentId: listedStudentId,
          submittedStudentId: listedStudentId,
          shouldJoin: true
        },
        {
          description:
            'reject an incorrect ID even when the account ID is listed',
          accountStudentId: listedStudentId,
          submittedStudentId: wrongStudentId,
          shouldJoin: false
        },
        {
          description:
            'reject another listed student ID when the account ID is unlisted',
          accountStudentId: '2024000001',
          submittedStudentId: listedStudentId,
          shouldJoin: false
        },
        {
          description: 'reject a matching account ID that is not listed',
          accountStudentId: '2024000001',
          submittedStudentId: '2024000001',
          shouldJoin: false
        }
      ]

      for (const testCase of whitelistCases) {
        it(`should ${testCase.description}`, async () => {
          await setAccountStudentId(testCase.accountStudentId)

          const result = join(testCase.submittedStudentId)

          if (testCase.shouldJoin) {
            expect((await result).isJoined).to.equal(true)
            expect(await redis.get(retryKey)).to.equal(null)
          } else {
            await expect(result).to.be.rejectedWith(
              ForbiddenAccessException,
              'Whitelist violation'
            )
            expect(await redis.get(retryKey)).to.equal('1')
            expect(await service.getUserRetryCount(userId, groupId)).to.equal(1)
          }

          expect((await findMembership()) !== null).to.equal(
            testCase.shouldJoin
          )
        })
      }

      it('should reject the correct ID after three failed attempts', async () => {
        for (let i = 0; i < MAX_STUDENT_RETRY_COUNT; i++) {
          await expect(join(wrongStudentId)).to.be.rejectedWith(
            ForbiddenAccessException,
            'Whitelist violation'
          )
        }

        await expect(join(listedStudentId)).to.be.rejectedWith(
          ForbiddenAccessException,
          'Join request count exceed'
        )
        expect(await redis.get(retryKey)).to.equal(
          String(MAX_STUDENT_RETRY_COUNT)
        )
        expect(await findMembership()).to.equal(null)
      })

      it('should not count more than three concurrent failed attempts', async () => {
        // 테스트는 하나의 Prisma interactive transaction(단일 커넥션)을 공유하므로
        // joinGroupById를 동시에 호출하면 Prisma 쿼리가 충돌합니다.
        // 원자성이 필요한 Redis 증가 로직을 직접 동시에 호출해 검증합니다.
        const attempts = MAX_STUDENT_RETRY_COUNT + 2

        const counts = await Promise.all(
          Array.from({ length: attempts }, () =>
            service.incrementRetryCount(userId, groupId)
          )
        )

        expect([...counts].sort((a, b) => a - b)).to.deep.equal([
          ...Array(attempts - MAX_STUDENT_RETRY_COUNT).fill(-1),
          ...Array.from({ length: MAX_STUDENT_RETRY_COUNT }, (_, i) => i + 1)
        ])
        expect(await redis.get(retryKey)).to.equal(
          String(MAX_STUDENT_RETRY_COUNT)
        )
        expect(await service.getUserRetryCount(userId, groupId)).to.equal(
          MAX_STUDENT_RETRY_COUNT
        )

        await expect(join(listedStudentId)).to.be.rejectedWith(
          ForbiddenAccessException,
          'Join request count exceed'
        )
        expect(await findMembership()).to.equal(null)
      })

      it('should expire the retry count from the first failed attempt', async () => {
        await expect(join(wrongStudentId)).to.be.rejectedWith(
          'Whitelist violation'
        )
        const firstTtl = await redis.pTTL(retryKey)
        expect(firstTtl).to.be.greaterThan(0)
        expect(firstTtl).to.be.at.most(STUDENT_RETRY_EXPIRE_TIME)

        await expect(join(wrongStudentId)).to.be.rejectedWith(
          'Whitelist violation'
        )
        expect(await redis.pTTL(retryKey)).to.be.at.most(firstTtl)
      })

      it('should allow the correct ID again after the retry count expires', async () => {
        for (let i = 0; i < MAX_STUDENT_RETRY_COUNT; i++) {
          await expect(join(wrongStudentId)).to.be.rejectedWith(
            'Whitelist violation'
          )
        }
        await expect(join(listedStudentId)).to.be.rejectedWith(
          'Join request count exceed'
        )

        // 15분을 기다리는 대신 남은 만료 시간을 줄여 만료를 재현합니다.
        await redis.pExpire(retryKey, 1)
        await new Promise((resolve) => setTimeout(resolve, 20))

        expect(await service.getUserRetryCount(userId, groupId)).to.equal(0)
        expect((await join(listedStudentId)).isJoined).to.equal(true)
      })

      it('should reset a non-integer retry value instead of failing', async () => {
        await redis.set(retryKey, JSON.stringify({ value: 2 }))

        expect(await service.getUserRetryCount(userId, groupId)).to.equal(0)
        await expect(join(wrongStudentId)).to.be.rejectedWith(
          ForbiddenAccessException,
          'Whitelist violation'
        )
        expect(await redis.get(retryKey)).to.equal('1')
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
        service.joinGroupById(userId, groupId, 'invitationCode', '2024000000')
      ).to.be.rejectedWith(ConflictFoundException)
    })
  })

  describe('leaveGroup', () => {
    const groupId = 3
    const userId = 7
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
