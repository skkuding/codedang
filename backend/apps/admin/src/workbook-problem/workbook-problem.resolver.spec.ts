import { Test, type TestingModule } from '@nestjs/testing'
import { expect } from 'chai'
import { WorkbookProblemResolver } from './workbook-problem.resolver'
import { WorkbookProblemService } from './workbook-problem.service'

describe('WorkbookProblemResolver', () => {
  let resolver: WorkbookProblemResolver

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WorkbookProblemResolver, WorkbookProblemService]
    }).compile()

    resolver = module.get<WorkbookProblemResolver>(WorkbookProblemResolver)
  })

  it('should be defined', () => {
    expect(resolver).to.be.ok
  })
})
