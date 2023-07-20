import { Test, TestingModule } from '@nestjs/testing'
import { Workbook } from '@prisma/client'
import { expect } from 'chai'
import { stub } from 'sinon'
import { PrismaService } from '@libs/prisma'
import { WorkbookService } from './workbook.service'

const db = {
  workbook: {
    findMany: stub()
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

  describe('getWorkbookListByGroupId', () => {
    it('should return workbook list', async () => {
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
      const result = await service.getWorkbookListByGroupId({
        groupId: 1,
        cursor: 1,
        take: 1
      })

      //then
      expect(result).to.deep.equals([exampleWorkbook])
    })
  })
})
