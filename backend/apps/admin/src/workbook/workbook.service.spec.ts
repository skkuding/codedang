import { Test, type TestingModule } from '@nestjs/testing'
import type { Problem, Submission, Workbook, WorkbookProblem } from '@generated'
import { expect } from 'chai'
import { stub } from 'sinon'
import {
  ConflictFoundException,
  EntityNotExistException,
  UnprocessableDataException
} from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import type {
  CreateWorkbookInput,
  UpdateWorkbookInput
} from './model/workbook.input'
import { WorkbookService } from './workbook.service'

const db = {
  workbook: {
    findMany: stub(),
    findFirstOrThrow: stub(),
    create: stub(),
    delete: stub()
  },
  workbookProblem: {
    findMany: stub(),
    findFirstOrThrow: stub(),
    findUnique: stub(),
    create: stub()
  },
  submission: {
    findMany: stub()
  },
  problem: {
    findFirstOrThrow: stub()
  }
}

describe('WorkbookService', () => {
  let service: WorkbookService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WorkbookService, { provide: PrismaService, useValue: db }]
    }).compile()

    service = module.get<WorkbookService>(WorkbookService)
  })

  it('should be defined', () => {
    expect(service).to.be.ok
  })

  describe('getWorkbooks', () => {
    it('should return workbooks', async () => {
      //given
      const exampleWorkbook: Workbook = {
        id: 1,
        createdById: 1,
        createTime: new Date(),
        description: 'test',
        groupId: 1,
        isVisible: true,
        title: 'test',
        updateTime: new Date()
      }
      db.workbook.findMany.resolves([exampleWorkbook])

      //when
      const result = await service.getWorkbooks(1, 1, 1)

      //then
      expect(result).to.deep.equals([exampleWorkbook])
    })
  })

  describe('getWorkbook', () => {
    it('should return workbook detail ', async () => {
      //given
      const exampleWorkbook: Partial<Workbook> = {
        id: 1,
        title: 'test'
      }
      const exampleRawProblems: { problem: Partial<Problem> }[] = [
        {
          problem: {
            id: 1,
            title: 'test'
          }
        }
      ]
      const exampleSubmissions: Submission[] = [
        {
          id: 'test',
          userId: 1,
          problemId: 1,
          contestId: 1,
          code: ['test'],
          createTime: new Date(),
          updateTime: new Date(),
          workbookId: 1,
          language: 'C',
          result: null
        }
      ]
      const exampleWorkbookDetail: Partial<Workbook> & {
        problems: Partial<Problem>[]
      } & {
        submissions: Partial<Submission>[]
      } = {
        id: 1,
        title: 'test',
        problems: [
          {
            id: 1,
            title: 'test'
          }
        ],
        submissions: [
          {
            id: 'test',
            userId: 1,
            problemId: 1,
            contestId: 1,
            code: ['test'],
            createTime: new Date(),
            updateTime: new Date(),
            workbookId: 1,
            language: 'C',
            result: null
          }
        ]
      }
      db.workbook.findFirstOrThrow.resolves(exampleWorkbook)
      db.workbookProblem.findMany.resolves(exampleRawProblems)
      db.submission.findMany.resolves(exampleSubmissions)
      //when
      const result = await service.getWorkbook(1, 1)

      //then
      expect(result).to.deep.equals(exampleWorkbookDetail)
    })

    it('should handle NotFoundError', async () => {
      // given
      db.workbook.findFirstOrThrow.rejects(
        new EntityNotExistException('Workbook not found')
      )

      // when & then
      await expect(service.getWorkbook(1, 10)).to.be.rejectedWith(
        EntityNotExistException
      )
    })
  })

  describe('createWorkbook', () => {
    it('should return new Workbook', async () => {
      //given
      const exampleCreateWorkbookInput: CreateWorkbookInput = {
        title: 'test',
        description: 'test',
        isVisible: true,
        createTime: new Date(),
        updateTime: new Date()
      }
      const exampleNewWorkbook: Workbook = {
        id: 1,
        createdById: 1,
        createTime: new Date(),
        description: 'test',
        groupId: 1,
        isVisible: true,
        title: 'test',
        updateTime: new Date()
      }
      db.workbook.create.resolves(exampleNewWorkbook)

      //when
      const result = await service.createWorkbook(
        1,
        exampleCreateWorkbookInput,
        1
      )

      //then
      expect(result).to.deep.equals(exampleNewWorkbook)
    })
  })

  describe('updateWorkbook', () => {
    it('should return updated Workbook', async () => {
      //given
      const exampleWorkbook: Workbook = {
        id: 1,
        createdById: 1,
        groupId: 1,
        title: 'test',
        description: 'test',
        isVisible: true,
        createTime: new Date(),
        updateTime: new Date()
      }
      const exampleUpdateWorkbookInput: UpdateWorkbookInput = {
        id: 1,
        title: 'test',
        description: 'test',
        isVisible: true,
        createTime: new Date(),
        updateTime: new Date()
      }
      const exampleUpdatedWorkbook: Workbook = {
        id: 1,
        createdById: 1,
        createTime: new Date(),
        description: 'test',
        groupId: 1,
        isVisible: true,
        title: 'test',
        updateTime: new Date()
      }
      db.workbook.findFirstOrThrow.resolves(exampleWorkbook)
      db.workbook.create.resolves(exampleUpdatedWorkbook)

      //when
      const result = await service.createWorkbook(
        1,
        exampleUpdateWorkbookInput,
        1
      )

      //then
      expect(result).to.deep.equals(exampleUpdatedWorkbook)
    })

    it('should handle NotFoundError', async () => {
      // given
      const exampleUpdateWorkbookInput: UpdateWorkbookInput = {
        id: 1,
        title: 'test',
        description: 'test',
        isVisible: true,
        createTime: new Date(),
        updateTime: new Date()
      }
      db.workbook.findFirstOrThrow.rejects(
        new EntityNotExistException('Workbook not found')
      )

      // when & then
      await expect(
        service.updateWorkbook(1, exampleUpdateWorkbookInput)
      ).to.be.rejectedWith(EntityNotExistException)
    })
  })

  describe('deleteWorkbook', () => {
    it('should return deleted Workbook', async () => {
      //given
      const exampleWorkbook: Workbook = {
        id: 1,
        createdById: 1,
        groupId: 1,
        title: 'test',
        description: 'test',
        isVisible: true,
        createTime: new Date(),
        updateTime: new Date()
      }
      const exampleDeletedWorkbook: Workbook = {
        id: 1,
        createdById: 1,
        createTime: new Date(),
        description: 'test',
        groupId: 1,
        isVisible: true,
        title: 'test',
        updateTime: new Date()
      }
      db.workbook.findFirstOrThrow.resolves(exampleWorkbook)
      db.workbook.delete.resolves(exampleDeletedWorkbook)

      //when
      const result = await service.deleteWorkbook(1)

      //then
      expect(result).to.deep.equals(exampleDeletedWorkbook)
    })
    it('should handle NotFoundError', async () => {
      // given

      db.workbook.findFirstOrThrow.rejects(
        new EntityNotExistException('Workbook not found')
      )

      // when & then
      await expect(service.deleteWorkbook(10)).to.be.rejectedWith(
        EntityNotExistException
      )
    })
  })

  describe('createWorkbookProblem', () => {
    it('should return new WorkbookProblems', async () => {
      //given
      const exampleWorkbook: Workbook = {
        id: 1,
        createdById: 1,
        groupId: 1,
        title: 'test',
        description: 'test',
        isVisible: true,
        createTime: new Date(),
        updateTime: new Date()
      }
      const exampleProblem: Problem = {
        id: 1,
        createdById: 1,
        groupId: 1,
        title: 'test',
        description: 'test',
        inputDescription: 'test',
        outputDescription: 'test',
        hint: 'test',
        template: [],
        languages: ['C'],
        timeLimit: 1000,
        memoryLimit: 512,
        difficulty: 'Level1',
        source: 'test',
        createTime: new Date(),
        updateTime: new Date(),
        inputExamples: [],
        outputExamples: [],
        exposeTime: new Date()
      }
      const exampleWorkbookProblem: WorkbookProblem = {
        id: 'test',
        workbookId: 1,
        problemId: 1,
        createTime: new Date(),
        updateTime: new Date()
      }

      db.workbook.findFirstOrThrow.resolves(exampleWorkbook)
      db.problem.findFirstOrThrow.resolves(exampleProblem)
      db.workbookProblem.findUnique.resolves(null)
      db.workbookProblem.create.resolves(exampleWorkbookProblem)
      //when
      const result = await service.createWorkbookProblems(1, [1], 1)

      //then
      expect(result).to.deep.equals([exampleWorkbookProblem])
    })

    it('should handle Workbook NotFoundError', async () => {
      // given

      db.workbook.findFirstOrThrow.rejects(
        new EntityNotExistException('Workbook not found')
      )

      // when & then
      await expect(
        service.createWorkbookProblems(1, [1, 2, 3, 4, 5], 10)
      ).to.be.rejectedWith(EntityNotExistException)
    })

    it('should handle Problem NotFoundError', async () => {
      // given
      const exampleWorkbook: Workbook = {
        id: 1,
        createdById: 1,
        groupId: 1,
        title: 'test',
        description: 'test',
        isVisible: true,
        createTime: new Date(),
        updateTime: new Date()
      }
      db.workbook.findFirstOrThrow.resolves(exampleWorkbook)
      db.problem.findFirstOrThrow.rejects(
        new EntityNotExistException('Problem not found')
      )

      // when & then
      await expect(
        service.createWorkbookProblems(1, [10, 11, 12], 10)
      ).to.be.rejectedWith(EntityNotExistException)
    })
    it('should handle Problem not beloning to the Group', async () => {
      // given
      const exampleWorkbook: Workbook = {
        id: 1,
        createdById: 1,
        groupId: 1,
        title: 'test',
        description: 'test',
        isVisible: true,
        createTime: new Date(),
        updateTime: new Date()
      }
      const exampleProblem: Problem = {
        id: 1,
        createdById: 1,
        groupId: 1,
        title: 'test',
        description: 'test',
        inputDescription: 'test',
        outputDescription: 'test',
        hint: 'test',
        template: [],
        languages: ['C'],
        timeLimit: 1000,
        memoryLimit: 512,
        difficulty: 'Level1',
        source: 'test',
        createTime: new Date(),
        updateTime: new Date(),
        inputExamples: [],
        outputExamples: [],
        exposeTime: new Date()
      }
      db.workbook.findFirstOrThrow.resolves(exampleWorkbook)
      db.problem.findFirstOrThrow.resolves(exampleProblem)

      // when & then
      await expect(
        service.createWorkbookProblems(2, [10, 11, 12], 10)
      ).to.be.rejectedWith(UnprocessableDataException)
    })

    it('should throw error when given WorkbookProblem record already exists', async () => {
      // given
      const exampleWorkbook: Workbook = {
        id: 1,
        createdById: 1,
        groupId: 1,
        title: 'test',
        description: 'test',
        isVisible: true,
        createTime: new Date(),
        updateTime: new Date()
      }
      const exampleProblem: Problem = {
        id: 1,
        createdById: 1,
        groupId: 1,
        title: 'test',
        description: 'test',
        inputDescription: 'test',
        outputDescription: 'test',
        hint: 'test',
        template: [],
        languages: ['C'],
        timeLimit: 1000,
        memoryLimit: 512,
        difficulty: 'Level1',
        source: 'test',
        createTime: new Date(),
        updateTime: new Date(),
        inputExamples: [],
        outputExamples: [],
        exposeTime: new Date()
      }
      const exampleWorkbookProblem: WorkbookProblem = {
        id: 'test',
        workbookId: 1,
        problemId: 1,
        createTime: new Date(),
        updateTime: new Date()
      }
      db.workbook.findFirstOrThrow.resolves(exampleWorkbook)
      db.problem.findFirstOrThrow.resolves(exampleProblem)
      db.workbookProblem.findUnique.resolves(exampleWorkbookProblem)

      // when & then
      await expect(
        service.createWorkbookProblems(1, [1, 2, 3, 4, 5], 1)
      ).to.be.rejectedWith(ConflictFoundException)
    })
  })
})
