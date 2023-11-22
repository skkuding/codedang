import { ConfigService } from '@nestjs/config'
import { Test, type TestingModule } from '@nestjs/testing'
import { expect } from 'chai'
import { spy, stub } from 'sinon'
import {
  EntityNotExistException,
  UnprocessableDataException
} from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import type {
  Workbook,
  WorkbookProblem,
  Contest,
  ContestProblem
} from '@admin/@generated'
import { Level } from '@admin/@generated/prisma/level.enum'
import { S3Provider } from '@admin/storage/s3.provider'
import { StorageService } from '@admin/storage/storage.service'
import {
  fileUploadInput,
  groupId,
  importedProblems,
  problemId,
  problems,
  template,
  testcaseInput
} from './mock/mock'
import { ProblemService } from './problem.service'

const db = {
  $transaction: stub(),
  problem: {
    findMany: stub(),
    findFirstOrThrow: stub(),
    create: stub(),
    createMany: stub(),
    update: stub(),
    delete: stub()
  },
  problemTestcase: {
    create: stub(),
    createMany: stub(),
    deleteMany: stub(),
    findMany: stub(),
    update: stub()
  },
  workbook: {
    findFirstOrThrow: stub()
  },
  workbookProblem: {
    findFirstOrThrow: stub(),
    findMany: stub(),
    update: stub()
  },
  contest: {
    findFirstOrThrow: stub()
  },
  contestProblem: {
    findFirstOrThrow: stub(),
    findMany: stub(),
    update: stub()
  }
}
const exampleWorkbook: Workbook = {
  id: 1,
  title: 'example',
  description: 'example',
  groupId: 1,
  createdById: 1,
  isVisible: true,
  createTime: new Date(),
  updateTime: new Date()
}
const exampleWorkbookProblems: WorkbookProblem[] = [
  {
    order: 1,
    workbookId: 1,
    problemId: 1,
    createTime: new Date(),
    updateTime: new Date()
  },
  {
    order: 2,
    workbookId: 1,
    problemId: 2,
    createTime: new Date(),
    updateTime: new Date()
  },
  {
    order: 3,
    workbookId: 1,
    problemId: 3,
    createTime: new Date(),
    updateTime: new Date()
  },
  {
    order: 4,
    workbookId: 1,
    problemId: 4,
    createTime: new Date(),
    updateTime: new Date()
  },
  {
    order: 5,
    workbookId: 1,
    problemId: 5,
    createTime: new Date(),
    updateTime: new Date()
  },
  {
    order: 6,
    workbookId: 1,
    problemId: 6,
    createTime: new Date(),
    updateTime: new Date()
  },
  {
    order: 7,
    workbookId: 1,
    problemId: 7,
    createTime: new Date(),
    updateTime: new Date()
  },
  {
    order: 8,
    workbookId: 1,
    problemId: 8,
    createTime: new Date(),
    updateTime: new Date()
  },
  {
    order: 9,
    workbookId: 1,
    problemId: 9,
    createTime: new Date(),
    updateTime: new Date()
  },
  {
    order: 10,
    workbookId: 1,
    problemId: 10,
    createTime: new Date(),
    updateTime: new Date()
  }
]
const exampleOrderUpdatedWorkbookProblems: WorkbookProblem[] = [
  {
    order: 1,
    workbookId: 1,
    problemId: 2,
    createTime: new Date(),
    updateTime: new Date()
  },
  {
    order: 2,
    workbookId: 1,
    problemId: 3,
    createTime: new Date(),
    updateTime: new Date()
  },
  {
    order: 3,
    workbookId: 1,
    problemId: 4,
    createTime: new Date(),
    updateTime: new Date()
  },
  {
    order: 4,
    workbookId: 1,
    problemId: 5,
    createTime: new Date(),
    updateTime: new Date()
  },
  {
    order: 5,
    workbookId: 1,
    problemId: 6,
    createTime: new Date(),
    updateTime: new Date()
  },
  {
    order: 6,
    workbookId: 1,
    problemId: 7,
    createTime: new Date(),
    updateTime: new Date()
  },
  {
    order: 7,
    workbookId: 1,
    problemId: 8,
    createTime: new Date(),
    updateTime: new Date()
  },
  {
    order: 8,
    workbookId: 1,
    problemId: 9,
    createTime: new Date(),
    updateTime: new Date()
  },
  {
    order: 9,
    workbookId: 1,
    problemId: 10,
    createTime: new Date(),
    updateTime: new Date()
  },
  {
    order: 10,
    workbookId: 1,
    problemId: 1,
    createTime: new Date(),
    updateTime: new Date()
  }
]
const exampleContest: Contest = {
  id: 1,
  title: 'example',
  description: 'example',
  groupId: 1,
  createdById: 1,
  config: { isVisible: true, isRankVisible: true },
  startTime: new Date(),
  endTime: new Date(),
  createTime: new Date(),
  updateTime: new Date()
}
const exampleContestProblems: ContestProblem[] = [
  {
    order: 1,
    contestId: 1,
    problemId: 1,
    score: 1,
    createTime: new Date(),
    updateTime: new Date()
  },
  {
    order: 2,
    contestId: 1,
    problemId: 2,
    score: 1,
    createTime: new Date(),
    updateTime: new Date()
  },
  {
    order: 3,
    contestId: 1,
    problemId: 3,
    score: 1,
    createTime: new Date(),
    updateTime: new Date()
  },
  {
    order: 4,
    contestId: 1,
    problemId: 4,
    score: 1,
    createTime: new Date(),
    updateTime: new Date()
  },
  {
    order: 5,
    contestId: 1,
    problemId: 5,
    score: 1,
    createTime: new Date(),
    updateTime: new Date()
  },
  {
    order: 6,
    contestId: 1,
    problemId: 6,
    score: 1,
    createTime: new Date(),
    updateTime: new Date()
  },
  {
    order: 7,
    contestId: 1,
    problemId: 7,
    score: 1,
    createTime: new Date(),
    updateTime: new Date()
  },
  {
    order: 8,
    contestId: 1,
    problemId: 8,
    score: 1,
    createTime: new Date(),
    updateTime: new Date()
  },
  {
    order: 9,
    contestId: 1,
    problemId: 9,
    score: 1,
    createTime: new Date(),
    updateTime: new Date()
  },
  {
    order: 10,
    contestId: 1,
    problemId: 10,
    score: 1,
    createTime: new Date(),
    updateTime: new Date()
  }
]

