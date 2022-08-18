import { Test, TestingModule } from '@nestjs/testing'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime'
import { EntityNotExistException } from 'src/common/exception/business.exception'
import { PrismaService } from 'src/prisma/prisma.service'
import { WorkbookService } from './workbook.service'

const DATETIME = new Date(2022, 8, 8)
const DATETIME_TOMORROW = new Date()
DATETIME_TOMORROW.setDate(DATETIME.getDate() + 1)
const workbookArray = [
  {
    id: 1,
    created_by_id: 1,
    group_id: 1,
    title: 'thisistitle1',
    description: 'thisisdescription1',
    start_time: DATETIME,
    end_time: DATETIME_TOMORROW,
    allow_partial_score: true,
    visible: true
  },
  {
    id: 2,
    created_by_id: 1,
    group_id: 1,
    title: 'thisistitle2',
    description: 'thisisdescription2',
    start_time: DATETIME,
    end_time: DATETIME_TOMORROW,
    allow_partial_score: true,
    visible: false
  },
  {
    id: 3,
    created_by_id: 1,
    group_id: 2,
    title: 'thisistitle3',
    description: 'thisisdescription3',
    start_time: DATETIME,
    end_time: DATETIME_TOMORROW,
    allow_partial_score: true,
    visible: true
  },
  {
    id: 4,
    created_by_id: 1,
    group_id: 2,
    title: 'thisistitle4',
    description: 'thisisdescription4',
    start_time: DATETIME,
    end_time: DATETIME_TOMORROW,
    allow_partial_score: true,
    visible: false
  }
]

const createWorkbookDto = {
  title: 'createworkbook',
  description: 'description',
  start_time: DATETIME,
  end_time: DATETIME_TOMORROW,
  visible: false,
  allow_partial_score: false,
  group_id: 2,
  created_by_id: 1
}

const updateWorkbookDto = {
  title: 'updateworkbook',
  description: 'description',
  start_time: DATETIME,
  end_time: DATETIME_TOMORROW,
  visible: false,
  allow_partial_score: false
}

const publicWorkbooks = [workbookArray[0], workbookArray[1]]
const visiblePublicWorkbooks = [workbookArray[0]]
const groupWorkbooks = [workbookArray[2], workbookArray[3]]
const onePublicWorkbook = publicWorkbooks[0]
const oneGroupWorkbook = groupWorkbooks[0]
const PUBLIC_GROUP_ID = 1
const PRIVATE_GROUP_ID = 2

const db = {
  workbook: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
  }
}

describe('WorkbookService', () => {
  let workbookService: WorkbookService
  let prisma: PrismaService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WorkbookService, { provide: PrismaService, useValue: db }]
    }).compile()

    workbookService = module.get<WorkbookService>(WorkbookService)
    prisma = module.get<PrismaService>(PrismaService)
  })

  it('should be defined', () => {
    expect(workbookService).toBeDefined()
  })

  it('get a list of public workbooks', async () => {
    prisma.workbook.findMany = jest.fn().mockReturnValueOnce(publicWorkbooks)

    const returnedPublicWorkbooks = await workbookService.getWorkbooksByGroupId(
      PUBLIC_GROUP_ID,
      false
    )
    expect(returnedPublicWorkbooks).toEqual(publicWorkbooks)
  })

  it('get a list of public workbooks(admin)', async () => {
    prisma.workbook.findMany = jest
      .fn()
      .mockReturnValueOnce(visiblePublicWorkbooks)

    const returnedPublicWorkbooks = await workbookService.getWorkbooksByGroupId(
      PUBLIC_GROUP_ID,
      false
    )
    expect(returnedPublicWorkbooks).toEqual(visiblePublicWorkbooks)
  })

  it('get a list of private group workbooks', async () => {
    prisma.workbook.findMany = jest.fn().mockReturnValueOnce(groupWorkbooks)

    const returnedGroupWorkbooks = await workbookService.getWorkbooksByGroupId(
      PRIVATE_GROUP_ID,
      false
    )
    expect(returnedGroupWorkbooks).toEqual(groupWorkbooks)
  })

  it('get details of a workbook', async () => {
    let workbookId = 1
    prisma.workbook.findFirst = jest
      .fn()
      .mockReturnValueOnce(onePublicWorkbook)
      .mockRejectedValueOnce(new EntityNotExistException('workbook'))

    const returnedWorkbook = await workbookService.getWorkbookById(
      workbookId,
      false
    )
    expect(returnedWorkbook).toEqual(onePublicWorkbook)

    workbookId = 9999999
    await expect(
      workbookService.getWorkbookById(workbookId, false)
    ).rejects.toThrow(EntityNotExistException)
  })

  it('make a workbook', async () => {
    prisma.workbook.create = jest
      .fn()
      .mockReturnValueOnce(oneGroupWorkbook)
      .mockRejectedValueOnce(
        new PrismaClientKnownRequestError('message', 'code', 'clientVersion')
      )

    const createdWorkbook = await workbookService.createWorkbook(
      PRIVATE_GROUP_ID,
      createWorkbookDto
    )
    expect(createdWorkbook).toEqual(oneGroupWorkbook)

    const WRONG_GROUP_ID = 9999999
    await expect(
      workbookService.createWorkbook(WRONG_GROUP_ID, createWorkbookDto)
    ).rejects.toThrow(PrismaClientKnownRequestError)
  })

  it('update details of a workbook', async () => {
    let workbookId = 4
    prisma.workbook.update = jest
      .fn()
      .mockReturnValueOnce(oneGroupWorkbook)
      .mockRejectedValueOnce(
        new PrismaClientKnownRequestError('message', 'code', 'clientVersion')
      )

    const updatedWorkbook = await workbookService.updateWorkbook(
      workbookId,
      updateWorkbookDto
    )
    expect(updatedWorkbook).toEqual(oneGroupWorkbook)

    workbookId = 9999999
    await expect(
      workbookService.updateWorkbook(workbookId, updateWorkbookDto)
    ).rejects.toThrow(PrismaClientKnownRequestError)
  })

  it('delete a workbook', async () => {
    let workbookId = 4
    prisma.workbook.delete = jest
      .fn()
      .mockReturnValueOnce(oneGroupWorkbook)
      .mockRejectedValueOnce(
        new PrismaClientKnownRequestError('message', 'code', 'clientVersion')
      )

    const deletedWorkbook = await workbookService.deleteWorkbook(workbookId)
    expect(deletedWorkbook).toEqual(oneGroupWorkbook)

    workbookId = 9999999
    await expect(workbookService.deleteWorkbook(workbookId)).rejects.toThrow(
      PrismaClientKnownRequestError
    )
  })
})
