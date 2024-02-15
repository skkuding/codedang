import { Test, type TestingModule } from '@nestjs/testing'
import { expect } from 'chai'
import { RolesService } from '@libs/auth'
import { AnnouncementController } from './announcement.controller'
import { AnnouncementService } from './announcement.service'

describe('AnnouncementController', () => {
  let controller: AnnouncementController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnnouncementController],
      providers: [
        { provide: AnnouncementService, useValue: {} },
        { provide: RolesService, useValue: {} }
      ]
    }).compile()

    controller = module.get<AnnouncementController>(AnnouncementController)
  })

  it('should be defined', () => {
    expect(controller).to.be.ok
  })
})
