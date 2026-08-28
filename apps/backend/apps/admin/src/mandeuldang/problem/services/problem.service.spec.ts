import { Test, type TestingModule } from '@nestjs/testing'
import { expect } from 'chai'
import { MandeuldangProblemService } from './problem.service'

describe('MandeuldangProblemService', () => {
  let service: MandeuldangProblemService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MandeuldangProblemService]
    }).compile()

    service = module.get<MandeuldangProblemService>(MandeuldangProblemService)
  })

  it('should be defined', () => {
    expect(service).to.be.ok
  })
})
