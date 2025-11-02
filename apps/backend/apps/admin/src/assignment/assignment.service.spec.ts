import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { Test, type TestingModule } from '@nestjs/testing'
import {
  Assignment,
  AssignmentProblem,
  AssignmentProblemRecord,
  AssignmentRecord,
  Group,
  Problem
} from '@generated'
import { faker } from '@faker-js/faker'
import { Prisma, ResultStatus } from '@prisma/client'
import { expect } from 'chai'
import { stub } from 'sinon'
import {
  EntityNotExistException,
  ForbiddenAccessException
} from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import { solution } from '@admin/problem/mock/mock'
import { AssignmentService } from './assignment.service'
import type { AssignmentWithParticipants } from './model/assignment-with-participants.model'
import type {
  CreateAssignmentInput,
  UpdateAssignmentInput
} from './model/assignment.input'

const assignmentId = 1
const userId = 1
const groupId = 1
const problemId = 2
const startTime = faker.date.past()
const endTime = faker.date.future()
const dueTime = faker.date.future()
const createTime = faker.date.past()
const updateTime = faker.date.past()
const assignmentProblemInput = {
  problemId,
  score: 10,
  solutionReleaseTime: null
}
// const duplicatedAssignmentId = 2

const assignment: Assignment = {
  id: assignmentId,
  createdById: userId,
  groupId,
  title: 'title',
  description: 'description',
  startTime,
  endTime,
  dueTime,
  isVisible: true,
  isRankVisible: true,
  isJudgeResultVisible: true,
  enableCopyPaste: true,
  createTime,
  updateTime,
  assignmentProblem: [],
  week: 1,
  autoFinalizeScore: false,
  isFinalScoreVisible: false,
  isExercise: false
}

const assignmentWithCount = {
  id: assignmentId,
  createdById: userId,
  groupId,
  title: 'title',
  description: 'description',
  startTime,
  endTime,
  dueTime,
  isVisible: true,
  isRankVisible: true,
  isJudgeResultVisible: true,
  enableCopyPaste: true,
  createTime,
  updateTime,
  // eslint-disable-next-line @typescript-eslint/naming-convention
  _count: {
    assignmentRecord: 10
  },
  week: 1,
  autoFinalizeScore: false,
  isFinalScoreVisible: false,
  isExercise: false
}

const assignmentWithParticipants: AssignmentWithParticipants = {
  id: assignmentId,
  createdById: userId,
  groupId,
  title: 'title',
  description: 'description',
  startTime,
  endTime,
  dueTime,
  isVisible: true,
  isRankVisible: true,
  enableCopyPaste: true,
  isJudgeResultVisible: true,
  createTime,
  updateTime,
  participants: 10,
  week: 1,
  autoFinalizeScore: false,
  isFinalScoreVisible: false,
  isExercise: false
}

const group: Group = {
  id: groupId,
  groupName: 'groupName',
  description: 'description',
  config: {
    showOnList: true,
    allowJoinFromSearch: true,
    allowJoinWithURL: false,
    requireApprovalBeforeJoin: true
  },
  createTime: faker.date.past(),
  updateTime: faker.date.past(),
  groupType: 'Course'
}

const problem: Problem = {
  id: problemId,
  createdById: 2,
  title: 'test problem',
  description: 'thisistestproblem',
  inputDescription: 'inputdescription',
  outputDescription: 'outputdescription',
  hint: 'hint',
  template: [],
  languages: ['C', 'Cpp'],
  solution,
  timeLimit: 10000,
  memoryLimit: 100000,
  difficulty: 'Level1',
  source: 'source',
  visibleLockTime: faker.date.past(),
  createTime: faker.date.past(),
  updateTime: faker.date.past(),
  updateContentTime: faker.date.past(),
  submissionCount: 0,
  acceptedCount: 0,
  acceptedRate: 0,
  engDescription: null,
  engHint: null,
  engInputDescription: null,
  engOutputDescription: null,
  isHiddenUploadedByZip: false,
  isSampleUploadedByZip: false,
  engTitle: null
}

