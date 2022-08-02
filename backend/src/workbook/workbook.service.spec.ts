import { Test, TestingModule } from '@nestjs/testing'
import { PrismaService } from 'src/prisma/prisma.service'
import { WorkbookService } from './workbook.service'

const workbookArray = [
  {
    created_by_id: 1,
    group_id: 1,
    title: 'thisistitle1',
    description: 'thisisdescription1',
    start_time: Date.now(),
    end_time: Date.now() + 3600
  },
  {
    created_by_id: 1,
    group_id: 1,
    title: 'thisistitle2',
    description: 'thisisdescription2',
    start_time: Date.now(),
    end_time: Date.now() + 3600
  },
  {
    created_by_id: 1,
    group_id: 2,
    title: 'thisistitle3',
    description: 'thisisdescription3',
    start_time: Date.now(),
    end_time: Date.now() + 3600
  },
  {
    created_by_id: 1,
    group_id: 2,
    title: 'thisistitle4',
    description: 'thisisdescription4',
    start_time: Date.now(),
    end_time: Date.now() + 3600
  }
]

const workbookProblemArray = [
  {
    workbook_id: 1,
    problem_id: 1,
    score: 10,
    display_id: 1
  },
  {
    workbook_id: 1,
    problem_id: 2,
    score: 10,
    display_id: 2
  }
]

const oneWorkbook = workbookArray[0]
const publicWorkbooks = [workbookArray[0], workbookArray[1]]
const groupWorkbooks = [workbookArray[2], workbookArray[3]]

const db = {
  workbook: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
  }
}

describe('WorkbookService', () => {
  let service: WorkbookService
  let prisma: PrismaService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WorkbookService, { provide: PrismaService, useValue: db }]
    }).compile()

    service = module.get<WorkbookService>(WorkbookService)
    prisma = module.get<PrismaService>(PrismaService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  it('get a list of public workbooks', () => {
    prisma.workbook.findMany = jest.fn().mockReturnValueOnce(publicWorkbooks)
    const returnedPublicWorkbooks = service.getPublicWorkbooks()
    expect(returnedPublicWorkbooks).toBe(publicWorkbooks)
  })

  it('get a list of private group workbooks', () => {
    prisma.workbook.findMany = jest.fn().mockReturnValueOnce(groupWorkbooks)
    const returnedGroupWorkbooks = service.getGroupWorkbooks()
    expect(returnedGroupWorkbooks).toBe(groupWorkbooks)
  })

  it('get details of a workbook', () => {
    prisma.workbook.findUnique = jest.fn().mockReturnValueOnce(oneWorkbook)
    const returnedWorkbook = service.getWorkbookInfo()
    expect(returnedWorkbook).toBe(oneWorkbook)
  })

  it('get problems in a workbook', () => {
    prisma.workbook.findMany = jest
      .fn()
      .mockReturnValueOnce(workbookProblemArray)
    const returnedWorkbookProblemArray = service.getWorkbookProblems()
    expect(returnedWorkbookProblemArray).toBe(workbookProblemArray)
  })

  it('make a workbook', () => {
    // TODO: insert mock
    const createdWorkbook = service.createWorkbook()
    expect(createdWorkbook).toBe(oneWorkbook)
  })

  it('update details of a workbook', () => {
    // TODO: update mock
    const updatedWorkbook = service.updateWorkbook()
    expect(updatedWorkbook).toBe(oneWorkbook)
  })
  it('delete a workbook', () => {
    // TODO: delete mock
    const deletedWorkbook = service.deleteWorkbook()
    expect(deletedWorkbook).toBe(oneWorkbook)
  })
})
