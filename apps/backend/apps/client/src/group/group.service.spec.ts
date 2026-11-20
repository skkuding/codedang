import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { ConfigService } from '@nestjs/config'
import { Test, type TestingModule } from '@nestjs/testing'
import { GroupType, Prisma } from '@prisma/client'
import type { Cache } from 'cache-manager'
import { expect } from 'chai'
import * as chai from 'chai'
import chaiExclude from 'chai-exclude'
import * as sinon from 'sinon'
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
import { CourseService, GroupService } from './group.service'
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

describe('CourseService', () => {
  let service: CourseService
  let prisma: PrismaTestService
  let transaction: FlatTransactionClient

  before(async function () {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CourseService,
        PrismaTestService,
        {
          provide: PrismaService,
          useExisting: PrismaTestService
        }
      ]
    }).compile()
    service = module.get<CourseService>(CourseService)
    prisma = module.get<PrismaTestService>(PrismaTestService)
  })

  beforeEach(async () => {
    transaction = await prisma.$begin()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(service as any).prisma = transaction
  })

  afterEach(async () => {
    await transaction.$rollback()
  })

  after(async () => {
    await prisma.$disconnect()
  })

  describe('createCourseQnAComment', () => {
    // seed: 그룹 2(정보보호개론)는 Course이며 user01은 리더, user02/user03은 일반 멤버, contestAdmin은 비멤버
    const courseId = 2
    const privateOrder = 1001
    const publicOrder = 1002
    const content = 'comment for authorization test'

    let leaderId: number
    let authorId: number
    let memberId: number
    let nonMemberId: number
    let privateQnAId: number
    let publicQnAId: number

    const getUserId = async (username: string) =>
      (
        await transaction.user.findUniqueOrThrow({
          where: { username },
          select: { id: true }
        })
      ).id

    beforeEach(async () => {
      leaderId = await getUserId('user01')
      authorId = await getUserId('user02')
      memberId = await getUserId('user03')
      nonMemberId = await getUserId('contestAdmin')

      // 거부 시 상태가 바뀌지 않았는지 구분할 수 있도록 기본값(false, 빈 readBy)과 다른 상태로 만든다.
      const createQnA = (order: number, isPrivate: boolean) =>
        transaction.courseQnA.create({
          data: {
            groupId: courseId,
            createdById: authorId,
            order,
            title: `authorization test qna ${order}`,
            content: 'authorization test qna content',
            isPrivate,
            isResolved: true,
            readBy: [authorId]
          }
        })
      privateQnAId = (await createQnA(privateOrder, true)).id
      publicQnAId = (await createQnA(publicOrder, false)).id
    })

    const expectUnchanged = async (qnaId: number) => {
      const qna = await transaction.courseQnA.findUniqueOrThrow({
        where: { id: qnaId },
        select: { isResolved: true, readBy: true }
      })
      expect(qna).to.deep.equal({ isResolved: true, readBy: [authorId] })
      expect(
        await transaction.courseQnAComment.count({
          where: { courseQnAId: qnaId }
        })
      ).to.equal(0)
    }

    const expectCommented = async (
      qnaId: number,
      commenterId: number,
      isCourseStaff: boolean
    ) => {
      const comments = await transaction.courseQnAComment.findMany({
        where: { courseQnAId: qnaId },
        select: { createdById: true, isCourseStaff: true, order: true }
      })
      expect(comments).to.deep.equal([
        { createdById: commenterId, isCourseStaff, order: 1 }
      ])
      const qna = await transaction.courseQnA.findUniqueOrThrow({
        where: { id: qnaId },
        select: { isResolved: true, readBy: true }
      })
      expect(qna).to.deep.equal({
        isResolved: isCourseStaff,
        readBy: [commenterId]
      })
    }

    it('should forbid a non-member from commenting on a public QnA', async () => {
      await expect(
        service.createCourseQnAComment(
          nonMemberId,
          courseId,
          publicOrder,
          content
        )
      ).to.be.rejectedWith(ForbiddenAccessException)
      await expectUnchanged(publicQnAId)
    })

    it('should forbid a non-member from commenting on a private QnA', async () => {
      await expect(
        service.createCourseQnAComment(
          nonMemberId,
          courseId,
          privateOrder,
          content
        )
      ).to.be.rejectedWith(ForbiddenAccessException)
      await expectUnchanged(privateQnAId)
    })

    it("should forbid a member from commenting on another user's private QnA", async () => {
      await expect(
        service.createCourseQnAComment(
          memberId,
          courseId,
          privateOrder,
          content
        )
      ).to.be.rejectedWith(ForbiddenAccessException)
      await expectUnchanged(privateQnAId)
    })

    it('should forbid the author who left the course', async () => {
      await transaction.userGroup.delete({
        where: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          userId_groupId: { userId: authorId, groupId: courseId }
        }
      })

      await expect(
        service.createCourseQnAComment(
          authorId,
          courseId,
          privateOrder,
          content
        )
      ).to.be.rejectedWith(ForbiddenAccessException)
      await expectUnchanged(privateQnAId)
    })

    it('should forbid a non-member even if the QnA does not exist', async () => {
      await expect(
        service.createCourseQnAComment(nonMemberId, courseId, 99999, content)
      ).to.be.rejectedWith(ForbiddenAccessException)
    })

    it('should allow the author to comment on own private QnA', async () => {
      const comment = await service.createCourseQnAComment(
        authorId,
        courseId,
        privateOrder,
        content
      )

      expect(comment.content).to.equal(content)
      await expectCommented(privateQnAId, authorId, false)
    })

    it('should allow a course leader to comment on a private QnA', async () => {
      await service.createCourseQnAComment(
        leaderId,
        courseId,
        privateOrder,
        content
      )

      await expectCommented(privateQnAId, leaderId, true)
    })

    it('should allow a member to comment on a public QnA', async () => {
      await service.createCourseQnAComment(
        memberId,
        courseId,
        publicOrder,
        content
      )

      await expectCommented(publicQnAId, memberId, false)
    })

    it('should throw EntityNotExistException when the QnA does not exist', async () => {
      await expect(
        service.createCourseQnAComment(memberId, courseId, 99999, content)
      ).to.be.rejectedWith(EntityNotExistException)
    })

    it('should throw EntityNotExistException when the course does not exist', async () => {
      await expect(
        service.createCourseQnAComment(memberId, 99999, privateOrder, content)
      ).to.be.rejectedWith(EntityNotExistException)
    })

    it('should not resolve a QnA of another course with the same order', async () => {
      // seed: 그룹 1의 order 2 QnA는 존재하지만 그룹 2에는 없다
      await expect(
        service.createCourseQnAComment(memberId, courseId, 2, content)
      ).to.be.rejectedWith(EntityNotExistException)
    })
  })
})
