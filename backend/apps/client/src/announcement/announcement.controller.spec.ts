import { Test, TestingModule } from '@nestjs/testing'
import { expect } from 'chai'
import { AnnouncementController } from './announcement.controller'
import { AnnouncementService } from './announcement.service'

describe('AnnouncementController', () => {
  let controller: AnnouncementController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnnouncementController],
      providers: [AnnouncementService]
    }).compile()

    controller = module.get<AnnouncementController>(AnnouncementController)
  })

  it('should be defined', () => {
    expect(controller).to.be.ok
  })
})
