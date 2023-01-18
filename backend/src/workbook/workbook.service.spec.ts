import { Test, TestingModule } from '@nestjs/testing'
import { expect } from 'chai'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime'
import { EntityNotExistException } from 'src/common/exception/business.exception'
import { PrismaService } from 'src/prisma/prisma.service'
import { WorkbookService } from './workbook.service'
import { stub } from 'sinon'
import { Workbook } from '@prisma/client'

const DATETIME = new Date(2022, 8, 8)
const DATETIME_TOMORROW = new Date()
DATETIME_TOMORROW.setDate(DATETIME.getDate() + 1)
const workbookArray = [
  {
    id: 1,
    createdById: 1,
    groupId: 1,
    title: 'thisistitle1',
    description: 'thisisdescription1',
    startTime: DATETIME,
    endTime: DATETIME_TOMORROW,
    visible: true,
    createTime: DATETIME,
    updateTime: DATETIME
  },
  {
    id: 2,
    createdById: 1,
    groupId: 1,
    title: 'thisistitle2',
    description: 'thisisdescription2',
    startTime: DATETIME,
    endTime: DATETIME_TOMORROW,
    visible: false,
    createTime: DATETIME,
    updateTime: DATETIME
  },
  {
    id: 3,
    createdById: 1,
    groupId: 2,
    title: 'thisistitle3',
    description: 'thisisdescription3',
    startTime: DATETIME,
    endTime: DATETIME_TOMORROW,
    visible: true,
    createTime: DATETIME,
    updateTime: DATETIME
  },
  {
    id: 4,
    createdById: 1,
    groupId: 2,
    title: 'thisistitle4',
    description: 'thisisdescription4',
    startTime: DATETIME,
    endTime: DATETIME_TOMORROW,
    visible: true,
    createTime: DATETIME,
    updateTime: DATETIME
  }
]

const createWorkbookDto = {
  title: 'createworkbook',
  description: 'description',
  startTime: DATETIME,
  endTime: DATETIME_TOMORROW,
  visible: false
}

const updateWorkbookDto = {
  title: 'updateworkbook',
  description: 'description',
  startTime: DATETIME,
  endTime: DATETIME_TOMORROW,
  visible: false
}

const showTitleDescriptionUpdatedTime = ({
  title,
  description,
  updateTime
}: Workbook) => ({
  title,
  description,
  updateTime
})

const publicWorkbooks = [
  showTitleDescriptionUpdatedTime(workbookArray[0]),
  showTitleDescriptionUpdatedTime(workbookArray[1])
]
const visiblePublicWorkbooks = [
  showTitleDescriptionUpdatedTime(workbookArray[0])
]
const groupWorkbooks = [
  showTitleDescriptionUpdatedTime(workbookArray[2]),
  showTitleDescriptionUpdatedTime(workbookArray[3])
]
const onePublicWorkbook = workbookArray[0]
const oneGroupWorkbook = workbookArray[2]
const PUBLIC_GROUP_ID = 1
const PRIVATE_GROUP_ID = 2
const CREATE_BY_ID = 1

const db = {
  workbook: {
    findMany: stub(),
    findUnique: stub(),
    findFirst: stub(),
    create: stub(),
    update: stub(),
    delete: stub()
  }
}

describe('WorkbookService', () => {
  let workbookService: WorkbookService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WorkbookService, { provide: PrismaService, useValue: db }]
    }).compile()

    workbookService = module.get<WorkbookService>(WorkbookService)
  })

  it('should be defined', () => {
    expect(workbookService).to.be.ok
  })

  it('get a list of public workbooks(user)', async () => {
    db.workbook.findMany.resolves(visiblePublicWorkbooks)

    const returnedPublicWorkbooks = await workbookService.getWorkbooksByGroupId(
      PUBLIC_GROUP_ID,
      false
    )
    expect(returnedPublicWorkbooks).to.deep.equal(visiblePublicWorkbooks)
  })

  it('get a list of public workbooks(admin)', async () => {
    db.workbook.findMany.resolves(publicWorkbooks)

    const returnedPublicWorkbooks = await workbookService.getWorkbooksByGroupId(
      PUBLIC_GROUP_ID,
      true
    )
    expect(returnedPublicWorkbooks).to.deep.equal(publicWorkbooks)
  })

  it('get a list of private group workbooks', async () => {
    db.workbook.findMany.resolves(groupWorkbooks)

    const returnedGroupWorkbooks = await workbookService.getWorkbooksByGroupId(
      PRIVATE_GROUP_ID,
      false
    )
    expect(returnedGroupWorkbooks).to.deep.equal(groupWorkbooks)
  })

  it('get details of a workbook', async () => {
    let workbookId = 1
    db.workbook.findFirst
      .onFirstCall()
      .resolves(onePublicWorkbook)
      .onSecondCall()
      .rejects(new EntityNotExistException('workbook'))

    const returnedWorkbook = await workbookService.getWorkbookById(
      workbookId,
      false
    )
    expect(returnedWorkbook).to.deep.equal(onePublicWorkbook)

    workbookId = 9999999
    await expect(
      workbookService.getWorkbookById(workbookId, false)
    ).to.be.rejectedWith(EntityNotExistException)
  })

  it('make a workbook', async () => {
    db.workbook.create.onFirstCall().resolves(oneGroupWorkbook)

    const createdWorkbook = await workbookService.createWorkbook(
      CREATE_BY_ID,
      PRIVATE_GROUP_ID,
      createWorkbookDto
    )
    expect(createdWorkbook).to.deep.equal(oneGroupWorkbook)
  })

  it('update details of a workbook', async () => {
    let workbookId = 4
    db.workbook.update
      .onFirstCall()
      .resolves(oneGroupWorkbook)
      .onSecondCall()
      .rejects(
        new PrismaClientKnownRequestError('message', {
          code: 'P2025',
          clientVersion: '0.0.0'
        })
      )

    const updatedWorkbook = await workbookService.updateWorkbook(
      workbookId,
      updateWorkbookDto
    )
    expect(updatedWorkbook).to.deep.equal(oneGroupWorkbook)

    workbookId = 9999999
    await expect(
      workbookService.updateWorkbook(workbookId, updateWorkbookDto)
    ).to.be.rejectedWith(EntityNotExistException)
  })

  it('delete a workbook', async () => {
    let workbookId = 4
    db.workbook.delete
      .onFirstCall()
      .resolves(oneGroupWorkbook)
      .onSecondCall()
      .rejects(
        new PrismaClientKnownRequestError('message', {
          code: 'P2025',
          clientVersion: '0.0.0'
        })
      )

    const deletedWorkbook = await workbookService.deleteWorkbook(workbookId)
    expect(deletedWorkbook).to.deep.equal(oneGroupWorkbook)

    workbookId = 9999999
    await expect(workbookService.deleteWorkbook(workbookId)).to.be.rejectedWith(
      EntityNotExistException
    )
  })
})
