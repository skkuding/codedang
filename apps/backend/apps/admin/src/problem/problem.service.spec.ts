import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { ConfigService } from '@nestjs/config'
import { Test, type TestingModule } from '@nestjs/testing'
import { Level } from '@generated'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import { expect } from 'chai'
import { spy, stub } from 'sinon'
import {
  DuplicateFoundException,
  EntityNotExistException,
  UnprocessableDataException
} from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import { S3MediaProvider, S3Provider } from '@admin/storage/s3.provider'
import { StorageService } from '@admin/storage/storage.service'
import {
  exampleContest,
  exampleContestProblems,
  exampleOrderUpdatedContestProblems,
  exampleOrderUpdatedWorkbookProblems,
  exampleProblemTags,
  exampleProblemTestcases,
  exampleTag,
  exampleWorkbook,
  exampleWorkbookProblems,
  fileUploadInput,
  groupId,
  importedProblems,
  importedProblemsWithIsVisible,
  problemId,
  problems,
  problemsWithIsVisible,
  template,
  testcaseInput
} from './mock/mock'
import { ProblemService } from './problem.service'

/**
 * TODO: s3 관련 코드 재작성(수정) 필요
 */

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
  },
  $transaction: stub(),
  image: {
    deleteMany: stub()
  },
  submission: {
    findMany: stub()
  },
  getPaginator: PrismaService.prototype.getPaginator
}

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
        S3Provider,
        S3MediaProvider,
        { provide: CACHE_MANAGER, useValue: { del: () => null } }
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
      isVisible: false,
      template: problems[0].template,
      languages: problems[0].languages,
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
        groupId
      )
      expect(result).to.deep.equal(problemsWithIsVisible[0])
    })

    it('should reject if languages is empty', async () => {
      const uploadSpy = stub(storageService, 'uploadObject').resolves()

      await expect(
        service.createProblem(
          { ...input, languages: [] },
          problems[0].createdById!,
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
          problems[0].createdById!,
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
      const createTestcasesSpy = spy(service, 'createTestcases')
      db.problem.create.resetHistory()
      db.problem.create.onCall(0).resolves(importedProblems[0])
      db.problem.create.onCall(1).resolves(importedProblems[1])
      db.problemTestcase.create.resolves({ index: 1, id: 1 })

      const res = await service.uploadProblems(fileUploadInput, userId, groupId)

      expect(createTestcasesSpy.calledTwice).to.be.true
      expect(res).to.deep.equal(importedProblemsWithIsVisible)
    })
  })

  describe('getProblems', () => {
    it('should return group problems', async () => {
      db.problem.findMany.resolves(problems)
      const result = await service.getProblems({}, groupId, 1, 5)
      expect(result).to.deep.equal(problemsWithIsVisible)
    })
  })

  describe('getProblem', () => {
    it('should return a group problem', async () => {
      db.problem.findFirstOrThrow.resolves(problems[0])
      const result = await service.getProblem(problemId, groupId)
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
      db.submission.findMany.resolves([])
      const result = await service.updateProblem(
        {
          id: problemId,
          title: 'revised',
          testcases: [testcase]
        },
        groupId
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
          groupId
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
          groupId
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
          groupId
        )
      ).to.be.rejectedWith(UnprocessableDataException)
      expect(uploadSpy.called).to.be.false
    })
  })

  describe('deleteProblem', () => {
    it('should return deleted problem', async () => {
      db.problem.findFirstOrThrow.resolves(problems[0])
      db.problem.delete.resolves(problems[0])
      const result = await service.deleteProblem(problemId, groupId)
      expect(result).to.deep.equal(problems[0])
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
    beforeEach(() => {
      // stub의 동작 초기화
      db.workbookProblem.update.resetBehavior()
      db.workbookProblem.findFirstOrThrow.resetBehavior()
      db.workbookProblem.findMany.resetBehavior()
    })
    it('should return order-updated workbookProblems', async () => {
      //given
      const groupId = 1
      const workbookId = 1
      const orders = [2, 3, 4, 5, 6, 7, 8, 9, 10, 1]
      const exampleWorkbookProblemsToBeUpdated =
        exampleWorkbookProblems.toSorted((a, b) => a.problemId - b.problemId)
      db.workbook.findFirstOrThrow.resolves(exampleWorkbook)
      db.workbookProblem.findMany.resolves(exampleWorkbookProblems)

      // update가 Promise.all로 실행되기 때문에 각 쿼리에 대한 모의 응답을 반환하도록 설정
      for (let i = 0; i < 10; i++) {
        const record = exampleWorkbookProblemsToBeUpdated[i]
        const newOrder = orders.indexOf(record.problemId) + 1
        db.workbookProblem.update
          .withArgs({
            where: {
              // eslint-disable-next-line @typescript-eslint/naming-convention
              workbookId_problemId: {
                workbookId,
                problemId: record.problemId
              }
            },
            data: { order: newOrder }
          })
          .resolves(exampleOrderUpdatedWorkbookProblems[i])
      }
      db.$transaction.resolves(exampleOrderUpdatedWorkbookProblems)
      //when
      const result = await service.updateWorkbookProblemsOrder(
        groupId,
        workbookId,
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
      beforeEach(() => {
        // stub의 동작 초기화
        db.workbookProblem.update.resetBehavior()
        db.workbookProblem.findFirstOrThrow.resetBehavior()
        db.workbookProblem.findMany.resetBehavior()
        db.$transaction.resetBehavior()
      })
      //given
      db.workbook.findFirstOrThrow.resolves(exampleWorkbook)
      db.workbookProblem.findMany.resolves(exampleWorkbookProblems)
      db.workbookProblem.update.rejects(
        new EntityNotExistException('record not found')
      )
      db.$transaction.rejects(new EntityNotExistException('record not found'))
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
    beforeEach(() => {
      // 각 스텁의 동작 초기화
      db.contestProblem.update.resetBehavior()
      db.contestProblem.findFirstOrThrow.resetBehavior()
      db.contestProblem.findMany.resetBehavior()
      db.contest.findFirstOrThrow.resetBehavior()
    })
    it('should return order-updated ContestProblems', async () => {
      //given
      const groupId = 1
      const contestId = 1
      const orders = [2, 3, 4, 5, 6, 7, 8, 9, 10, 1]
      const exampleContestProblemsToBeUpdated = exampleContestProblems.toSorted(
        (a, b) => a.problemId - b.problemId
      )
      db.contest.findFirstOrThrow.resolves(exampleContest)
      db.contestProblem.findMany.resolves(exampleContestProblems)

      // update가 Promise.all로 실행되기 때문에 각 쿼리에 대한 모의 응답을 반환하도록 설정
      for (let i = 0; i < 10; i++) {
        const record = exampleContestProblemsToBeUpdated[i]
        const newOrder = orders.indexOf(record.problemId) + 1
        db.contestProblem.update
          .withArgs({
            where: {
              // eslint-disable-next-line @typescript-eslint/naming-convention
              contestId_problemId: {
                contestId,
                problemId: record.problemId
              }
            },
            data: { order: newOrder }
          })
          .resolves(exampleOrderUpdatedContestProblems[i])
      }
      db.$transaction.resolves(exampleOrderUpdatedContestProblems)
      //when
      const result = await service.updateContestProblemsOrder(
        groupId,
        contestId,
        orders
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
      beforeEach(() => {
        // stub의 동작 초기화
        db.workbookProblem.update.resetBehavior()
        db.workbookProblem.findFirstOrThrow.resetBehavior()
        db.workbookProblem.findMany.resetBehavior()
        db.$transaction.resetBehavior()
      })
      //given
      db.contestProblem.findMany.resolves(exampleContestProblems)

      db.contestProblem.update.rejects(
        new EntityNotExistException('record not found')
      )
      db.$transaction.rejects(new EntityNotExistException('record not found'))
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

  describe('createTag', () => {
    it('should return a created tag', async () => {
      beforeEach(() => {
        db.tag.create.resetBehavior()
      })
      db.tag.create.resolves(exampleTag)
      const result = await service.createTag('Brute Force')
      expect(result).to.deep.equal(exampleTag)
    })

    it('should handle a duplicate exception', async () => {
      beforeEach(() => {
        db.tag.create.resetBehavior()
      })
      db.tag.create.rejects(
        new PrismaClientKnownRequestError('message', {
          code: 'P2002',
          clientVersion: '5.11.0'
        })
      )
      await expect(service.createTag('something duplicate')).to.be.rejectedWith(
        DuplicateFoundException
      )
    })
  })

  describe('deleteTag', () => {
    beforeEach(() => {
      db.tag.findFirst.reset()
      db.tag.delete.reset()
    })
    afterEach(() => {
      db.tag.findFirst.reset()
      db.tag.delete.reset()
    })

    it('should return deleted tag', async () => {
      db.tag.findFirst.resolves(exampleTag)
      db.tag.delete.resolves(exampleTag)
      const result = await service.deleteTag('Brute Force')
      expect(result).to.deep.equal(exampleTag)
    })

    it('should handle a entity not exist exception', async () => {
      db.tag.findFirst.resolves(null)
      await expect(
        service.deleteTag('something does not exist')
      ).to.be.rejectedWith(EntityNotExistException)
    })
  })
  describe('getTag', () => {
    afterEach(() => {
      db.tag.findUnique.reset()
    })

    it('should return a tag object', async () => {
      db.tag.findUnique.resolves(exampleTag)
      expect(await service.getTag(1)).to.deep.equal(exampleTag)
    })

    it('should throw an EntityNotExist exception when tagId do not exist', async () => {
      await expect(service.getTag(999)).to.be.rejectedWith(
        EntityNotExistException
      )
    })
  })

  describe('getProblemTags', () => {
    afterEach(() => {
      db.problemTestcase.findMany.reset()
    })

    it('should return a problem tag array', async () => {
      db.problemTag.findMany.resolves(exampleProblemTags)
      expect(await service.getProblemTags(1)).to.deep.equal(exampleProblemTags)
    })
  })

  describe('getProblemTestcases', () => {
    it('should return a problem testcase array', async () => {
      db.problemTestcase.findMany.resolves(exampleProblemTestcases)
      expect(await service.getProblemTestcases(1)).to.deep.equal(
        exampleProblemTestcases
      )
    })
  })
})
