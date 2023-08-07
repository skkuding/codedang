import { Test, type TestingModule } from '@nestjs/testing'
import type { Workbook } from '@prisma/client'
import { expect } from 'chai'
import { stub } from 'sinon'
import { PrismaService } from '@libs/prisma'
import { WorkbookService } from './workbook.service'

const db = {
  workbook: {
    findMany: stub(),
    findFirstOrThrow: stub()
  },
  workbookProblem: {
    findManu: stub()
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

  // describe('getWorkbook', () => {
  //   it('should return workbook detail ', async () => {
  //     //given
  //     const exampleWorkbookDetail: Partial<Workbook> & {
  //       problems: Partial<Problem>[]
  //     } & {
  //       submissions: Partial<Submission>[]
  //     } = {
  //       id: 1,
  //       createdById: 1,
  //       createTime: new Date(),
  //       description: 'test',
  //       groupId: 1,
  //       isVisible: true,
  //       title: 'test',
  //       updateTime: new Date()
  //     }
  //     db.workbook.findMany.resolves([exampleWorkbookDetail])

  //     //when
  //     const result = await service.getWorkbook(1, 1)

  //     //then
  //     expect(result).to.deep.equals([exampleWorkbookDetail])
  //   })
  // })
})
