import { ConfigService } from '@nestjs/config'
import { Test, type TestingModule } from '@nestjs/testing'
import { expect } from 'chai'
import { stub } from 'sinon'
import { UnprocessableDataException } from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import { Language } from '@admin/@generated/prisma/language.enum'
import { Level } from '@admin/@generated/prisma/level.enum'
import type { Problem } from '@admin/@generated/problem/problem.model'
import { S3Provider } from '@admin/storage/s3.provider'
import { StorageService } from '@admin/storage/storage.service'
import type { Template } from './model/template.input'
import type { Testcase } from './model/testcase.input'
import { ProblemService } from './problem.service'

const template: Template = {
  language: Language.Cpp,
  code: [
    {
      id: 1,
      text: 'int main(void) {}',
      locked: false
    }
  ]
}
const problems: Problem[] = [
  {
    id: 1,
    createdById: 1,
    groupId: 1,
    title: 'group problem0',
    description: 'description1',
    inputDescription: 'inputDescription1',
    outputDescription: 'outputDescription1',
    hint: 'hit rather hint',
    template: [template],
    languages: [Language.Cpp],
    timeLimit: 0,
    memoryLimit: 0,
    difficulty: Level.Level2,
    source: 'mustard source',
    createTime: undefined,
    updateTime: undefined,
    inputExamples: [],
    outputExamples: []
  },
  {
    id: 2,
    createdById: 1,
    groupId: 1,
    title: 'group problem1',
    description: 'description2',
    inputDescription: 'inputDescription2',
    outputDescription: 'outputDescription2',
    hint: 'hit rather hint',
    template: [template],
    languages: [Language.Cpp],
    timeLimit: 0,
    memoryLimit: 0,
    difficulty: Level.Level2,
    source: 'soy source',
    createTime: undefined,
    updateTime: undefined,
    inputExamples: [],
    outputExamples: []
  }
]

const testcaseInput: Testcase = {
  input: "wake up, daddy's home",
  output: 'welcome home, sir'
}

const db = {
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
    deleteMany: stub(),
    findMany: stub(),
    update: stub()
  }
}

const problemId = 1
const groupId = 1

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
})
