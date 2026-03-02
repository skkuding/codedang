import type { TestingModule } from '@nestjs/testing'
import { Test } from '@nestjs/testing'
import { TestFileController } from './test-file.controller'

describe('TestFileController', () => {
  let controller: TestFileController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TestFileController]
    }).compile()

    controller = module.get<TestFileController>(TestFileController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
