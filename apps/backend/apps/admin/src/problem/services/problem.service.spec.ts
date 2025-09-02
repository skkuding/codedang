import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { ConfigService } from '@nestjs/config'
import { Test, type TestingModule } from '@nestjs/testing'
import { Level } from '@generated'
import { Role } from '@prisma/client'
import { expect } from 'chai'
import { spy, stub } from 'sinon'
import { UnprocessableDataException } from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import { S3Provider, StorageService } from '@libs/storage'
import {
  fileUploadInput,
  user,
  importedProblems,
  importedProblemsWithIsVisible,
  problemId,
  problems,
  problemsWithIsVisible,
  template,
  testcaseInput,
  updateHistories
} from '../mock/mock'
import { FileService, ProblemService, TagService, TestcaseService } from './'

/**
 * TODO: s3 관련 코드 재작성(수정) 필요
 */

const db = {
  user: {
    findUnique: stub().resolves({ role: Role.User })
  },
  userGroup: {
    findMany: stub().resolves([])
  },
  userContest: {
    findUnique: stub().resolves(null)
  },
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
  problemTag: {
    findMany: stub()
  },
  tag: {
    findUnique: stub(),
    findMany: stub(),
    create: stub(),
    findFirst: stub(),
    update: stub(),
    delete: stub()
  },
  $transaction: stub(),
  file: {
    deleteMany: stub()
  },
  submission: {
    findFirst: stub()
  },
  updateHistory: {
    findMany: stub(),
    create: stub()
  },
  getPaginator: PrismaService.prototype.getPaginator
}