const assignmentProblem: AssignmentProblem = {
  order: 0,
  assignmentId,
  problemId,
  score: 50,
  solutionReleaseTime: null,
  createTime: faker.date.past(),
  updateTime: faker.date.past()
}

const submissionsWithProblemTitleAndUsername = {
  id: 1,
  userId: 1,
  userIp: '127.0.0.1',
  problemId: 1,
  assignmentId: 1,
  workbookId: 1,
  code: [],
  codeSize: 1,
  language: 'C',
  result: ResultStatus.Accepted,
  createTime: '2000-01-01',
  updateTime: '2000-01-02',
  problem: {
    title: 'submission'
  },
  user: {
    username: 'user01',
    studentId: '1234567890'
  }
}

// const submissionResults = [
//   {
//     id: 1,
//     submissionId: 1,
//     problemTestcaseId: 1,
//     result: ResultStatus.Accepted,
//     cpuTime: BigInt(1),
//     memory: 1,
//     createTime: '2000-01-01',
//     updateTime: '2000-01-02'
//   }
// ]

const input = {
  title: 'test title10',
  description: 'test description',
  startTime: faker.date.past(),
  endTime: faker.date.future(),
  dueTime: faker.date.future(),
  week: 1,
  isVisible: false,
  isRankVisible: false,
  enableCopyPaste: true,
  isJudgeResultVisible: true,
  autoFinalizeScore: false
} satisfies CreateAssignmentInput

const updateInput = {
  id: 1,
  title: 'test title10',
  description: 'test description',
  startTime: faker.date.past(),
  endTime: faker.date.future(),
  dueTime: faker.date.future(),
  week: 1,
  isVisible: false,
  isRankVisible: false,
  enableCopyPaste: false
} satisfies UpdateAssignmentInput

const db = {
  assignment: {
    findFirst: stub().resolves(Assignment),
    findUnique: stub().resolves(Assignment),
    findMany: stub().resolves([Assignment]),
    create: stub().resolves(Assignment),
    update: stub().resolves(Assignment),
    delete: stub().resolves(Assignment)
  },
  assignmentProblem: {
    create: stub().resolves(AssignmentProblem),
    findMany: stub().resolves([AssignmentProblem]),
    findFirstOrThrow: stub().resolves(AssignmentProblem),
    findUnique: stub().resolves(AssignmentProblem)
  },
  assignmentRecord: {
    findMany: stub().resolves([AssignmentRecord]),
    create: stub().resolves(AssignmentRecord),
    count: stub().resolves(Number)
  },
  assignmentProblemRecord: {
    createMany: stub().resolves([]),
    findMany: stub().resolves([AssignmentProblemRecord])
  },
  problem: {
    update: stub().resolves(Problem),
    updateMany: stub().resolves([Problem]),
    findFirstOrThrow: stub().resolves(Problem)
  },
  group: {
    findUnique: stub().resolves(Group)
  },
  userGroup: {
    count: stub().resolves(Number)
  },
  submission: {
    findMany: stub().resolves([submissionsWithProblemTitleAndUsername])
  },
  // submissionResult: {
  //   findMany: stub().resolves([submissionResults])
  // },
  $transaction: stub().callsFake(async () => {
    const updatedProblem = await db.problem.update()
    const newAssignmentProblem = await db.assignmentProblem.create()
    return [newAssignmentProblem, updatedProblem]
  }),
  $executeRaw: stub().resolves(1),
  getPaginator: PrismaService.prototype.getPaginator
}

