import { Test, type TestingModule } from '@nestjs/testing'
import type { Workbook } from '@prisma/client'
import { expect } from 'chai'
import { stub } from 'sinon'
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

const visiblePublicWorkbooks = [
  showIdTitleDescriptionUpdatedTime(workbookArray[0])
]
const groupWorkbooks = [
  showIdTitleDescriptionUpdatedTime(workbookArray[2]),
  showIdTitleDescriptionUpdatedTime(workbookArray[3])
]
const visibleOnePublicWorkbook = {
  id: workbookArray[0].id,
  title: workbookArray[0].title,
  problems: problems.map((x) => ({
    id: x.problem.id,
    title: x.problem.title,
    tags: x.problem.problemTag.map((y) => y.tag.name)
  }))
}
const PRIVATE_GROUP_ID = 2

const db = {
  workbook: {
    findMany: stub(),
    findUnique: stub(),
    findUniqueOrThrow: stub(),
    findFirst: stub(),
    create: stub(),
    update: stub(),
    delete: stub(),
    count: stub().resolves(3)
  },
  workbookProblem: {
    findMany: stub()
  },
  getPaginator: PrismaService.prototype.getPaginator
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
      3
    )
    expect(returnedPublicWorkbooks).to.deep.equal({
      data: visiblePublicWorkbooks,
      total: 3
    })
  })

  it('get a list of private group workbooks', async () => {
    db.workbook.findMany.resolves(groupWorkbooks)

    const returnedGroupWorkbooks = await workbookService.getWorkbooksByGroupId(
      0,
      3,
      PRIVATE_GROUP_ID
    )
    expect(returnedGroupWorkbooks).to.deep.equal({
      data: groupWorkbooks,
      total: 3
    })
  })

  it('get details of a workbook (user)', async () => {
    let workbookId = 1
    db.workbook.findUnique.reset()
    db.workbook.findUnique
      .onFirstCall()
      .resolves(visibleOnePublicWorkbook)
      .onSecondCall()
      .resolves(null)

    db.workbookProblem.findMany.reset()
    db.workbookProblem.findMany
      .onFirstCall()
      .resolves(problems)
      .onSecondCall()
      .resolves([])

    const returnedWorkbook = await workbookService.getWorkbook(workbookId)
    expect(returnedWorkbook).to.deep.equal(visibleOnePublicWorkbook)

    workbookId = 9999999
    await expect(workbookService.getWorkbook(workbookId)).to.be.rejectedWith(
      EntityNotExistException
    )
  })
})
