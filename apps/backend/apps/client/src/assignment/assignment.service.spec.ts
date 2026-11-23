import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { ConfigService } from '@nestjs/config'
import { Test, type TestingModule } from '@nestjs/testing'
import { expect } from 'chai'
import { EntityNotExistException } from '@libs/exception'
import {
  PrismaService,
  PrismaTestService,
  type FlatTransactionClient
} from '@libs/prisma'
import { AssignmentService } from './assignment.service'

const assignmentId = 1
const user01Id = 7
const groupId = 1

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
      const assignments = await service.getAssignments(groupId, false)
      expect(assignments).to.have.lengthOf(14)
    })

    it('a assignment should contain following fields when userId is provided', async () => {
      const assignments = await service.getAssignments(groupId, false)
      expect(assignments[0]).to.have.property('title')
      expect(assignments[0]).to.have.property('startTime')
      expect(assignments[0]).to.have.property('endTime')
      expect(assignments[0]).to.have.property('dueTime')
      expect(assignments[0]).to.have.property('id')
      expect(assignments[0].group).to.have.property('id')
      expect(assignments[0].group).to.have.property('groupName')
    })

    it('should filter assignments by month and year when provided', async () => {
      // Test with current month and year (should work with test data)
      const currentDate = new Date()
      const currentMonth = currentDate.getMonth() + 1
      const currentYear = currentDate.getFullYear()

      const filteredAssignments = await service.getAssignments(
        groupId,
        false,
        currentMonth,
        currentYear
      )

      // Check that all returned assignments have dueTime in the specified month/year
      for (const assignment of filteredAssignments) {
        const dueDate = new Date(assignment.dueTime ?? assignment.endTime)
        expect(dueDate.getMonth() + 1).to.equal(currentMonth)
        expect(dueDate.getFullYear()).to.equal(currentYear)
      }
    })

    it('should return empty array when filtering by non-existent month/year', async () => {
      // Test with a future year that shouldn't have any assignments
      const futureYear = new Date().getFullYear() + 1000
      const assignments = await service.getAssignments(
        groupId,
        false,
        1,
        futureYear
      )
      expect(assignments).to.have.lengthOf(0)
    })
  })

  describe('getAssignment', () => {
    it('should throw error when assignment does not exist', async () => {
      await expect(service.getAssignment(999, user01Id)).to.be.rejectedWith(
        EntityNotExistException
      )
    })

    it('should return assignment', async () => {
      expect(await service.getAssignment(assignmentId, user01Id)).to.be.ok
    })
  })

  describe('getMyAssignmentsSummary', () => {
    const groupId = 1
    // Seed data contains many pre-existing isExercise:false assignments for groupId 1.
    // Using isExercise:true isolates these tests from that shared fixture,
    // since no seeded assignment sets isExercise to true.
    const isExercise = true

    it('should return a normal summary (not throw) for a course member whose AssignmentRecord is still in its initial zero state', async () => {
      const now = new Date()
      const newAssignment = await transaction.assignment.create({
        data: {
          title: 'Freshly duplicated assignment',
          description: 'no submissions yet',
          groupId,
          startTime: new Date(now.getTime() - 1000),
          endTime: new Date(now.getTime() + 100000),
          isVisible: true,
          isExercise
        }
      })
      await transaction.assignmentRecord.create({
        data: {
          assignmentId: newAssignment.id,
          userId: user01Id
        }
      })

      const summary = await service.getMyAssignmentsSummary(
        groupId,
        user01Id,
        isExercise
      )

      const entry = summary.find((s) => s.id === newAssignment.id)
      expect(entry).to.exist
      expect(entry?.problemCount).to.equal(0)
      expect(entry?.submittedCount).to.equal(0)
      expect(entry?.assignmentPerfectScore).to.equal(0)
      expect(entry?.userAssignmentFinalScore).to.equal(null)
    })

    it('should use the record score as the final score when autoFinalizeScore is true', async () => {
      const now = new Date()
      const newAssignment = await transaction.assignment.create({
        data: {
          title: 'Auto-finalized assignment',
          description: 'score is finalized automatically',
          groupId,
          startTime: new Date(now.getTime() - 1000),
          endTime: new Date(now.getTime() + 100000),
          isVisible: true,
          isExercise,
          autoFinalizeScore: true,
          isFinalScoreVisible: true
        }
      })
      await transaction.assignmentRecord.create({
        data: {
          assignmentId: newAssignment.id,
          userId: user01Id,
          score: 42
        }
      })

      const summary = await service.getMyAssignmentsSummary(
        groupId,
        user01Id,
        isExercise
      )

      const entry = summary.find((s) => s.id === newAssignment.id)
      expect(entry).to.exist
      expect(entry?.userAssignmentFinalScore?.toNumber()).to.equal(42)
    })

    it('should omit an assignment (not throw ForbiddenAccessException, not throw TypeError) when the course member has no AssignmentRecord for it', async () => {
      const now = new Date()
      const unregisteredAssignment = await transaction.assignment.create({
        data: {
          title: 'Assignment the user never registered for',
          description: 'no AssignmentRecord exists for user01Id',
          groupId,
          startTime: new Date(now.getTime() - 1000),
          endTime: new Date(now.getTime() + 100000),
          isVisible: true,
          isExercise
        }
      })
      // Intentionally no transaction.assignmentRecord.create() for user01Id here.

      const summary = await service.getMyAssignmentsSummary(
        groupId,
        user01Id,
        isExercise
      )

      const entry = summary.find((s) => s.id === unregisteredAssignment.id)
      expect(entry).to.not.exist
    })
  })
})