describe('ProblemService', () => {
  let service: ProblemService
  let storageService: StorageService
  let testcaseService: TestcaseService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProblemService,
        { provide: PrismaService, useValue: db },
        StorageService,
        TestcaseService,
        TagService,
        FileService,
        ConfigService,
        S3Provider,
        { provide: CACHE_MANAGER, useValue: { del: () => null } }
      ]
    }).compile()

    service = module.get<ProblemService>(ProblemService)
    storageService = module.get<StorageService>(StorageService)
    testcaseService = module.get<TestcaseService>(TestcaseService)
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
      isVisible: false,
      template: problems[0].template,
      languages: problems[0].languages,
      solution: problems[0].solution,
      timeLimit: problems[0].timeLimit,
      memoryLimit: problems[0].memoryLimit,
      difficulty: Level.Level1,
      source: problems[0].source,
      testcases: [testcaseInput],
      tagIds: [1]
    }

    it('should return created problem', async () => {
      db.problem.create.resolves(problems[0])
      db.problemTestcase.create.resolves({ index: 1, id: 1 })

      const result = await service.createProblem(
        input,
        problems[0].createdById!,
        user[0].role!
      )
      expect(result).to.deep.equal(problemsWithIsVisible[0])
    })

    it('should reject if languages is empty', async () => {
      const uploadSpy = stub(storageService, 'uploadObject').resolves()

      await expect(
        service.createProblem(
          { ...input, languages: [] },
          problems[0].createdById!,
          user[0].role!
        )
      ).to.be.rejectedWith(UnprocessableDataException)
      expect(uploadSpy.called).to.be.false
    })

    it('should reject if template language is not supported', async () => {
      const uploadSpy = stub(storageService, 'uploadObject').resolves()

      await expect(
        service.createProblem(
          { ...input, template: [{ ...template, language: 'Java' }] },
          problems[0].createdById!,
          user[0].role!
        )
      ).to.be.rejectedWith(UnprocessableDataException)
      expect(uploadSpy.called).to.be.false
    })
  })

  describe('uploadProblems', () => {
    it('shoule return imported problems', async () => {
      const userId = user[1].id!
      const userRole = user[1].role!
      const createTestcasesSpy = spy(testcaseService, 'createTestcasesLegacy')
      db.problem.create.resetHistory()
      db.problem.create.onCall(0).resolves(importedProblems[0])
      db.problem.create.onCall(1).resolves(importedProblems[1])
      db.problemTestcase.create.resolves({ index: 1, id: 1 })

      const res = await service.uploadProblems(
        fileUploadInput,
        userId,
        userRole
      )

      expect(createTestcasesSpy.calledTwice).to.be.true
      expect(res).to.deep.equal(importedProblemsWithIsVisible)
    })
  })

  describe('getProblems', () => {
    it('should return my problems', async () => {
      db.problem.findMany.resolves(problems)
      const result = await service.getProblems({
        userId: user[0].id!,
        input: {},
        cursor: 1,
        take: 5,
        mode: 'my'
      })
      expect(result).to.deep.equal(problemsWithIsVisible)
    })
  })

  describe('getProblem', () => {
    it('should return a group problem', async () => {
      db.problem.findFirstOrThrow.resolves(problems[0])
      const result = await service.getProblem(
        problemId,
        user[0].role!,
        user[0].id!
      )
      expect(result).to.deep.equal(problemsWithIsVisible[0])
    })
  })

  describe('updateProblem', () => {
    const testcase = { ...testcaseInput, id: 1 }
    it('should return updated problem', async () => {
      db.problem.findFirstOrThrow.resolves(problems[0])
      db.problem.update.resolves({ ...problems[0], title: 'revised' })
      db.problemTestcase.deleteMany.resolves()
      db.problemTestcase.findMany.resolves([])
      db.problemTestcase.update.resolves()
      db.problemTestcase.update.resolves(testcase)
      db.submission.findFirst.resolves(null)
      const result = await service.updateProblem(
        {
          id: problemId,
          title: 'revised',
          testcases: [testcase]
        },
        user[0].role!,
        user[0].id!
      )
      expect(result).to.deep.equal({
        ...problemsWithIsVisible[0],
        title: 'revised'
      })
    })

    it('should throw error because languages is empty', async () => {
      const uploadSpy = stub(storageService, 'uploadObject').resolves()
      db.problem.findFirstOrThrow.resolves(problems[0])
      await expect(
        service.updateProblem(
          {
            id: problemId,
            languages: []
          },
          user[0].role!,
          user[0].id!
        )
      ).to.be.rejectedWith(UnprocessableDataException)
      expect(uploadSpy.called).to.be.false
    })

    it('should throw error because of unsupported language', async () => {
      const uploadSpy = stub(storageService, 'uploadObject').resolves()
      db.problem.findFirstOrThrow.resolves(problems[0])
      await expect(
        service.updateProblem(
          {
            id: problemId,
            template: [{ ...template, language: 'Java' }]
          },
          user[0].role!,
          user[0].id!
        )
      ).to.be.rejectedWith(UnprocessableDataException)
      expect(uploadSpy.called).to.be.false
    })

    it('should throw error when user changes visible property of problem included in upcoming/ongoing contest', async () => {
      const uploadSpy = stub(storageService, 'uploadObject').resolves()
      db.problem.findFirstOrThrow.resolves(problems[1])
      await expect(
        service.updateProblem(
          {
            id: problemId,
            isVisible: false
          },
          user[0].role!,
          user[0].id!
        )
      ).to.be.rejectedWith(UnprocessableDataException)
      expect(uploadSpy.called).to.be.false
    })
  })

  describe('getProblemUpdateHistory', () => {
    it('should return update history for a given problemId', async () => {
      db.updateHistory.findMany.resolves(
        updateHistories.filter((h) => h.problemId === 1)
      )

      const result = await service.getProblemUpdateHistory(1)

      expect(result).to.deep.equal(
        updateHistories.filter((h) => h.problemId === 1)
      )
    })

    it('should return an empty array when there is no update history', async () => {
      db.updateHistory.findMany.resolves([])

      const result = await service.getProblemUpdateHistory(99)

      expect(result).to.deep.equal([])
    })
  })

  describe('deleteProblem', () => {
    it('should return deleted problem', async () => {
      db.problem.findFirstOrThrow.resolves(problems[0])
      db.problem.delete.resolves(problems[0])
      const result = await service.deleteProblem(
        problemId,
        user[0].role!,
        user[0].id!
      )
      expect(result).to.deep.equal(problems[0])
    })
  })
})
