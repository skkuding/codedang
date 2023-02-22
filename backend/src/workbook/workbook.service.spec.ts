import { Test, TestingModule } from '@nestjs/testing'
import { expect } from 'chai'
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
    isVisible: true,
    createTime: DATETIME,
    updateTime: DATETIME
  },
  {
    id: 2,
    createdById: 1,
    groupId: 1,
    title: 'thisistitle2',
    description: 'thisisdescription2',
    isVisible: false,
    createTime: DATETIME,
    updateTime: DATETIME
  },
  {
    id: 3,
    createdById: 1,
    groupId: 2,
    title: 'thisistitle3',
    description: 'thisisdescription3',
    isVisible: true,
    createTime: DATETIME,
    updateTime: DATETIME
  },
  {
    id: 4,
    createdById: 1,
    groupId: 2,
    title: 'thisistitle4',
    description: 'thisisdescription4',
    isVisible: true,
    createTime: DATETIME,
    updateTime: DATETIME
  }
]

const createWorkbookDto = {
  title: 'createworkbook',
  description: 'description',
  isVisible: false
}

const updateWorkbookDto = {
  title: 'updateworkbook',
  description: 'description',
  isVisible: false
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

const showIdTitle = ({ id, title }: Workbook) => ({
  id,
  title
})

const publicWorkbooks = [
  showTitleDescriptionUpdatedTime(workbookArray[0]),
  showTitleDescriptionUpdatedTime(workbookArray[1])
]
const isVisiblePublicWorkbooks = [
  showTitleDescriptionUpdatedTime(workbookArray[0])
]
const groupWorkbooks = [
  showTitleDescriptionUpdatedTime(workbookArray[2]),
  showTitleDescriptionUpdatedTime(workbookArray[3])
]
const onePublicWorkbook = showIdTitle(workbookArray[0])
const oneGroupWorkbook = workbookArray[2]
const GROUP_ID = 2
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
    db.workbook.findMany.resolves(isVisiblePublicWorkbooks)

    const returnedPublicWorkbooks = await workbookService.getWorkbooks(
      0,
      3,
      false
    )
    expect(returnedPublicWorkbooks).to.deep.equal(isVisiblePublicWorkbooks)
  })

  it('get a list of public workbooks(admin)', async () => {
    db.workbook.findMany.resolves(publicWorkbooks)

    const returnedPublicWorkbooks = await workbookService.getWorkbooks(
      0,
      3,
      true
    )
    expect(returnedPublicWorkbooks).to.deep.equal(publicWorkbooks)
  })

  it('get a list of private group workbooks', async () => {
    db.workbook.findMany.resolves(groupWorkbooks)

    const returnedGroupWorkbooks = await workbookService.getWorkbooks(
      0,
      3,
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

    const returnedWorkbook = await workbookService.getWorkbook(
      workbookId,
      false
    )
    expect(returnedWorkbook).to.deep.equal(onePublicWorkbook)

    workbookId = 9999999
    await expect(
      workbookService.getWorkbook(workbookId, false)
    ).to.be.rejectedWith(EntityNotExistException)
  })

  it('make a workbook', async () => {
    db.workbook.create.onFirstCall().resolves(oneGroupWorkbook)

    const createdWorkbook = await workbookService.createWorkbook(
      CREATE_BY_ID,
      GROUP_ID,
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
      .rejects(new EntityNotExistException('workbook'))

    const updatedWorkbook = await workbookService.updateWorkbook(
      GROUP_ID,
      workbookId,
      updateWorkbookDto
    )
    expect(updatedWorkbook).to.deep.equal(oneGroupWorkbook)

    workbookId = 9999999
    await expect(
      workbookService.updateWorkbook(GROUP_ID, workbookId, updateWorkbookDto)
    ).to.be.rejectedWith(EntityNotExistException)
  })

  it('delete a workbook', async () => {
    let workbookId = 4
    db.workbook.delete
      .onFirstCall()
      .resolves(oneGroupWorkbook)
      .onSecondCall()
      .rejects(new EntityNotExistException('workbook'))

    const deletedWorkbook = await workbookService.deleteWorkbook(
      GROUP_ID,
      workbookId
    )
    expect(deletedWorkbook).to.deep.equal(oneGroupWorkbook)

    workbookId = 9999999
    await expect(
      workbookService.deleteWorkbook(GROUP_ID, workbookId)
    ).to.be.rejectedWith(EntityNotExistException)
  })
})
