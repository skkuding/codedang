import { Test, type TestingModule } from '@nestjs/testing'
import { expect } from 'chai'
import { WorkbookproblemResolver } from './workbookproblem.resolver'
import { WorkbookproblemService } from './workbookproblem.service'

describe('WorkbookproblemResolver', () => {
  let resolver: WorkbookproblemResolver

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WorkbookproblemResolver, WorkbookproblemService]
    }).compile()

    resolver = module.get<WorkbookproblemResolver>(WorkbookproblemResolver)
  })

  it('should be defined', () => {
    expect(resolver).to.be.ok
  })
})
