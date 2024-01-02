import { Test, type TestingModule } from '@nestjs/testing'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import { expect } from 'chai'
import { stub } from 'sinon'
import { EntityNotExistException } from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import type {
  CreateWorkbookInput,
  UpdateWorkbookInput
} from './model/workbook.input'
import type { WorkbookModel } from './model/workbook.model'
import type { WorkbookDetail } from './model/workbook.output'
import { WorkbookService } from './workbook.service'

const db = {
  group: {
    findFirstOrThrow: stub()
  },
  workbook: {
    findMany: stub(),
    findFirstOrThrow: stub(),
    create: stub(),
    update: stub(),
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

const exampleWorkbook: WorkbookModel = {
  id: 1,
  createdById: 1,
  createTime: new Date(),
  description: 'test',
  groupId: 1,
  isVisible: true,
  title: 'test',
  updateTime: new Date()
}

const exampleWorkbookAndSubmssions = {
  ...exampleWorkbook,
  submission: [
    {
      id: 'a7ebfe',
      userId: 9,
      problemId: 6,
      contestId: null,
      workbookId: 1
    },
    {
      id: '00513e',
      userId: 10,
      problemId: 7,
      contestId: null,
      workbookId: 1
    }
  ]
}

const exampleWorkbookProblemsAndProblems = [
  {
    order: 1,
    workbookId: 1,
    problemId: 1,
    createTime: new Date(),
    updateTime: new Date(),
    problem: {
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
  },
  {
    order: 2,
    workbookId: 1,
    problemId: 2,
    createTime: new Date(),
    updateTime: new Date(),
    problem: {
      id: 2,
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
  }
]

const exampleWorkbookDetail: WorkbookDetail = {
  ...exampleWorkbook,
  submissions: [
    {
      id: 'a7ebfe',
      userId: 9,
      problemId: 6,
      contestId: null,
      workbookId: 1
    },
    {
      id: '00513e',
      userId: 10,
      problemId: 7,
      contestId: null,
      workbookId: 1
    }
  ],
  problems: [
    {
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
    },
    {
      id: 2,
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
  ]
}
const exampleGroup = {
  id: 1,
  groupName: 'test',
  description: 'test',
  createTime: new Date(),
  updateTime: new Date()
}
const exampleCreateWorkbookInput: CreateWorkbookInput = {
  title: 'test',
  description: 'test',
  isVisible: true,
  createTime: new Date(),
  updateTime: new Date()
}

const exampleNewWorkbook: WorkbookModel = {
  id: 1,
  createdById: 1,
  createTime: new Date(),
  description: 'test',
  groupId: 1,
  isVisible: true,
  title: 'test',
  updateTime: new Date()
}

const exampleUpdateWorkbookInput: UpdateWorkbookInput = {
  title: 'test',
  description: 'test',
  isVisible: true,
  updateTime: new Date()
}
const exampleUpdatedWorkbook: WorkbookModel = {
  id: 1,
  createdById: 1,
  createTime: new Date(),
  description: 'test',
  groupId: 1,
  isVisible: true,
  title: 'test',
  updateTime: new Date()
}

const exampleDeletedWorkbook: WorkbookModel = {
  id: 1,
  createdById: 1,
  createTime: new Date(),
  description: 'test',
  groupId: 1,
  isVisible: true,
  title: 'test',
  updateTime: new Date()
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
      db.workbook.findMany.resolves([exampleWorkbook])

      //when
      const result = await service.getWorkbooks(1, 1, 1)

      //then
      expect(result).to.deep.equals([exampleWorkbook])
    })
  })

  describe('getWorkbook', () => {
    it('should return workbook detail ', async () => {
      db.workbook.findFirstOrThrow.resolves(exampleWorkbookAndSubmssions)
      db.workbookProblem.findMany.resolves(exampleWorkbookProblemsAndProblems)
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
      await expect(service.getWorkbook(1, -1)).to.be.rejectedWith(
        EntityNotExistException
      )
    })

    it('should handle workbook NotFoundError', async () => {
      // given

      db.workbook.findFirstOrThrow.rejects(
        new PrismaClientKnownRequestError('Record does not exist', {
          code: 'P2025',
          meta: {
            target: ['workbook']
          },
          clientVersion: '2.24.1'
        })
      )

      // when & then
      await expect(service.getWorkbook(1, -1)).to.be.rejectedWith(
        PrismaClientKnownRequestError
      )
    })
  })

  describe('createWorkbook', () => {
    it('should return new Workbook', async () => {
      //given
      db.group.findFirstOrThrow.resolves(exampleGroup)
      db.workbook.create.resolves(exampleNewWorkbook)

      //when
      const result = await service.createWorkbook(
        1,
        1,
        exampleCreateWorkbookInput
      )

      //then
      expect(result).to.deep.equals(exampleNewWorkbook)
    })

    it('should handle NotFoundError', async () => {
      // given
      db.group.findFirstOrThrow.rejects(
        new PrismaClientKnownRequestError('Record does not exist', {
          code: 'P2025',
          meta: {
            target: ['group']
          },
          clientVersion: '2.24.1'
        })
      )

      // when & then
      await expect(
        service.createWorkbook(1, 1, exampleCreateWorkbookInput)
      ).to.be.rejectedWith(PrismaClientKnownRequestError)
    })
  })

  describe('updateWorkbook', () => {
    it('should return updated Workbook', async () => {
      //given

      db.group.findFirstOrThrow.resolves(exampleGroup)
      db.workbook.update.resolves(exampleUpdatedWorkbook)

      //when
      const result = await service.updateWorkbook(
        1,
        1,
        exampleUpdateWorkbookInput
      )

      //then
      expect(result).to.deep.equals(exampleUpdatedWorkbook)
    })

    it('should handle Group NotFoundError', async () => {
      // given

      db.group.findFirstOrThrow.rejects(
        new PrismaClientKnownRequestError('Record does not exist', {
          code: 'P2025',
          meta: {
            target: ['group']
          },
          clientVersion: '2.24.1'
        })
      )

      // when & then
      await expect(
        service.updateWorkbook(1, 1, exampleUpdateWorkbookInput)
      ).to.be.rejectedWith(PrismaClientKnownRequestError)
    })
    it('should handle Workbook NotFoundError', async () => {
      // given

      db.group.findFirstOrThrow.resolves(exampleGroup)
      db.workbook.update.rejects(
        new PrismaClientKnownRequestError('Record does not exist', {
          code: 'P2025',
          meta: {
            target: ['workbook']
          },
          clientVersion: '2.24.1'
        })
      )

      // when & then
      await expect(
        service.updateWorkbook(1, 1, exampleUpdateWorkbookInput)
      ).to.be.rejectedWith(PrismaClientKnownRequestError)
    })
  })

  describe('deleteWorkbook', () => {
    it('should return deleted Workbook', async () => {
      //given
      db.group.findFirstOrThrow.resolves(exampleGroup)
      db.workbook.delete.resolves(exampleDeletedWorkbook)

      //when
      const result = await service.deleteWorkbook(1, 1)

      //then
      expect(result).to.deep.equals(exampleDeletedWorkbook)
    })
    it('should handle Group NotFoundError', async () => {
      // given

      db.group.findFirstOrThrow.rejects(
        new PrismaClientKnownRequestError('Record does not exist', {
          code: 'P2025',
          meta: {
            target: ['group']
          },
          clientVersion: '2.24.1'
        })
      )
      // when & then
      await expect(service.deleteWorkbook(1, 1)).to.be.rejectedWith(
        PrismaClientKnownRequestError
      )
    })
  })
})
