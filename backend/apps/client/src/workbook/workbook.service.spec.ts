import { Test, type TestingModule } from '@nestjs/testing'
import { Prisma, type Workbook } from '@prisma/client'
import { expect } from 'chai'
import { stub } from 'sinon'
import { OPEN_SPACE_ID } from '@libs/constants'
import { EntityNotExistException } from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import { WorkbookService } from './workbook.service'

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

const problems = [
  {
    problem: {
      id: 1,
      title: 'Workbook Problem Example',
      problemTag: [{ tag: { name: 'tag1' } }, { tag: { name: 'tag2' } }]
    }
  },
  {
    problem: {
      id: 2,
      title: 'Just Another Example',
      problemTag: [{ tag: { name: 'tag1' } }, { tag: { name: 'tag2' } }]
    }
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
const visibleOnePublicWorkbook = {
  id: workbookArray[0].id,
  title: workbookArray[0].title,
  problems: problems.map((x) => ({
    id: x.problem.id,
    title: x.problem.title,
    tags: x.problem.problemTag.map((y) => y.tag.name)
  }))
}
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
  },
  workbookProblem: {
    findMany: stub()
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

    db.workbookProblem.findMany.reset()
    db.workbookProblem.findMany
      .onFirstCall()
      .resolves(problems)
      .onSecondCall()
      .resolves([])

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
        new Prisma.PrismaClientKnownRequestError('message', {
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
        new Prisma.PrismaClientKnownRequestError('message', {
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
