import { Test, TestingModule } from '@nestjs/testing'
import { PrismaService } from 'src/prisma/prisma.service'
import { ProblemService } from './problem.service'

describe('ProblemService', () => {
  let service: ProblemService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProblemService, { provide: PrismaService, useValue: {} }]
    }).compile()

    service = module.get<ProblemService>(ProblemService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
