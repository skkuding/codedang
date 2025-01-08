import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { ConfigService } from '@nestjs/config'
import { Test, type TestingModule } from '@nestjs/testing'
import {
  Prisma,
  type Assignment,
  type Group,
  type AssignmentRecord
} from '@prisma/client'
import { expect } from 'chai'
import * as dayjs from 'dayjs'
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
import { AssignmentService, type AssignmentResult } from './assignment.service'

const assignmentId = 1
const user01Id = 4
const groupId = 1

const now = dayjs()

const assignment = {
  id: assignmentId,
  createdById: 1,
  groupId,
  title: 'title',
  description: 'description',
  startTime: now.add(-1, 'day').toDate(),
  endTime: now.add(1, 'day').toDate(),
  isVisible: true,
  isJudgeResultVisible: true,
  isRankVisible: true,
  enableCopyPaste: true,
  createTime: now.add(-1, 'day').toDate(),
  updateTime: now.add(-1, 'day').toDate(),
  group: {
    id: groupId,
    groupName: 'group'
  },
  invitationCode: '123456'
} satisfies Assignment & {
  group: Partial<Group>
}

const ongoingAssignments = [
  {
    id: assignment.id,
    group: assignment.group,
    title: assignment.title,
    invitationCode: 'test',
    isJudgeResultVisible: true,
    startTime: now.add(-1, 'day').toDate(),
    endTime: now.add(1, 'day').toDate(),
    participants: 1,
    enableCopyPaste: true
  }
] satisfies Partial<AssignmentResult>[]

const upcomingAssignments = [
  {
    id: assignment.id + 6,
    group: assignment.group,
    title: assignment.title,
    invitationCode: 'test',
    isJudgeResultVisible: true,
    startTime: now.add(1, 'day').toDate(),
    endTime: now.add(2, 'day').toDate(),
    participants: 1,
    enableCopyPaste: true
  }
] satisfies Partial<AssignmentResult>[]

const finishedAssignments = [
  {
    id: assignment.id + 1,
    group: assignment.group,
    title: assignment.title,
    invitationCode: null,
    isJudgeResultVisible: true,
    startTime: now.add(-2, 'day').toDate(),
    endTime: now.add(-1, 'day').toDate(),
    participants: 1,
    enableCopyPaste: true
  }
] satisfies Partial<AssignmentResult>[]

const assignments = [
  ...ongoingAssignments,
  ...finishedAssignments,
  ...upcomingAssignments
] satisfies Partial<AssignmentResult>[]

