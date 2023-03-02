import { Test, TestingModule } from '@nestjs/testing'
import { expect } from 'chai'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime'
import { EntityNotExistException } from 'src/common/exception/business.exception'
import { PrismaService } from 'src/prisma/prisma.service'
import { WorkbookService } from './workbook.service'
import { stub } from 'sinon'
import { Workbook } from '@prisma/client'
import { OPEN_SPACE_ID } from 'src/common/constants'

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

const showIdTitleDescriptionUpdatedTime = ({
  id,
  title,
  description,
  updateTime
}: Workbook) => ({
  id,
  title,
  description,
  updateTime
})

const showIdTitle = ({ id, title }: Workbook) => ({
  id,
  title
})

const publicWorkbooks = [
  showIdTitleDescriptionUpdatedTime(workbookArray[0]),
  showIdTitleDescriptionUpdatedTime(workbookArray[1])
]
const visiblePublicWorkbooks = [
  showIdTitleDescriptionUpdatedTime(workbookArray[0])
]
const groupWorkbooks = [
  showIdTitleDescriptionUpdatedTime(workbookArray[2]),
  showIdTitleDescriptionUpdatedTime(workbookArray[3])
]
const onePublicWorkbook = {
  id: workbookArray[0].id,
  title: workbookArray[0].title,
  createdBy: { username: 'manager' },
  isVisible: workbookArray[0].isVisible
}
const visibleOnePublicWorkbook = showIdTitle(workbookArray[0])
const oneGroupWorkbook = workbookArray[2]
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

  it('get a list of public workbooks (user)', async () => {
    db.workbook.findMany.resolves(visiblePublicWorkbooks)

    const returnedPublicWorkbooks = await workbookService.getWorkbooksByGroupId(
      0,
      3,
      OPEN_SPACE_ID
    )
    expect(returnedPublicWorkbooks).to.deep.equal(visiblePublicWorkbooks)
  })

  it('get a list of public workbooks (admin)', async () => {
    db.workbook.findMany.resolves(publicWorkbooks)

    const returnedPublicWorkbooks =
      await workbookService.getAdminWorkbooksByGroupId(0, 3, OPEN_SPACE_ID)
    expect(returnedPublicWorkbooks).to.deep.equal(publicWorkbooks)
  })

  it('get a list of private group workbooks', async () => {
    db.workbook.findMany.resolves(groupWorkbooks)

    const returnedGroupWorkbooks = await workbookService.getWorkbooksByGroupId(
      0,
      3,
      PRIVATE_GROUP_ID
    )
    expect(returnedGroupWorkbooks).to.deep.equal(groupWorkbooks)
  })

  it('get details of a workbook (user)', async () => {
    let workbookId = 1
    db.workbook.findFirst.reset()
    db.workbook.findFirst
      .onFirstCall()
      .resolves(visibleOnePublicWorkbook)
      .onSecondCall()
      .rejects(new EntityNotExistException('workbook'))

    const returnedWorkbook = await workbookService.getWorkbookById(workbookId)
    expect(returnedWorkbook).to.deep.equal(visibleOnePublicWorkbook)

    workbookId = 9999999
    await expect(
      workbookService.getWorkbookById(workbookId)
    ).to.be.rejectedWith(EntityNotExistException)
  })

  it('get details of a workbook (admin)', async () => {
    let workbookId = 1
    db.workbook.findFirst.reset()
    db.workbook.findFirst
      .onFirstCall()
      .resolves(onePublicWorkbook)
      .onSecondCall()
      .rejects(new EntityNotExistException('workbook'))

    const returnedWorkbook = await workbookService.getAdminWorkbookById(
      workbookId
    )
    expect(returnedWorkbook).to.deep.equal(onePublicWorkbook)

    workbookId = 9999999
    await expect(
      workbookService.getWorkbookById(workbookId)
    ).to.be.rejectedWith(EntityNotExistException)
  })

  it('make a workbook', async () => {
    db.workbook.create.onFirstCall().resolves(oneGroupWorkbook)

    const createdWorkbook = await workbookService.createWorkbook(
      createWorkbookDto,
      CREATE_BY_ID,
      PRIVATE_GROUP_ID
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
