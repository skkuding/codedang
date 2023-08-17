import { Test, TestingModule } from '@nestjs/testing'
import { expect } from 'chai'
import { ContestproblemService } from './contestproblem.service'

describe('ContestproblemService', () => {
  let service: ContestproblemService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ContestproblemService]
    }).compile()

    service = module.get<ContestproblemService>(ContestproblemService)
  })

  it('should be defined', () => {
    expect(service).to.be.ok
  })
})
