import { ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { PrismaService } from 'src/prisma/prisma.service'
import { ProblemController } from './problem.controller'
import { ProblemService } from './problem.service'

describe('ProblemController', () => {
  let controller: ProblemController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProblemController],
      providers: [ProblemService, PrismaService, ConfigService]
    }).compile()

    controller = module.get<ProblemController>(ProblemController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