const exampleOrderUpdatedContestProblems: ContestProblem[] = [
  {
    order: 1,
    contestId: 1,
    problemId: 2,
    score: 1,
    createTime: new Date(),
    updateTime: new Date()
  },
  {
    order: 2,
    contestId: 1,
    problemId: 3,
    score: 1,
    createTime: new Date(),
    updateTime: new Date()
  },
  {
    order: 3,
    contestId: 1,
    problemId: 4,
    score: 1,
    createTime: new Date(),
    updateTime: new Date()
  },
  {
    order: 4,
    contestId: 1,
    problemId: 5,
    score: 1,
    createTime: new Date(),
    updateTime: new Date()
  },
  {
    order: 5,
    contestId: 1,
    problemId: 6,
    score: 1,
    createTime: new Date(),
    updateTime: new Date()
  },
  {
    order: 6,
    contestId: 1,
    problemId: 7,
    score: 1,
    createTime: new Date(),
    updateTime: new Date()
  },
  {
    order: 7,
    contestId: 1,
    problemId: 8,
    score: 1,
    createTime: new Date(),
    updateTime: new Date()
  },
  {
    order: 8,
    contestId: 1,
    problemId: 9,
    score: 1,
    createTime: new Date(),
    updateTime: new Date()
  },
  {
    order: 9,
    contestId: 1,
    problemId: 10,
    score: 1,
    createTime: new Date(),
    updateTime: new Date()
  },
  {
    order: 10,
    contestId: 1,
    problemId: 1,
    score: 1,
    createTime: new Date(),
    updateTime: new Date()
  }
]

