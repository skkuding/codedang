import { Test, TestingModule } from '@nestjs/testing'
import { ContestService } from './contest.service'

describe('ContestService', () => {
  let service: ContestService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ContestService, { provide: 'prisma', useValue: {} }]
    }).compile()

    service = module.get<ContestService>(ContestService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
