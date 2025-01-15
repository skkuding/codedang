import { Test, type TestingModule } from '@nestjs/testing'
import { expect } from 'chai'
import { RolesService } from '@libs/auth'
import { AssignmentController } from './assignment.controller'
import { AssignmentService } from './assignment.service'

describe('AssignmentController', () => {
  let controller: AssignmentController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AssignmentController],
      providers: [
        { provide: AssignmentService, useValue: {} },
        { provide: RolesService, useValue: {} }
      ]
    }).compile()

    controller = module.get<AssignmentController>(AssignmentController)
  })

  it('should be defined', () => {
    expect(controller).to.be.ok
  })
})