describe('ProblemService', () => {
  let service: ProblemService
  let storageService: StorageService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProblemService,
        { provide: PrismaService, useValue: db },
        StorageService,
        ConfigService,
        S3Provider
      ]
    }).compile()

    service = module.get<ProblemService>(ProblemService)
    storageService = module.get<StorageService>(StorageService)
  })

  it('should be defined', () => {
    expect(service).to.be.ok
  })

  describe('createProblem', () => {
    const input = {
      title: problems[0].title,
      description: problems[0].description,
      inputDescription: problems[0].inputDescription,
      outputDescription: problems[0].outputDescription,
      hint: problems[0].hint,
      template: problems[0].template,
      languages: problems[0].languages,
      timeLimit: problems[0].timeLimit,
      memoryLimit: problems[0].memoryLimit,
      difficulty: Level.Level1,
      source: problems[0].source,
      inputExamples: problems[0].inputExamples,
      outputExamples: problems[0].outputExamples,
      testcases: [testcaseInput],
      tagIds: [1]
    }

    it('should return created problem', async () => {
      const uploadSpy = stub(storageService, 'uploadObject').resolves()
      db.problem.create.resolves(problems[0])
      db.problemTestcase.create.resolves({ index: 1, id: 1 })

      const result = await service.createProblem(
        input,
        problems[0].createdById,
        groupId
      )
      expect(result).to.deep.equal(problems[0])
      expect(uploadSpy.calledOnce).to.be.true
    })

    it('should reject if languages is empty', async () => {
      const uploadSpy = stub(storageService, 'uploadObject').resolves()

      await expect(
        service.createProblem(
          { ...input, languages: [] },
          problems[0].createdById,
          groupId
        )
      ).to.be.rejectedWith(UnprocessableDataException)
      expect(uploadSpy.called).to.be.false
    })

    it('should reject if template language is not supported', async () => {
      const uploadSpy = stub(storageService, 'uploadObject').resolves()

      await expect(
        service.createProblem(
          { ...input, template: [{ ...template, language: 'Java' }] },
          problems[0].createdById,
          groupId
        )
      ).to.be.rejectedWith(UnprocessableDataException)
      expect(uploadSpy.called).to.be.false
    })
  })

  describe('uploadProblems', () => {
    it('shoule return imported problems', async () => {
      const userId = 2
      const groupId = 2
      const s3UploadCache = stub(storageService, 'uploadObject').resolves()
      const createTestcasesSpy = spy(service, 'createTestcases')
      db.problem.create.resetHistory()
      db.problem.create.onCall(0).resolves(importedProblems[0])
      db.problem.create.onCall(1).resolves(importedProblems[1])
      db.problemTestcase.create.resolves({ index: 1, id: 1 })

      const res = await service.uploadProblems(fileUploadInput, userId, groupId)

      expect(s3UploadCache.calledTwice).to.be.true
      expect(createTestcasesSpy.calledTwice).to.be.true
      expect(res).to.deep.equal(importedProblems)
    })
  })

  describe('getProblems', () => {
    it('should return group problems', async () => {
      db.problem.findMany.resolves(problems)

      const result = await service.getProblems({}, groupId, 1, 5)
      expect(result).to.deep.equal(problems)
    })
  })

  describe('getProblem', () => {
    it('should return a group problem', async () => {
      db.problem.findFirstOrThrow.resolves(problems[0])

      const result = await service.getProblem(problemId, groupId)
      expect(result).to.deep.equal(problems[0])
    })
  })

  describe('updateProblem', () => {
    const testcase = { ...testcaseInput, id: 1 }

    it('should return updated problem', async () => {
      const readSpy = stub(storageService, 'readObject').resolves(
        JSON.stringify([testcase])
      )
      const uploadSpy = stub(storageService, 'uploadObject').resolves()
      db.problem.findFirstOrThrow.resolves(problems[0])
      db.problem.update.resolves({ ...problems[0], title: 'revised' })
      db.problemTestcase.deleteMany.resolves()
      db.problemTestcase.findMany.resolves([])
      db.problemTestcase.update.resolves()
      db.problemTestcase.update.resolves(testcase)

      const result = await service.updateProblem(
        {
          id: problemId,
          title: 'revised',
          testcases: [testcase]
        },
        groupId
      )
      expect(result).to.deep.equal({ ...problems[0], title: 'revised' })
      expect(readSpy.calledOnce).to.be.true
      expect(uploadSpy.calledOnce).to.be.true
    })

    it('should return updated problem', async () => {
      const readSpy = stub(storageService, 'readObject').resolves(
        JSON.stringify([testcase])
      )
      const uploadSpy = stub(storageService, 'uploadObject').resolves()
      db.problem.findFirstOrThrow.resolves(problems[0])

      await expect(
        service.updateProblem(
          {
            id: problemId,
            languages: []
          },
          groupId
        )
      ).to.be.rejectedWith(UnprocessableDataException)
      expect(readSpy.called).to.be.false
      expect(uploadSpy.called).to.be.false
    })

    it('should return updated problem', async () => {
      const readSpy = stub(storageService, 'readObject').resolves(
        JSON.stringify([testcase])
      )
      const uploadSpy = stub(storageService, 'uploadObject').resolves()
      db.problem.findFirstOrThrow.resolves(problems[0])

      await expect(
        service.updateProblem(
          {
            id: problemId,
            template: [{ ...template, language: 'Java' }]
          },
          groupId
        )
      ).to.be.rejectedWith(UnprocessableDataException)
      expect(readSpy.called).to.be.false
      expect(uploadSpy.called).to.be.false
    })
  })

  describe('deleteProblem', () => {
    it('should return deleted problem', async () => {
      const deleteSpy = stub(storageService, 'deleteObject').resolves()
      db.problem.findFirstOrThrow.resolves(problems[0])
      db.problem.delete.resolves(problems[0])

      const result = await service.deleteProblem(problemId, groupId)
      expect(result).to.deep.equal(problems[0])
      expect(deleteSpy.calledOnce).to.be.true
    })
  })

  describe('getWorkbookProblems', () => {
    it('should return workbookProblems', async () => {
      //given
      db.workbook.findFirstOrThrow.resolves(exampleWorkbookProblems[0])
      db.workbookProblem.findMany.resolves(exampleWorkbookProblems)
      //when
      const result = await service.getWorkbookProblems(1, 1)
      //then
      expect(result).to.deep.equals(exampleWorkbookProblems)
    })

    it('should handle NotExistError', async () => {
      //given
      db.workbook.findFirstOrThrow.rejects(
        new EntityNotExistException('record not found')
      )
      // when & then
      await expect(service.getWorkbookProblems(1, -1)).to.be.rejectedWith(
        EntityNotExistException
      )
    })
  })

  describe('updateWorkbookProblemsOrder', () => {
    it('should return order-updated workbookProblems', async () => {
      //given
      db.workbook.findFirstOrThrow.resolves(exampleWorkbook)
      db.workbookProblem.findMany.resolves(exampleWorkbookProblems)

      // $transaction stub 구현
      db.$transaction.callsFake(async (queries) => {
        return Promise.all(
          queries.map((query, index) => {
            // 각 쿼리에 대한 모의 응답 반환
            return exampleOrderUpdatedWorkbookProblems[index]
          })
        )
      })
      //when
      const result = await service.updateWorkbookProblemsOrder(
        1,
        1,
        [2, 3, 4, 5, 6, 7, 8, 9, 10, 1]
      )
      //then
      expect(result).to.deep.equals(exampleOrderUpdatedWorkbookProblems)
    })

    it('should handle NotFound error', async () => {
      //given
      db.workbook.findFirstOrThrow.rejects(
        new EntityNotExistException('record not found')
      )
      //when & then
      await expect(
        service.updateWorkbookProblemsOrder(
          -1,
          1,
          [2, 3, 4, 5, 6, 7, 8, 9, 10, 1]
        )
      ).to.be.rejectedWith(EntityNotExistException)
    })

    it('should handle orders array length exception', async () => {
      //given
      db.workbook.findFirstOrThrow.resolves(exampleWorkbook)
      db.workbookProblem.findMany.resolves(exampleWorkbookProblems)
      //when & then
      await expect(
        service.updateWorkbookProblemsOrder(1, 1, [2, 3, 4, 5, 6, 7, 8, 9, 10])
      ).to.be.rejectedWith(UnprocessableDataException)
    })

    it('should handle RecordNotFound error', async () => {
      //given
      db.workbook.findFirstOrThrow.resolves(exampleWorkbook)
      db.workbookProblem.findMany.resolves(exampleWorkbookProblems)
      db.$transaction.callsFake(async (queries) => {
        return Promise.all(
          queries.map(() => {
            // 각 쿼리에 대한 모의 응답 반환
            return Promise.reject(
              new EntityNotExistException('record not found')
            )
          })
        )
      })
      //when & then
      await expect(
        service.updateWorkbookProblemsOrder(
          1,
          1,
          [2, 3, 4, 5, 6, 7, 8, 9, 10, 1]
        )
      ).to.be.rejectedWith(EntityNotExistException)
    })
  })

  describe('getContestProblems', () => {
    it('should return ContestProblems', async () => {
      //given
      db.contest.findFirstOrThrow.resolves(exampleContest)
      db.contestProblem.findMany.resolves(exampleContestProblems)
      //when
      const result = await service.getContestProblems(1, 1)
      //then
      expect(result).to.deep.equals(exampleContestProblems)
    })

    it('should handle NotFoundError', async () => {
      //given

      db.contest.findFirstOrThrow.rejects(
        new EntityNotExistException('record not found')
      )
      // when & then
      await expect(service.getContestProblems(-1, 1)).to.be.rejectedWith(
        EntityNotExistException
      )
    })
  })

  describe('updateContestProblemsOrder', () => {
    it('should return order-updated ContestProblems', async () => {
      //given
      db.contest.findFirstOrThrow.resolves(exampleContest)
      db.contestProblem.findMany.resolves(exampleContestProblems)

      db.$transaction.callsFake(async (queries) => {
        return Promise.all(
          queries.map((query, index) => {
            // 각 쿼리에 대한 모의 응답 반환
            return exampleOrderUpdatedContestProblems[index]
          })
        )
      })
      //when
      const result = await service.updateContestProblemsOrder(
        1,
        1,
        [2, 3, 4, 5, 6, 7, 8, 9, 10, 1]
      )
      //then
      expect(result).to.deep.equals(exampleOrderUpdatedContestProblems)
    })

    it('should handle NotFound error', async () => {
      //given
      db.contest.findFirstOrThrow.rejects(
        new EntityNotExistException('record not found')
      )
      //when & then
      await expect(
        service.updateContestProblemsOrder(
          -1,
          1,
          [2, 3, 4, 5, 6, 7, 8, 9, 10, 1]
        )
      ).to.be.rejectedWith(EntityNotExistException)
    })

    it('should handle orders array length exception', async () => {
      //given
      db.contest.findFirstOrThrow.resolves(exampleContest)
      db.contestProblem.findMany.resolves(exampleContestProblems)
      //when & then
      await expect(
        service.updateContestProblemsOrder(1, 1, [2, 3, 4, 5, 6, 7, 8, 9, 10])
      ).to.be.rejectedWith(UnprocessableDataException)
    })

    it('should handle RecordNotFound error', async () => {
      //given
      db.contestProblem.findMany.resolves(exampleContestProblems)

      db.$transaction.callsFake(async (queries) => {
        return Promise.all(
          queries.map(() => {
            // 각 쿼리에 대한 모의 응답 반환
            return Promise.reject(
              new EntityNotExistException('record not found')
            )
          })
        )
      })
      //when & then
      await expect(
        service.updateContestProblemsOrder(
          1,
          1,
          [2, 3, 4, 5, 6, 7, 8, 9, 10, 1]
        )
      ).to.be.rejectedWith(EntityNotExistException)
    })
  })
})
