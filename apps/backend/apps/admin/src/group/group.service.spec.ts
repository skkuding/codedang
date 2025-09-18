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
import {
  ConflictFoundException,
  EntityNotExistException,
  ForbiddenAccessException,
  UnprocessableDataException
} from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import {
  GroupService,
  InvitationService,
  WhitelistService
} from './group.service'

const userId = faker.number.int()
const groupId = faker.number.int()
const courseInput = {
  courseTitle: 'Programming Basics',
  description: 'Group',
  courseNum: 'SWE3033',
  classNum: 42,
  professor: '김우주',
  semester: '2025 Spring',
  week: 16,
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

const courseInfo = {
  groupId: 1,
  courseNum: 'SWE3033',
  classNum: 42,
  professor: '김우주',
  semester: '2025 Spring',
  week: 16,
  email: 'johndoe@example.com',
  website: 'https://example.com',
  office: 'Room 301',
  phoneNum: '010-3333-2222'
}

const group = {
  id: 1,
  createTime: faker.date.past(),
  updateTime: faker.date.past(),
  userGroup: [
    {
      userId: faker.number.int(),
      groupId: 1,
      isGroupLeader: true,
      createTime: faker.date.past(),
      updateTime: faker.date.past()
    },
    {
      userId: faker.number.int(),
      groupId: 1,
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
  groupType: GroupType.Course,
  GroupWhitelist: [
    {
      groupId: faker.number.int(),
      studentId: faker.string.numeric()
    },
    {
      groupId: faker.number.int(),
      studentId: faker.string.numeric()
    }
  ],
  courseInfo
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
  college: 'none',
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
    findUniqueOrThrow: stub(),
    findFirst: stub(),
    findMany: stub().resolves([group]),
    create: stub().resolves(group),
    update: stub(),
    delete: stub()
  },
  userGroup: {
    create: stub().resolves(null),
    findUnique: stub(),
    findMany: stub()
  },
  user: {
    findUnique: stub()
  },

  groupWhitelist: {
    findMany: stub(),
    createMany: stub(),
    deleteMany: stub()
  },
  assignment: {
    create: stub(),
    findFirst: stub(),
    findMany: stub()
  },
  assignmentProblem: {
    create: stub(),
    findMany: stub()
  },
  assignmentRecord: {
    createMany: stub()
  },
  assignmentProblemRecord: {
    createMany: stub()
  },
  getPaginator: PrismaService.prototype.getPaginator,
  $transaction: stub().callsFake(async (input) => {
    if (Array.isArray(input)) {
      return input.map((query) => {
        if (typeof query === 'function') {
          return query(db)
        }
        return query
      })
    } else if (typeof input === 'function') {
      return input(db)
    }
    throw new Error('Invalid transaction input')
  })
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
    const userReq = new AuthenticatedUser(userId, user.username, user.role)
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

  describe('getGroupsUserLead', () => {
    it('should return groups user leads', async () => {
      const userGroups = [
        {
          group: {
            id: 1,
            groupName: 'Test Group',
            groupType: GroupType.Course,
            courseInfo: null,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            _count: { userGroup: 3 }
          }
        }
      ]

      db.userGroup.findMany.resolves(userGroups)

      const result = await service.getGroupsUserLead(userId, GroupType.Course)
      expect(result).to.deep.equal([
        {
          id: 1,
          groupName: 'Test Group',
          groupType: GroupType.Course,
          courseInfo: null,
          memberNum: 3,
          // eslint-disable-next-line @typescript-eslint/naming-convention
          _count: { userGroup: 3 }
        }
      ])
    })

    it('should return empty array when user leads no groups', async () => {
      db.userGroup.findMany.resolves([])

      const result = await service.getGroupsUserLead(userId, GroupType.Course)
      expect(result).to.deep.equal([])
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
  })

  describe('deleteGroup', () => {
    it('should throw error when either user is not group leader or their role is higher than Admin', async () => {
      const userReq = new AuthenticatedUser(
        userId,
        user.username,
        Role.SuperAdmin
      )
      db.userGroup.findUnique.resolves(null)

      await expect(
        service.deleteGroup(groupId, GroupType.Course, userReq)
      ).to.be.rejectedWith(ForbiddenAccessException)
    })
  })

  describe('duplicateCourse', () => {
    it('should throw NotFoundException if user does not exist', async () => {
      db.user.findUnique.resolves(null)

      await expect(service.duplicateCourse(groupId, userId)).to.be.rejectedWith(
        EntityNotExistException,
        'User not found'
      )
    })

    it('should throw ForbiddenAccessException if user cannot create course', async () => {
      db.user.findUnique.resolves({ canCreateCourse: false })

      await expect(service.duplicateCourse(groupId, userId)).to.be.rejectedWith(
        ForbiddenAccessException,
        'No Access to create course'
      )
    })

    it('should throw UnprocessableDataException if group is not a course', async () => {
      db.user.findUnique.resolves({ canCreateCourse: true })
      db.group.findUniqueOrThrow.resolves({ courseInfo: null })

      await expect(service.duplicateCourse(groupId, userId)).to.be.rejectedWith(
        UnprocessableDataException,
        'Invalid groupId for a course'
      )
    })

    it('should duplicate course successfully', async () => {
      db.user.findUnique.resolves({ canCreateCourse: true })
      const groupWithAssignment = {
        ...group,
        assignment: [{ id: 999 }, { id: 1000 }]
      }

      db.assignmentProblem.findMany.resolves([
        { order: 1, problemId: 1, score: 100 }
      ])
      db.group.findUniqueOrThrow.resolves(groupWithAssignment)
      db.group.create.resolves(groupWithAssignment)

      db.assignment.findFirst.onFirstCall().resolves({
        id: 999,
        groupId,
        startTime: new Date(Date.now() - 1000),
        endTime: new Date(Date.now() + 1000),
        createTime: new Date(),
        updateTime: new Date(),
        title: 'Original Assignment'
      })

      db.assignment.findFirst.onSecondCall().resolves({
        id: 1000,
        groupId,
        startTime: new Date(Date.now() - 1000),
        endTime: new Date(Date.now() + 1000),
        createTime: new Date(),
        updateTime: new Date(),
        title: 'Original Assignment'
      })

      db.assignment.create.onFirstCall().resolves({
        id: 999
      })
      db.assignment.create.onSecondCall().resolves({
        id: 1000
      })

      const result = await service.duplicateCourse(groupId, userId)

      expect(result).to.deep.equal({
        duplicatedCourse: groupWithAssignment,
        originAssignments: [999, 1000],
        copiedAssignments: [999, 1000]
      })
    })
  })
})

describe('InvitationService', () => {
  let service: InvitationService
  let cache: Cache

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvitationService,
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

    service = module.get<InvitationService>(InvitationService)
    cache = module.get<Cache>(CACHE_MANAGER)
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

  describe('inviteUser', () => {
    it('should invite user for the group', async () => {
      db.userGroup.create.resolves({
        userId,
        groupId,
        isGroupLeader: false
      })
      db.userGroup.findUnique.resolves(null)
      db.assignment.findMany.resolves([{ assignmentProblem: [] }])

      const res = await service.inviteUser(groupId, userId, false)

      expect(res).to.deep.equal({
        userId,
        groupId,
        isGroupLeader: false
      })
    })
  })

  it('should throw error when user or group is not found', async () => {
    db.group.findUnique.resolves(null)

    await expect(service.inviteUser(groupId, userId, false)).to.be.rejectedWith(
      EntityNotExistException
    )
  })

  it('should throw error when user is already a member', async () => {
    db.group.findUnique.resolves(group)
    db.userGroup.findUnique.resolves(true)

    await expect(service.inviteUser(groupId, userId, false)).to.be.rejectedWith(
      UnprocessableDataException
    )
  })
})

describe('WhitelistService', () => {
  let service: WhitelistService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WhitelistService,
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

    service = module.get<WhitelistService>(WhitelistService)
  })

  describe('getWhitelist', () => {
    it('should return student Ids in the whitelist', async () => {
      const groupId = faker.number.int()
      const mockData = [
        { studentId: faker.string.numeric() },
        { studentId: faker.string.numeric() }
      ]
      db.groupWhitelist.findMany.resolves(mockData)
      const res = await service.getWhitelist(groupId)
      expect(res).to.deep.equal(mockData.map((item) => item.studentId))
      expect(
        db.groupWhitelist.findMany.calledWith({
          where: { groupId },
          select: { studentId: true }
        })
      ).to.be.true
    })
  })

  describe('createWhitelist', () => {
    it('should create a new whitelist and return the count', async () => {
      const groupId = faker.number.int()
      const studentIds: [string] = [faker.string.numeric()]
      const mockCount = { count: studentIds.length }

      db.groupWhitelist.createMany.resolves(mockCount)
      db.groupWhitelist.deleteMany.resolves({ count: 0 })

      const result = await service.createWhitelist(groupId, studentIds)
      expect(result).to.equal(studentIds.length)

      expect(
        db.groupWhitelist.deleteMany.calledWith({
          where: { groupId }
        })
      ).to.be.true

      expect(
        db.groupWhitelist.createMany.calledWith({
          data: studentIds.map((studentId) => ({ groupId, studentId }))
        })
      ).to.be.true
    })

    it('should throw an error if there are duplicate student IDs', async () => {
      const groupId = faker.number.int()
      const studentIds: [string] = [faker.string.numeric()]
      const error = { code: 'P2002' }

      db.groupWhitelist.createMany.rejects(error)

      await expect(
        service.createWhitelist(groupId, studentIds)
      ).to.be.rejectedWith(UnprocessableDataException)
    })

    it('should throw an error if there is invalid student ID', async () => {
      const groupId = faker.number.int()
      const studentIds: [string] = [faker.string.numeric()]
      const error = { code: 'P2003' }

      db.groupWhitelist.createMany.rejects(error)

      await expect(
        service.createWhitelist(groupId, studentIds)
      ).to.be.rejectedWith(UnprocessableDataException)
    })
  })

  describe('deleteWhitelist', () => {
    it('should delete whitelist entries and return count', async () => {
      const groupId = faker.number.int()
      const mockCount = { count: 2 }

      db.groupWhitelist.deleteMany.resolves(mockCount)

      const res = await service.deleteWhitelist(groupId)
      expect(res).to.equal(2)
      expect(
        db.groupWhitelist.deleteMany.calledWith({
          where: { groupId }
        })
      ).to.be.true
    })
  })
})
