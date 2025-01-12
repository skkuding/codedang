import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Test, type TestingModule } from '@nestjs/testing'
import { AssignmentProblem, Group, AssignmentRecord } from '@generated'
import { Problem } from '@generated'
import { Assignment } from '@generated'
import { faker } from '@faker-js/faker'
import { ResultStatus } from '@prisma/client'
import type { Cache } from 'cache-manager'
import { expect } from 'chai'
import { stub } from 'sinon'
import { EntityNotExistException } from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import { AssignmentService } from './assignment.service'
import type { AssignmentWithParticipants } from './model/assignment-with-participants.model'
import type {
  CreateAssignmentInput,
  UpdateAssignmentInput
} from './model/assignment.input'
import type { AssignmentPublicizingRequest } from './model/publicizing-request.model'

const assignmentId = 1
const userId = 1
const groupId = 1
const problemId = 2
const startTime = faker.date.past()
const endTime = faker.date.future()
const createTime = faker.date.past()
const updateTime = faker.date.past()
const invitationCode = '123456'
const problemIdsWithScore = {
  problemId,
  score: 10
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
  isVisible: true,
  isRankVisible: true,
  isJudgeResultVisible: true,
  enableCopyPaste: true,
  createTime,
  updateTime,
  invitationCode,
  assignmentProblem: []
}

const assignmentWithCount = {
  id: assignmentId,
  createdById: userId,
  groupId,
  title: 'title',
  description: 'description',
  startTime,
  endTime,
  isVisible: true,
  isRankVisible: true,
  isJudgeResultVisible: true,
  enableCopyPaste: true,
  createTime,
  updateTime,
  invitationCode,
  // eslint-disable-next-line @typescript-eslint/naming-convention
  _count: {
    assignmentRecord: 10
  }
}

const assignmentWithParticipants: AssignmentWithParticipants = {
  id: assignmentId,
  createdById: userId,
  groupId,
  title: 'title',
  description: 'description',
  startTime,
  endTime,
  isVisible: true,
  isRankVisible: true,
  enableCopyPaste: true,
  isJudgeResultVisible: true,
  createTime,
  updateTime,
  participants: 10,
  invitationCode
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
  updateTime: faker.date.past()
}

const problem: Problem = {
  id: problemId,
  createdById: 2,
  groupId: 2,
  title: 'test problem',
  description: 'thisistestproblem',
  inputDescription: 'inputdescription',
  outputDescription: 'outputdescription',
  hint: 'hint',
  template: [],
  languages: ['C'],
  timeLimit: 10000,
  memoryLimit: 100000,
  difficulty: 'Level1',
  source: 'source',
  visibleLockTime: faker.date.past(),
  createTime: faker.date.past(),
  updateTime: faker.date.past(),
  submissionCount: 0,
  acceptedCount: 0,
  acceptedRate: 0,
  engDescription: null,
  engHint: null,
  engInputDescription: null,
  engOutputDescription: null,
  engTitle: null
}

const assignmentProblem: AssignmentProblem = {
  order: 0,
  assignmentId,
  problemId,
  score: 50,
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

const publicizingRequest: AssignmentPublicizingRequest = {
  assignmentId,
  userId,
  expireTime: new Date('2050-08-19T07:32:07.533Z')
}

const input = {
  title: 'test title10',
  description: 'test description',
  startTime: faker.date.past(),
  endTime: faker.date.future(),
  isVisible: false,
  isRankVisible: false,
  enableCopyPaste: true,
  isJudgeResultVisible: true
} satisfies CreateAssignmentInput

const updateInput = {
  id: 1,
  title: 'test title10',
  description: 'test description',
  startTime: faker.date.past(),
  endTime: faker.date.future(),
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
    findFirst: stub().resolves(AssignmentProblem)
  },
  assignmentRecord: {
    findMany: stub().resolves([AssignmentRecord]),
    create: stub().resolves(AssignmentRecord)
  },
  problem: {
    update: stub().resolves(Problem),
    updateMany: stub().resolves([Problem]),
    findFirstOrThrow: stub().resolves(Problem)
  },
  group: {
    findUnique: stub().resolves(Group)
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
  getPaginator: PrismaService.prototype.getPaginator
}

describe('AssignmentService', () => {
  let service: AssignmentService
  let cache: Cache

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssignmentService,
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
    cache = module.get<Cache>(CACHE_MANAGER)
    stub(cache.store, 'keys').resolves(['assignment:1:publicize'])
  })

  it('should be defined', () => {
    expect(service).to.be.ok
  })

  describe('getAssignments', () => {
    it('should return an array of assignments', async () => {
      db.assignment.findMany.resolves([assignmentWithCount])

      const res = await service.getAssignments(5, 2, 0)
      expect(res).to.deep.equal([assignmentWithParticipants])
    })
  })

  describe('getPublicizingRequests', () => {
    it('should return an array of PublicizingRequest', async () => {
      const cacheSpyGet = stub(cache, 'get').resolves([publicizingRequest])
      const res = await service.getPublicizingRequests()

      expect(cacheSpyGet.called).to.be.true
      expect(res).to.deep.equal([publicizingRequest])
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
      db.assignment.findFirst.resolves(assignment)
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
      db.assignment.findFirst.resolves(assignment)
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

  describe('handlePublicizingRequest', () => {
    it('should return accepted state', async () => {
      db.assignment.update.resolves(assignment)

      const cacheSpyGet = stub(cache, 'get').resolves([publicizingRequest])
      const res = await service.handlePublicizingRequest(assignmentId, true)

      expect(cacheSpyGet.called).to.be.true
      expect(res).to.deep.equal({
        assignmentId,
        isAccepted: true
      })
    })

    it('should throw error when groupId or assignmentId not exist', async () => {
      expect(service.handlePublicizingRequest(1000, true)).to.be.rejectedWith(
        EntityNotExistException
      )
    })

    it('should throw error when the assignment is not requested to public', async () => {
      expect(service.handlePublicizingRequest(3, true)).to.be.rejectedWith(
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
      db.assignmentProblem.findFirst.resolves(null)

      const res = await Promise.all(
        await service.importProblemsToAssignment(groupId, assignmentId, [
          problemIdsWithScore
        ])
      )

      expect(res).to.deep.equal([assignmentProblem])
    })

    it('should return an empty array when the problem already exists in assignment', async () => {
      db.assignment.findUnique.resolves(assignmentWithEmptySubmissions)
      db.problem.update.resolves(problem)
      db.assignmentProblem.findFirst.resolves(AssignmentProblem)

      const res = await service.importProblemsToAssignment(
        groupId,
        assignmentId,
        [problemIdsWithScore]
      )

      expect(res).to.deep.equal([])
    })

    it('should throw error when the assignmentId not exist', async () => {
      expect(
        service.importProblemsToAssignment(groupId, 9999, [problemIdsWithScore])
      ).to.be.rejectedWith(EntityNotExistException)
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
