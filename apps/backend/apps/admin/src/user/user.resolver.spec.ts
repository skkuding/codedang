import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Test, type TestingModule } from '@nestjs/testing'
import { faker } from '@faker-js/faker'
import type { UserGroup } from '@prisma/client'
import { expect } from 'chai'
import { RolesService } from '@libs/auth'
import { UnprocessableDataException } from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import { GroupMemberResolver, UserResolver } from './user.resolver'
import { GroupMemberService, UserService } from './user.service'

describe('UserResolver', () => {
  let resolver: UserResolver

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserResolver,
        UserService,
        { provide: RolesService, useValue: {} },
        { provide: PrismaService, useValue: {} },
        {
          provide: CACHE_MANAGER,
          useFactory: () => ({
            set: () => [],
            get: () => []
          })
        }
      ]
    }).compile()

    resolver = module.get<UserResolver>(UserResolver)
  })

  it('should be defined', () => {
    expect(resolver).to.be.ok
  })
})

describe('GroupMemberResolver', () => {
  let resolver: GroupMemberResolver
  let groupMemberService: GroupMemberService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GroupMemberResolver,
        UserResolver,
        UserService,
        GroupMemberService,
        { provide: RolesService, useValue: {} },
        { provide: PrismaService, useValue: {} },
        {
          provide: CACHE_MANAGER,
          useFactory: () => ({
            set: () => [],
            get: () => []
          })
        }
      ]
    }).compile()

    resolver = module.get<GroupMemberResolver>(GroupMemberResolver)
    groupMemberService = module.get<GroupMemberService>(GroupMemberService)
  })

  describe('updateGroupMember', () => {
    it('should throw UnprocessableDataException when trying to change own role', async () => {
      const userId = 123
      const groupId = 1
      const mockReq = {
        user: { id: 123 } // 같은 사용자
      }

      await expect(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver.updateGroupMember(userId, groupId, false, mockReq as any)
      ).to.be.rejectedWith(
        UnprocessableDataException,
        'You cannot change your own role'
      )
    })

    it('should allow changing other user role when current user is different', async () => {
      const userId = 123
      const groupId = 1
      const mockReq = {
        user: { id: 456 } // 다른 사용자
      }
      const expectedResult: UserGroup = {
        userId,
        groupId,
        isGroupLeader: false,
        createTime: faker.date.past(),
        updateTime: faker.date.past()
      }

      // Mock the service method
      groupMemberService.updateGroupRole = async () => expectedResult

      const result = await resolver.updateGroupMember(
        userId,
        groupId,
        false,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        mockReq as any
      )

      expect(result).to.deep.equal(expectedResult)
    })
  })
})
