import { Test, type TestingModule } from '@nestjs/testing'
import { ProblemService } from './problem.service'
import { expect } from 'chai'

describe('ProblemService', () => {
  let service: ProblemService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProblemService]
    }).compile()

    service = module.get<ProblemService>(ProblemService)
  })

  it('should be defined', () => {
    expect(service).to.be.ok
  })
})
