import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { ConfigService } from '@nestjs/config'
import { Test, type TestingModule } from '@nestjs/testing'
import {
  Prisma,
  type Assignment,
  type Group,
  type AssignmentRecord,
  GroupType
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
  week: 1,
  group: {
    id: groupId,
    groupName: 'group',
    groupType: GroupType.Course
  },
  autoFinalizeScore: true,
  isFinalScoreVisible: true
} satisfies Assignment & {
  group: Partial<Group>
}

const ongoingAssignments = [
  {
    id: assignment.id,
    group: assignment.group,
    title: assignment.title,
    isJudgeResultVisible: true,
    startTime: now.add(-1, 'day').toDate(),
    endTime: now.add(1, 'day').toDate(),
    week: 1,
    participants: 1,
    enableCopyPaste: true
  }
] satisfies Partial<AssignmentResult>[]

const upcomingAssignments = [
  {
    id: assignment.id + 6,
    group: assignment.group,
    title: assignment.title,
    isJudgeResultVisible: true,
    startTime: now.add(1, 'day').toDate(),
    endTime: now.add(2, 'day').toDate(),
    week: 1,
    participants: 1,
    enableCopyPaste: true
  }
] satisfies Partial<AssignmentResult>[]

const finishedAssignments = [
  {
    id: assignment.id + 1,
    group: assignment.group,
    title: assignment.title,
    isJudgeResultVisible: true,
    startTime: now.add(-2, 'day').toDate(),
    endTime: now.add(-1, 'day').toDate(),
    week: 1,
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
    it('should return ongoing, upcoming, registered ongoing, registered upcoming assignments when userId is provided', async () => {
      const assignments = await service.getAssignments(groupId, user01Id)
      expect(assignments).to.have.lengthOf(14)
    })

    it('a assignment should contain following fields when userId is provided', async () => {
      const assignments = await service.getAssignments(groupId, user01Id)
      expect(assignments[0]).to.have.property('title')
      expect(assignments[0]).to.have.property('startTime')
      expect(assignments[0]).to.have.property('endTime')
      expect(assignments[0]).to.have.property('id')
      expect(assignments[0].group).to.have.property('id')
      expect(assignments[0].group).to.have.property('groupName')
    })
  })

  describe('getAssignment', () => {
    it('should throw error when assignment does not exist', async () => {
      await expect(service.getAssignment(999, user01Id)).to.be.rejectedWith(
        ForbiddenAccessException
      )
    })

    it('should return assignment', async () => {
      expect(await service.getAssignment(assignmentId, user01Id)).to.be.ok
    })
  })

  describe('createAssignmentRecord', () => {
    let assignmentRecordId = -1

    it('should throw error when the assignment does not exist', async () => {
      await expect(
        service.createAssignmentRecord(999, user01Id)
      ).to.be.rejectedWith(Prisma.PrismaClientKnownRequestError)
    })

    it('should throw error when user is participated in assignment again', async () => {
      await expect(
        service.createAssignmentRecord(assignmentId, user01Id)
      ).to.be.rejectedWith(ConflictFoundException)
    })

    it('should throw error when assignment is not ongoing', async () => {
      await expect(
        service.createAssignmentRecord(8, user01Id)
      ).to.be.rejectedWith(ConflictFoundException)
    })

    it('should register to a assignment successfully', async () => {
      const assignmentRecord = await service.createAssignmentRecord(2, user01Id)
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
