import { Test, type TestingModule } from '@nestjs/testing'
import { ClarificationController } from './clarification.controller'
import { expect } from 'chai'
import { ClarificationService } from './clarification.service'

describe('ClarificationController', () => {
  let controller: ClarificationController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClarificationController],
      providers: [{ provide: ClarificationService, useValue: {} }]
    }).compile()

    controller = module.get<ClarificationController>(ClarificationController)
  })

  it('should be defined', () => {
    expect(controller).to.be.ok
  })
})
