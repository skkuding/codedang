import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Test, type TestingModule } from '@nestjs/testing'
import { GroupType, type Group } from '@generated'
import type { User } from '@generated'
import { faker } from '@faker-js/faker'
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

const userId = faker.number.int()
const groupId = faker.number.int()
const courseInput = {
  courseTitle: 'Programming Basics',
  description: 'Group',
  courseNum: 'SWE3033',
  classNum: 42,
  professor: '김우주',
  semester: '2025 Spring',
  email: 'johndoe@example.com',
  website: 'https://example.com',
  office: 'Room 301',
  config: {
    showOnList: false,
    allowJoinFromSearch: true,
    allowJoinWithURL: false,
    requireApprovalBeforeJoin: true
  },
  groupType: GroupType.Course
}

const group = {
  id: faker.number.int(),
  createTime: faker.date.past(),
  updateTime: faker.date.past(),
  userGroup: [
    {
      userId: faker.number.int(),
      groupId: faker.number.int(),
      isGroupLeader: true,
      createTime: faker.date.past(),
      updateTime: faker.date.past()
    },
    {
      userId: faker.number.int(),
      groupId: faker.number.int(),
      isGroupLeader: false,
      createTime: faker.date.past(),
      updateTime: faker.date.past()
    }
  ],
  groupName: 'Programming Basics',
  description: 'Group',
  config: {
    showOnList: false,
    allowJoinFromSearch: true,
    allowJoinWithURL: false,
    requireApprovalBeforeJoin: true
  },
  groupType: GroupType.Course
} satisfies Group

const { userGroup, ...simpleGroup } = group

const user: User = {
  id: 1,
  username: 'user',
  email: 'example@codedang.com',
  password: 'password',
  role: Role.Admin,
  lastLogin: faker.date.past(),
  createTime: faker.date.past(),
  updateTime: faker.date.past(),
  studentId: '0000000000',
  major: 'none',
  canCreateContest: true,
  canCreateCourse: true
}

const userWithOutCanCreate: User = {
  ...user,
  canCreateCourse: false,
  canCreateContest: false
}

const db = {
  group: {
    findUnique: stub(),
    findFirst: stub(),
    findMany: stub().resolves([group]),
    create: stub().resolves(group),
    update: stub(),
    delete: stub()
  },
  userGroup: {
    create: stub().resolves(null),
    findUnique: stub()
  },
  user: {
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

  describe('createCourse', () => {
    const userReq = new AuthenticatedUser(userId, user.username)
    it('should return created group', async () => {
      db.user.findUnique.resolves(user)

      const res = await service.createCourse(courseInput, userReq)
      expect(res).to.deep.equal(group)
    })

    it('should throw error when user does not have can create course', async () => {
      db.user.findUnique.resolves(userWithOutCanCreate)
      expect(service.createCourse(courseInput, userReq)).to.be.rejectedWith(
        ForbiddenAccessException
      )
    })
  })

  describe('getCourses', () => {
    const group = { ...simpleGroup, memberNum: userGroup.length }

    it('should return groups', async () => {
      const res = await service.getCourses(0, 3)
      expect(res).to.deep.equal([group])
    })
  })

  describe('getCourse', () => {
    const groupWithLength = {
      ...group,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      _count: {
        userGroup: userGroup.length
      }
    }
    it('should return a course without invitation', async () => {
      stub(cache, 'get').resolves(null)
      db.group.findUnique.resolves(groupWithLength)

      const res = await service.getCourse(groupId)
      expect(res).to.deep.equal({
        ...groupWithLength,
        memberNum: userGroup.length
      })
    })

    it('should return a course with invitation', async () => {
      stub(cache, 'get').resolves('123456')
      db.group.findUnique.resolves(groupWithLength)

      const res = await service.getCourse(groupId)
      expect(res).to.deep.equal({
        ...groupWithLength,
        memberNum: userGroup.length,
        invitation: '123456'
      })
    })
  })

  describe('updateCourse', () => {
    const updated = { ...group, groupName: 'Updated' }
    it('should return updated group', async () => {
      db.group.findFirst.resolves(null)
      db.group.update.resolves(updated)

      const res = await service.updateCourse(groupId, courseInput)
      expect(res).to.deep.equal(updated)
    })

    it('should throw error when given group is open space', async () => {
      await expect(
        service.updateCourse(OPEN_SPACE_ID, courseInput)
      ).to.be.rejectedWith(ForbiddenAccessException)
    })
  })

  describe('deleteCourse', () => {
    const userReq = new AuthenticatedUser(userId, user.username)
    userReq.role = Role.User

    it('should return the number of members that were in the group', async () => {
      db.userGroup.findUnique.resolves({ isGroupLeader: true })

      const res = await service.deleteCourse(groupId, userReq)
      expect(res).to.deep.equal({ count: userGroup.length })
    })

    it('should throw error when either user is not group leader or their role is higher than Admin', async () => {
      const userReq = new AuthenticatedUser(2, user.username)
      db.userGroup.findUnique.resolves(null)

      await expect(service.deleteCourse(groupId, userReq)).to.be.rejectedWith(
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
