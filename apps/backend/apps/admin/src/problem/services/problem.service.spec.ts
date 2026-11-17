import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { ConfigService } from '@nestjs/config'
import { Test, type TestingModule } from '@nestjs/testing'
import { Level } from '@generated'
import { Role } from '@prisma/client'
import { expect } from 'chai'
import { spy, stub } from 'sinon'
import { AttachmentService } from '@libs/attachment'
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
import {
  FileService,
  ProblemAttachmentService,
  ProblemService,
  TagService,
  TestcaseService
} from './'

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
    findUniqueOrThrow: stub(),
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
  $queryRaw: stub().resolves([]),
  file: {
    findMany: stub().resolves([]),
    updateMany: stub(),
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
db.$transaction.callsFake(async (arg) =>
  typeof arg === 'function' ? arg(db) : Promise.all(arg)
)

describe('ProblemService', () => {
  let service: ProblemService
  let storageService: StorageService
  let testcaseService: TestcaseService
  let problemAttachmentService: ProblemAttachmentService
  let configService: ConfigService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProblemService,
        { provide: PrismaService, useValue: db },
        StorageService,
        TestcaseService,
        TagService,
        FileService,
        ProblemAttachmentService,
        AttachmentService,
        ConfigService,
        S3Provider,
        { provide: CACHE_MANAGER, useValue: { del: () => null } }
      ]
    }).compile()

    service = module.get<ProblemService>(ProblemService)
    storageService = module.get<StorageService>(StorageService)
    testcaseService = module.get<TestcaseService>(TestcaseService)
    problemAttachmentService = module.get<ProblemAttachmentService>(
      ProblemAttachmentService
    )
    configService = module.get<ConfigService>(ConfigService)
    db.problem.findUniqueOrThrow.resolves(problems[0])
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

    it('should create testcases in the problem transaction', async () => {
      db.problem.create.resolves(problems[0])
      const createTestcases = stub(
        testcaseService,
        'createTestcasesLegacy'
      ).resolves()

      await service.createProblem(
        input,
        problems[0].createdById!,
        user[0].role!
      )

      expect(createTestcases.calledOnce).to.be.true
      expect(createTestcases.firstCall.args[2]).to.equal(db)
    })

    it('should reject when testcase creation fails in the transaction', async () => {
      db.problem.create.resolves(problems[0])
      stub(testcaseService, 'createTestcasesLegacy').rejects(
        new Error('testcase failure')
      )

      await expect(
        service.createProblem(input, problems[0].createdById!, user[0].role!)
      ).to.be.rejectedWith('testcase failure')
    })
  })

  describe('createProblem with an unreadable attachment id', () => {
    it('should reject the problem instead of leaving the file unattached', async () => {
      const newId = '16fd2706-8baf-433b-82eb-8c7fada847da'
      db.file.findMany.resolves([{ filename: newId }])
      db.problem.create.resetHistory()

      await expect(
        service.createProblem(
          {
            title: problems[0].title,
            description: `<img alt=don't data-attachment-id="${newId}">`,
            inputDescription: '',
            outputDescription: '',
            hint: '',
            isVisible: false,
            template: [],
            languages: problems[0].languages,
            solution: [],
            timeLimit: 1000,
            memoryLimit: 256,
            difficulty: Level.Level1,
            source: '',
            testcases: [testcaseInput],
            tagIds: []
          },
          problems[0].createdById!,
          user[0].role!
        )
      ).to.be.rejectedWith(UnprocessableDataException)
      expect(db.problem.create.called).to.be.false
      db.file.findMany.resolves([])
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

    it('should sync testcases in the transaction with the locked zip flags', async () => {
      db.problem.findFirstOrThrow.resolves({
        ...problems[0],
        isSampleUploadedByZip: false,
        isHiddenUploadedByZip: false
      })
      db.problem.findUniqueOrThrow.resolves({
        ...problems[0],
        isSampleUploadedByZip: false,
        isHiddenUploadedByZip: true
      })
      db.problem.update.resolves(problems[0])
      db.problemTestcase.findMany.resolves([])
      const sync = stub(testcaseService, 'syncTestcases').resolves()

      await service.updateProblem(
        { id: problemId, testcases: [testcase] },
        user[0].role!,
        user[0].id!
      )

      const [id, isSample, isHidden, , tx] = sync.firstCall.args
      expect([id, isSample, isHidden]).to.deep.equal([problemId, false, true])
      expect(tx).to.equal(db)
      expect(sync.calledBefore(db.problem.update)).to.be.true
    })

    it('should diff attachments against the body read in the transaction', async () => {
      const keptId = '0f8fad5b-d9cb-469f-a165-70867728950e'
      const removedId = '7c9e6679-7425-40de-944b-e07fc1f90ae7'
      const addedId = '16fd2706-8baf-433b-82eb-8c7fada847da'
      db.problem.findFirstOrThrow.resolves(problems[0])
      db.problem.findUniqueOrThrow.resolves({
        ...problems[0],
        description: `<img data-attachment-id="${removedId}">`,
        inputDescription: `<img data-attachment-id="${keptId}">`
      })
      db.problem.update.resolves(problems[0])
      const attach = stub(problemAttachmentService, 'attach').resolves()
      const findDeletable = stub(
        problemAttachmentService,
        'findDeletable'
      ).resolves([removedId])
      const deleteRecords = stub(
        problemAttachmentService,
        'deleteRecords'
      ).resolves()

      await service.updateProblem(
        {
          id: problemId,
          description: `<img data-attachment-id="${addedId}">`
        },
        user[0].role!,
        user[0].id!
      )

      expect(db.$queryRaw.called).to.be.true
      expect(attach.firstCall.args[1].ids).to.deep.equal([addedId])
      expect(findDeletable.firstCall.args[2]).to.deep.equal([removedId])
      expect(deleteRecords.firstCall.args[2]).to.deep.equal([removedId])
    })

    it('should reject replacing an attachment id with its storage URL', async () => {
      const attachedId = '0f8fad5b-d9cb-469f-a165-70867728950e'
      stub(configService, 'get').callsFake((key: string) =>
        key === 'MEDIA_CDN_URL' ? 'https://media.codedang.com' : undefined
      )
      db.problem.findFirstOrThrow.resolves(problems[0])
      db.problem.findUniqueOrThrow.resolves({
        ...problems[0],
        description: `<img data-attachment-id="${attachedId}">`
      })
      db.file.findMany.resolves([{ filename: attachedId }])
      db.file.deleteMany.resetHistory()
      db.problem.update.resetHistory()

      await expect(
        service.updateProblem(
          {
            id: problemId,
            description: `<img src="https://media.codedang.com/${attachedId}">`
          },
          user[0].role!,
          user[0].id!
        )
      ).to.be.rejectedWith(UnprocessableDataException)
      expect(db.file.deleteMany.called).to.be.false
      expect(db.problem.update.called).to.be.false
      db.file.findMany.resolves([])
    })

    it('should reject an edit that hides an attached id from the parser', async () => {
      const attachedId = '0f8fad5b-d9cb-469f-a165-70867728950e'
      db.problem.findFirstOrThrow.resolves(problems[0])
      db.problem.findUniqueOrThrow.resolves({
        ...problems[0],
        description: `<img data-attachment-id="${attachedId}">`
      })
      db.file.findMany.resolves([{ filename: attachedId }])
      db.file.deleteMany.resetHistory()
      db.problem.update.resetHistory()

      await expect(
        service.updateProblem(
          {
            id: problemId,
            description: `<img alt=don't data-attachment-id="${attachedId}">`
          },
          user[0].role!,
          user[0].id!
        )
      ).to.be.rejectedWith(UnprocessableDataException)
      expect(db.file.deleteMany.called).to.be.false
      expect(db.problem.update.called).to.be.false
      db.file.findMany.resolves([])
    })

    it('should reject adding a new attachment the parser cannot read', async () => {
      const newId = '16fd2706-8baf-433b-82eb-8c7fada847da'
      db.problem.findFirstOrThrow.resolves(problems[0])
      db.problem.findUniqueOrThrow.resolves(problems[0])
      db.file.findMany.resolves([{ filename: newId }])
      db.file.updateMany.resetHistory()
      db.problem.update.resetHistory()

      await expect(
        service.updateProblem(
          {
            id: problemId,
            description: `<img alt=don't data-attachment-id="${newId}">`
          },
          user[0].role!,
          user[0].id!
        )
      ).to.be.rejectedWith(UnprocessableDataException)
      expect(db.file.updateMany.called).to.be.false
      expect(db.problem.update.called).to.be.false
      db.file.findMany.resolves([])
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