describe('AssignmentService', () => {
  let service: AssignmentService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssignmentService,
        EventEmitter2,
        { provide: PrismaService, useValue: db },
        {
          provide: CACHE_MANAGER,
          useFactory: () => ({
            set: () => [],
            get: () => [],
            del: () => [],
            store: {
              keys: () => []
            }
          })
        }
      ]
    }).compile()

    service = module.get<AssignmentService>(AssignmentService)
  })

  it('should be defined', () => {
    expect(service).to.be.ok
  })

  describe('getAssignments', () => {
    it('should return an array of assignments', async () => {
      db.assignment.findMany.resolves([assignmentWithCount])

      const res = await service.getAssignments(5, 2, 0, false)
      expect(res).to.deep.equal([assignmentWithParticipants])
    })
  })

  describe('createAssignment', () => {
    it('should return created assignment', async () => {
      db.assignment.create.resolves(assignment)
      db.group.findUnique.resolves(group)

      const res = await service.createAssignment(groupId, userId, input)
      expect(res).to.deep.equal(assignment)
    })
  })

  describe('updateAssignment', () => {
    it('should return updated assignment', async () => {
      db.assignment.findUnique.resolves(assignment)
      db.assignment.update.resolves(assignment)

      const res = await service.updateAssignment(groupId, updateInput)
      expect(res).to.deep.equal(assignment)
    })

    it('should throw error when groupId or assignmentId not exist', async () => {
      expect(service.updateAssignment(1000, updateInput)).to.be.rejectedWith(
        EntityNotExistException
      )
    })
  })

  describe('deleteAssignment', () => {
    it('should return deleted assignment', async () => {
      db.assignment.findUnique.resolves(assignment)
      db.assignment.delete.resolves(assignment)

      const res = await service.deleteAssignment(groupId, assignmentId)
      expect(res).to.deep.equal(assignment)
    })

    it('should throw error when groupId or assignmentId not exist', async () => {
      expect(service.deleteAssignment(1000, 1000)).to.be.rejectedWith(
        EntityNotExistException
      )
    })
  })

  describe('importProblemsToAssignment', () => {
    const assignmentWithEmptySubmissions = {
      ...assignment,
      submission: []
    }

    it('should return created AssignmentProblems', async () => {
      db.assignment.findUnique.resolves(assignmentWithEmptySubmissions)
      db.problem.update.resolves(problem)
      db.assignmentProblem.create.resolves(assignmentProblem)
      db.assignmentProblem.findUnique.resolves(null)

      const res = await Promise.all(
        await service.importProblemsToAssignment(groupId, assignmentId, [
          assignmentProblemInput
        ])
      )

      expect(res).to.deep.equal([assignmentProblem])
    })

    it('should return an empty array when the problem already exists in assignment', async () => {
      db.assignment.findUnique.resolves(assignmentWithEmptySubmissions)
      db.problem.update.resolves(problem)
      db.assignmentProblem.findUnique.resolves(AssignmentProblem)

      const res = await service.importProblemsToAssignment(
        groupId,
        assignmentId,
        [assignmentProblemInput]
      )

      expect(res).to.deep.equal([])
    })

    it('should throw error when the assignmentId not exist', async () => {
      expect(
        service.importProblemsToAssignment(groupId, 9999, [
          assignmentProblemInput
        ])
      ).to.be.rejectedWith(EntityNotExistException)
    })
  })

  describe('getAssignmentScoreSummary', () => {
    it('should return score summary', async () => {
      db.assignmentProblem.findMany.resolves([assignmentProblem])
      db.assignmentProblemRecord.findMany.resolves([
        {
          problemId,
          score: 30,
          finalScore: 25,
          isSubmitted: true
        }
      ])

      const summary = await service.getAssignmentScoreSummary(
        userId,
        assignmentId
      )

      expect(summary).to.deep.equal({
        submittedProblemCount: 1,
        totalProblemCount: 1,
        userAssignmentScore: new Prisma.Decimal(30),
        assignmentPerfectScore: 50,
        userAssignmentFinalScore: new Prisma.Decimal(25),
        problemScores: [
          {
            problemId,
            score: 30,
            maxScore: 50,
            finalScore: 25
          }
        ]
      })
    })

    it('should handle finalScore as null', async () => {
      db.assignmentProblem.findMany.resolves([assignmentProblem])
      db.assignmentProblemRecord.findMany.resolves([
        {
          problemId,
          score: 40,
          finalScore: null,
          isSubmitted: true
        }
      ])

      const summary = await service.getAssignmentScoreSummary(
        userId,
        assignmentId
      )

      expect(summary).to.deep.equal({
        submittedProblemCount: 1,
        totalProblemCount: 1,
        userAssignmentScore: new Prisma.Decimal(40),
        assignmentPerfectScore: 50,
        userAssignmentFinalScore: Prisma.Decimal(0),
        problemScores: [
          {
            problemId,
            score: 40,
            maxScore: 50,
            finalScore: null
          }
        ]
      })
    })

    it('should handle no submitted problems', async () => {
      db.assignmentProblem.findMany.resolves([assignmentProblem])
      db.assignmentProblemRecord.findMany.resolves([
        {
          problemId,
          score: 0,
          finalScore: null,
          isSubmitted: false
        }
      ])

      const summary = await service.getAssignmentScoreSummary(
        userId,
        assignmentId
      )

      expect(summary).to.deep.equal({
        submittedProblemCount: 0,
        totalProblemCount: 1,
        userAssignmentScore: Prisma.Decimal(0),
        assignmentPerfectScore: 50,
        userAssignmentFinalScore: Prisma.Decimal(0),
        problemScores: [
          {
            problemId,
            score: 0,
            maxScore: 50,
            finalScore: null
          }
        ]
      })
    })

    it('should handle user with no records', async () => {
      db.assignmentProblem.findMany.resolves([assignmentProblem])
      db.assignmentProblemRecord.findMany.resolves([])

      const summary = await service.getAssignmentScoreSummary(
        userId,
        assignmentId
      )

      expect(summary).to.deep.equal({
        submittedProblemCount: 0,
        totalProblemCount: 1,
        userAssignmentScore: Prisma.Decimal(0),
        assignmentPerfectScore: 50,
        userAssignmentFinalScore: Prisma.Decimal(0),
        problemScores: []
      })
    })
  })

  describe('getAssignmentScoreSummaries', () => {
    it('should return list of users with their score summaries', async () => {
      db.assignment.findUnique.resolves(assignment)
      db.userGroup.count.resolves(10)
      db.assignmentRecord.count.resolves(10)

      db.assignmentRecord.findMany.resolves([
        {
          userId,
          user: {
            username: 'user01',
            studentId: '1234567890',
            userProfile: {
              realName: '홍길동'
            },
            major: 'CS'
          }
        }
      ])
      db.assignmentProblem.findMany.resolves([assignmentProblem])
      db.assignmentProblemRecord.findMany.resolves([
        {
          userId,
          problemId,
          score: 50,
          finalScore: 45,
          isSubmitted: true
        }
      ])

      const summaries = await service.getAssignmentScoreSummaries(
        assignmentId,
        groupId,
        10,
        null
      )

      expect(summaries).to.deep.equal([
        {
          userId,
          username: 'user01',
          studentId: '1234567890',
          realName: '홍길동',
          major: 'CS',
          submittedProblemCount: 1,
          totalProblemCount: 1,
          userAssignmentScore: Prisma.Decimal(50),
          assignmentPerfectScore: 50,
          userAssignmentFinalScore: Prisma.Decimal(45),
          problemScores: [
            {
              problemId,
              score: 50,
              maxScore: 50,
              finalScore: 45
            }
          ]
        }
      ])
    })
  })

  describe('autoFinalizeScore', () => {
    it('should finalize scores when assignment exists and group matches', async () => {
      db.assignment.findUnique.resetHistory()
      db.$executeRaw.resetHistory()
      db.assignment.findUnique.resolves({ groupId })
      db.$executeRaw.resolves(7)

      const updated = await service.autoFinalizeScore(groupId, assignmentId)

      expect(updated).to.equal(7)
      expect(db.assignment.findUnique.calledOnce).to.be.true
      expect(db.$executeRaw.calledOnce).to.be.true
    })

    it('should throw EntityNotExistException when assignment does not exist', async () => {
      db.assignment.findUnique.resolves(null)

      await expect(
        service.autoFinalizeScore(groupId, assignmentId)
      ).to.be.rejectedWith(EntityNotExistException)
    })

    it('should throw ForbiddenAccessException when groupId mismatches', async () => {
      db.assignment.findUnique.resolves({ groupId: groupId + 1 })

      await expect(
        service.autoFinalizeScore(groupId, assignmentId)
      ).to.be.rejectedWith(ForbiddenAccessException)
    })
  })

  // describe('getAssignmentSubmissionSummaryByUserId', () => {
  //   it('should return assignment submission summaries', async () => {
  //     const res = await service.getAssignmentSubmissionSummaryByUserId(10, 1, 1, 1)

  //     expect(res.submissions).to.deep.equal([
  //       {
  //         assignmentId: 1,
  //         problemTitle: 'submission',
  //         username: 'user01',
  //         studentId: '1234567890',
  //         submissionResult: ResultStatus.Accepted,
  //         language: 'C',
  //         submissionTime: '2000-01-01',
  //         codeSize: 1,
  //         ip: '127.0.0.1' // TODO: submission.ip 사용
  //       }
  //     ])
  //     expect(res.scoreSummary).to.deep.equal({
  //       totalProblemCount: 1,
  //       submittedProblemCount: 1,
  //       totalScore: 1,
  //       acceptedTestcaseCountPerProblem: [
  //         {
  //           acceptedTestcaseCount: 0,
  //           problemId: 1,
  //           totalTestcaseCount: 1
  //         }
  //       ]
  //     })
  //   })
  // })

  // describe('duplicateAssignment', () => {
  //   db['$transaction'] = stub().callsFake(async () => {
  //     const newAssignment = await db.assignment.create()
  //     const newAssignmentProblem = await db.assignmentProblem.create()
  //     const newAssignmentRecord = await db.assignmentRecord.create()
  //     return [newAssignment, newAssignmentProblem, newAssignmentRecord]
  //   })

  //   it('should return duplicated assignment', async () => {
  //     db.assignment.findFirst.resolves(assignment)
  //     db.assignmentProblem.create.resolves({
  //       ...assignment,
  //       createdById: userId,
  //       groupId,
  //       isVisible: false
  //     })
  //     db.assignmentProblem.findMany.resolves([assignmentProblem])
  //     db.assignmentProblem.create.resolves({
  //       ...assignmentProblem,
  //       assignmentId: duplicatedAssignmentId
  //     })
  //     db.assignmentRecord.findMany.resolves([assignmentRecord])
  //     db.assignmentRecord.create.resolves({
  //       ...assignmentRecord,
  //       assignmentId: duplicatedAssignmentId
  //     })

  //     const res = await service.duplicateAssignment(groupId, assignmentId, userId)
  //     expect(res.assignment).to.deep.equal(assignment)
  //     expect(res.problems).to.deep.equal([
  //       {
  //         ...assignmentProblem,
  //         assignmentId: duplicatedAssignmentId
  //       }
  //     ])
  //     expect(res.records).to.deep.equal([
  //       { ...assignmentRecord, assignmentId: duplicatedAssignmentId }
  //     ])
  //   })

  //   it('should throw error when the assignmentId not exist', async () => {
  //     expect(
  //       service.duplicateAssignment(groupId, 9999, userId)
  //     ).to.be.rejectedWith(EntityNotExistException)
  //   })

  //   it('should throw error when the groupId not exist', async () => {
  //     expect(
  //       service.duplicateAssignment(9999, assignmentId, userId)
  //     ).to.be.rejectedWith(EntityNotExistException)
  //   })
  // })
})
