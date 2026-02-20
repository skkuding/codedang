import { Test, type TestingModule } from '@nestjs/testing'
import { expect } from 'chai'
import { RolesService } from '@libs/auth'
import { StudyController } from './study.controller'
import { StudyService } from './study.service'

describe('StudyController', () => {
  let controller: StudyController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StudyController],
      providers: [
        { provide: StudyService, useValue: {} },
        { provide: RolesService, useValue: {} }
      ]
    }).compile()

    controller = module.get<StudyController>(StudyController)
  })

  it('should be defined', () => {
    expect(controller).to.be.ok
  })
})