describe('AssignmentService', () => {
  let service: AssignmentService
  let prisma: PrismaTestService
  let transaction: FlatTransactionClient

  before(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssignmentService,
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
    service = module.get<AssignmentService>(AssignmentService)
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

  it('should be defined', () => {
    expect(service).to.be.ok
  })

  describe('getAssignmentsByGroupId', () => {
    it('should return ongoing, upcoming assignments when userId is undefined', async () => {
      const assignments = await service.getAssignmentsByGroupId(groupId)
      expect(assignments.ongoing).to.have.lengthOf(4)
      expect(assignments.upcoming).to.have.lengthOf(2)
    })

    it('a assignment should contain following fields when userId is undefined', async () => {
      const assignments = await service.getAssignmentsByGroupId(groupId)
      expect(assignments.ongoing[0]).to.have.property('title')
      expect(assignments.ongoing[0]).to.have.property('startTime')
      expect(assignments.ongoing[0]).to.have.property('endTime')
      expect(assignments.ongoing[0]).to.have.property('participants')
      expect(assignments.ongoing[0].group).to.have.property('id')
      expect(assignments.ongoing[0].group).to.have.property('groupName')
      expect(assignments.upcoming[0]).to.have.property('title')
      expect(assignments.upcoming[0]).to.have.property('startTime')
      expect(assignments.upcoming[0]).to.have.property('endTime')
      expect(assignments.upcoming[0]).to.have.property('participants')
      expect(assignments.upcoming[0].group).to.have.property('id')
      expect(assignments.upcoming[0].group).to.have.property('groupName')
    })

    it('should return ongoing, upcoming, registered ongoing, registered upcoming assignments when userId is provided', async () => {
      const assignments = await service.getAssignmentsByGroupId(
        groupId,
        user01Id
      )
      expect(assignments.ongoing).to.have.lengthOf(2)
      expect(assignments.upcoming).to.have.lengthOf(1)
      expect(assignments.registeredOngoing).to.have.lengthOf(2)
      expect(assignments.registeredUpcoming).to.have.lengthOf(2)
    })

    it('a assignment should contain following fields when userId is provided', async () => {
      const assignments = await service.getAssignmentsByGroupId(
        groupId,
        user01Id
      )
      expect(assignments.ongoing[0]).to.have.property('title')
      expect(assignments.ongoing[0]).to.have.property('startTime')
      expect(assignments.ongoing[0]).to.have.property('endTime')
      expect(assignments.ongoing[0]).to.have.property('participants')
      expect(assignments.ongoing[0].group).to.have.property('id')
      expect(assignments.ongoing[0].group).to.have.property('groupName')
      expect(assignments.upcoming[0]).to.have.property('title')
      expect(assignments.upcoming[0]).to.have.property('startTime')
      expect(assignments.upcoming[0]).to.have.property('endTime')
      expect(assignments.upcoming[0]).to.have.property('participants')
      expect(assignments.upcoming[0].group).to.have.property('id')
      expect(assignments.upcoming[0].group).to.have.property('groupName')
      expect(assignments.registeredOngoing[0]).to.have.property('title')
      expect(assignments.registeredOngoing[0]).to.have.property('startTime')
      expect(assignments.registeredOngoing[0]).to.have.property('endTime')
      expect(assignments.registeredOngoing[0]).to.have.property('participants')
      expect(assignments.registeredOngoing[0].group).to.have.property('id')
      expect(assignments.registeredOngoing[0].group).to.have.property(
        'groupName'
      )
      expect(assignments.registeredUpcoming[0]).to.have.property('title')
      expect(assignments.registeredUpcoming[0]).to.have.property('startTime')
      expect(assignments.registeredUpcoming[0]).to.have.property('endTime')
      expect(assignments.registeredUpcoming[0]).to.have.property('participants')
      expect(assignments.registeredUpcoming[0].group).to.have.property('id')
      expect(assignments.registeredUpcoming[0].group).to.have.property(
        'groupName'
      )
    })
  })

  describe('getRegisteredOngoingUpcomingAssignments', () => {
    it('should return registeredOngoing, registeredUpcoming assignments', async () => {
      const assignments = await service.getRegisteredOngoingUpcomingAssignments(
        groupId,
        user01Id
      )
      expect(assignments.registeredOngoing).to.have.lengthOf(2)
      expect(assignments.registeredUpcoming).to.have.lengthOf(2)
    })

    it('a assignment should contain following fields', async () => {
      const assignments = await service.getRegisteredOngoingUpcomingAssignments(
        groupId,
        user01Id
      )
      expect(assignments.registeredOngoing[0]).to.have.property('title')
      expect(assignments.registeredOngoing[0]).to.have.property('startTime')
      expect(assignments.registeredOngoing[0]).to.have.property('endTime')
      expect(assignments.registeredOngoing[0]).to.have.property('participants')
      expect(assignments.registeredOngoing[0].group).to.have.property('id')
      expect(assignments.registeredOngoing[0].group).to.have.property(
        'groupName'
      )
      expect(assignments.registeredUpcoming[0]).to.have.property('title')
      expect(assignments.registeredUpcoming[0]).to.have.property('startTime')
      expect(assignments.registeredUpcoming[0]).to.have.property('endTime')
      expect(assignments.registeredUpcoming[0]).to.have.property('participants')
      expect(assignments.registeredUpcoming[0].group).to.have.property('id')
      expect(assignments.registeredUpcoming[0].group).to.have.property(
        'groupName'
      )
    })

    it("shold return assignments whose title contains '신입생'", async () => {
      const keyword = '신입생'
      const assignments = await service.getRegisteredOngoingUpcomingAssignments(
        groupId,
        user01Id,
        keyword
      )
      expect(
        assignments.registeredOngoing.map((assignment) => assignment.title)
      ).to.deep.equals(['24년도 소프트웨어학과 신입생 입학 테스트2'])
    })
  })

  describe('getRegisteredAssignmentIds', async () => {
    it("should return an array of assignment's id user01 registered", async () => {
      const assignmentIds = await service.getRegisteredAssignmentIds(user01Id)
      const registeredAssignmentIds = [1, 3, 5, 7, 9, 11, 13, 15, 17]
      assignmentIds.sort((a, b) => a - b)
      expect(assignmentIds).to.deep.equal(registeredAssignmentIds)
    })
  })

  describe('getRegisteredFinishedAssignments', async () => {
    it('should return only 2 assignments that user01 registered but finished', async () => {
      const takeNum = 4
      const assignments = await service.getRegisteredFinishedAssignments(
        null,
        takeNum,
        groupId,
        user01Id
      )
      expect(assignments.data).to.have.lengthOf(takeNum)
    })

    it('should return a assignment array which starts with id 9', async () => {
      const takeNum = 2
      const prevCursor = 11
      const assignments = await service.getRegisteredFinishedAssignments(
        prevCursor,
        takeNum,
        groupId,
        user01Id
      )
      expect(assignments.data[0].id).to.equals(9)
    })

    it('a assignment should contain following fields', async () => {
      const assignments = await service.getRegisteredFinishedAssignments(
        null,
        10,
        groupId,
        user01Id
      )
      expect(assignments.data[0]).to.have.property('title')
      expect(assignments.data[0]).to.have.property('startTime')
      expect(assignments.data[0]).to.have.property('endTime')
      expect(assignments.data[0]).to.have.property('participants')
      expect(assignments.data[0].group).to.have.property('id')
      expect(assignments.data[0].group).to.have.property('groupName')
    })

    it("shold return assignments whose title contains '낮'", async () => {
      const keyword = '낮'
      const assignments = await service.getRegisteredFinishedAssignments(
        null,
        10,
        groupId,
        user01Id,
        keyword
      )
      expect(
        assignments.data.map((assignment) => assignment.title)
      ).to.deep.equals(['소프트의 낮'])
    })
  })

  describe('getFinishedAssignmentsByGroupId', () => {
    it('should return finished assignments', async () => {
      const assignments = await service.getFinishedAssignmentsByGroupId(
        null,
        null,
        10,
        groupId
      )
      const assignmentIds = assignments.data
        .map((c) => c.id)
        .sort((a, b) => a - b)
      const finishedAssignmentIds = [6, 7, 8, 9, 10, 11, 12, 13]
      expect(assignmentIds).to.deep.equal(finishedAssignmentIds)
    })
  })

  describe('filterOngoing', () => {
    it('should return ongoing assignments of the group', () => {
      expect(service.filterOngoing(assignments)).to.deep.equal(
        ongoingAssignments
      )
    })
  })

  describe('filterUpcoming', () => {
    it('should return upcoming assignments of the group', () => {
      expect(service.filterUpcoming(assignments)).to.deep.equal(
        upcomingAssignments
      )
    })
  })

  describe('getAssignment', () => {
    it('should throw error when assignment does not exist', async () => {
      await expect(
        service.getAssignment(999, groupId, user01Id)
      ).to.be.rejectedWith(EntityNotExistException)
    })

    it('should return assignment', async () => {
      expect(await service.getAssignment(assignmentId, groupId, user01Id)).to.be
        .ok
    })
  })

  describe('createAssignmentRecord', () => {
    let assignmentRecordId = -1
    const invitationCode = '123456'
    const invalidInvitationCode = '000000'

    it('should throw error when the invitation code does not match', async () => {
      await expect(
        service.createAssignmentRecord(1, user01Id, invalidInvitationCode)
      ).to.be.rejectedWith(ConflictFoundException)
    })

    it('should throw error when the assignment does not exist', async () => {
      await expect(
        service.createAssignmentRecord(999, user01Id, invitationCode)
      ).to.be.rejectedWith(Prisma.PrismaClientKnownRequestError)
    })

    it('should throw error when user is participated in assignment again', async () => {
      await expect(
        service.createAssignmentRecord(assignmentId, user01Id, invitationCode)
      ).to.be.rejectedWith(ConflictFoundException)
    })

    it('should throw error when assignment is not ongoing', async () => {
      await expect(
        service.createAssignmentRecord(8, user01Id, invitationCode)
      ).to.be.rejectedWith(ConflictFoundException)
    })

    it('should register to a assignment successfully', async () => {
      const assignmentRecord = await service.createAssignmentRecord(
        2,
        user01Id,
        invitationCode
      )
      assignmentRecordId = assignmentRecord.id
      expect(
        await transaction.assignmentRecord.findUnique({
          where: { id: assignmentRecordId }
        })
      ).to.deep.equals(assignmentRecord)
    })
  })

  describe('deleteAssignmentRecord', () => {
    let assignmentRecord: AssignmentRecord | { id: number } = { id: -1 }

    afterEach(async () => {
      try {
        await transaction.assignmentRecord.delete({
          where: { id: assignmentRecord.id }
        })
      } catch (error) {
        if (
          !(
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === 'P2025'
          )
        ) {
          throw error
        }
      }
    })

    it('should return deleted assignment record', async () => {
      const newlyRegisteringAssignmentId = 16
      assignmentRecord = await transaction.assignmentRecord.create({
        data: {
          assignmentId: newlyRegisteringAssignmentId,
          userId: user01Id,
          acceptedProblemNum: 0,
          score: 0,
          totalPenalty: 0
        }
      })

      expect(
        await service.deleteAssignmentRecord(
          newlyRegisteringAssignmentId,
          user01Id
        )
      ).to.deep.equal(assignmentRecord)
    })

    it('should throw error when assignment does not exist', async () => {
      await expect(
        service.deleteAssignmentRecord(999, user01Id)
      ).to.be.rejectedWith(EntityNotExistException)
    })

    it('should throw error when assignment record does not exist', async () => {
      await expect(
        service.deleteAssignmentRecord(16, user01Id)
      ).to.be.rejectedWith(EntityNotExistException)
    })

    it('should throw error when assignment is ongoing', async () => {
      await expect(
        service.deleteAssignmentRecord(assignmentId, user01Id)
      ).to.be.rejectedWith(ForbiddenAccessException)
    })
  })
})
