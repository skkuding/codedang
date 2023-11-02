import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Test, type TestingModule } from '@nestjs/testing'
import type { Group } from '@generated'
import type { User } from '@generated'
import { Role } from '@prisma/client'
import type { Cache } from 'cache-manager'
import { expect } from 'chai'
import { spy, stub } from 'sinon'
import { AuthenticatedUser } from '@libs/auth'
import { OPEN_SPACE_ID } from '@libs/constants'
import {
  ConflictFoundException,
  DuplicateFoundException,
  ForbiddenAccessException
} from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import { GroupService } from './group.service'

const userId = 1
const groupId = 2
const input = {
  groupName: 'Group',
  description: 'Group',
  config: {
    showOnList: false,
    allowJoinFromSearch: true,
    allowJoinWithURL: false,
    requireApprovalBeforeJoin: true
  }
}
const group: Group = {
  id: 1,
  createdById: 1,
  createTime: undefined,
  updateTime: undefined,
  userGroup: [
    {
      userId: 1,
      groupId: 2,
      isGroupLeader: true,
      createTime: undefined,
      updateTime: undefined
    },
    {
      userId: 2,
      groupId: 2,
      isGroupLeader: false,
      createTime: undefined,
      updateTime: undefined
    }
  ],
  config: {
    showOnList: false,
    allowJoinFromSearch: false,
    allowJoinWithURL: false,
    requireApprovalBeforeJoin: true
  },
  ...input
}
const { userGroup, ...simpleGroup } = group
const user: User = {
  id: 1,
  username: 'user',
  email: 'example@codedang.com',
  password: 'password',
  role: Role.Admin,
  lastLogin: undefined,
  createTime: undefined,
  updateTime: undefined
}

const db = {
  group: {
    findUnique: stub(),
    findFirst: stub(),
    findMany: stub().resolves([group]),
    create: stub().resolves(group),
    update: stub()
  },
  userGroup: {
    create: stub().resolves(null),
    deleteMany: stub().resolves({ count: userGroup.length })
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
            get: () => [],
            del: () => []
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

  describe('createGroup', () => {
    it('should return created group', async () => {
      db.group.findUnique.resolves(null)

      const res = await service.createGroup(input, userId)
      expect(res).to.deep.equal(group)
    })

    it('should throw error when given group name already exists', async () => {
      db.group.findUnique.resolves(group)

      await expect(service.createGroup(input, userId)).to.be.rejectedWith(
        DuplicateFoundException
      )
    })
  })

  describe('getGroups', () => {
    const group = { ...simpleGroup, memberNum: userGroup.length }

    it('should return groups', async () => {
      const res = await service.getGroups(0, 3)
      expect(res).to.deep.equal([group])
    })
  })

  describe('getGroup', () => {
    const group = {
      ...simpleGroup,
      memberNum: userGroup.length
    }

    it('should return a group without invitation', async () => {
      stub(cache, 'get').resolves(null)

      const res = await service.getGroup(groupId)
      expect(res).to.deep.equal(group)
    })

    it('should return a group with invitation', async () => {
      stub(cache, 'get').resolves('123456')

      const res = await service.getGroup(groupId)
      expect(res).to.deep.equal({ ...group, invitationURL: '/invite/123456' })
    })
  })

  describe('updateGroup', () => {
    const updated = { ...group, groupName: 'Updated' }
    it('should return updated group', async () => {
      db.group.findFirst.resolves(null)
      db.group.update.resolves(updated)

      const res = await service.updateGroup(groupId, input)
      expect(res).to.deep.equal(updated)
    })

    it('should throw error when given group is open space', async () => {
      await expect(
        service.updateGroup(OPEN_SPACE_ID, input)
      ).to.be.rejectedWith(ForbiddenAccessException)
    })

    it('should throw error when given group name exists', async () => {
      db.group.findFirst.resolves(group)

      await expect(service.updateGroup(groupId, input)).to.be.rejectedWith(
        DuplicateFoundException
      )
    })
  })

  describe('deleteGroup', () => {
    const userReq = new AuthenticatedUser(userId, user.username)
    userReq.role = Role.User

    it('should return the number of members that were in the group', async () => {
      const res = await service.deleteGroup(groupId, userReq)
      expect(res).to.deep.equal({ count: userGroup.length })
    })

    it('should throw error when given group is open space', async () => {
      await expect(
        service.deleteGroup(OPEN_SPACE_ID, userReq)
      ).to.be.rejectedWith(ForbiddenAccessException)
    })

    it('should return throw error when either user role is not higher than Admin or the group is not created by the user', async () => {
      const userReq = new AuthenticatedUser(2, user.username)
      db.group.findUnique.resolves(group)

      await expect(service.deleteGroup(groupId, userReq)).to.be.rejectedWith(
        ForbiddenAccessException
      )
    })
  })

  describe('issueInvitation', () => {
    it('should issue invitation for the group', async () => {
      const invitedGroup = {
        ...group,
        config: {
          ...group.config,
          allowJoinWithURL: true
        }
      }
      db.group.findUnique.resolves(invitedGroup)
      stub(cache, 'get').resolves(null)
      const revokeSpy = spy(service, 'revokeInvitation')
      const setSpy = spy(cache, 'set')

      await service.issueInvitation(groupId)
      expect(revokeSpy.calledOnce).to.be.true
      expect(setSpy.calledTwice).to.be.true
    })

    it('should throw error if group config does not allow invitation', async () => {
      db.group.findUnique.resolves(group)
      const setSpy = spy(cache, 'set')

      await expect(service.issueInvitation(groupId)).to.be.rejectedWith(
        ConflictFoundException
      )
      expect(setSpy.called).to.be.false
    })
  })

  describe('revokeInvitation', () => {
    it('should revoke invitation for the group', async () => {
      stub(cache, 'get').resolves('abcdef')
      const delSpy = spy(cache, 'del')

      const res = await service.revokeInvitation(groupId)
      expect(res).to.equal('Revoked invitation code: abcdef')
      expect(delSpy.calledTwice).to.be.true
    })

    it('should throw error if group config does not allow invitation', async () => {
      stub(cache, 'get').resolves(null)
      const delSpy = spy(cache, 'del')

      const res = await service.revokeInvitation(groupId)
      expect(res).to.equal('This group has no invitation to be revoked')
      expect(delSpy.called).to.be.false
    })
  })
})
