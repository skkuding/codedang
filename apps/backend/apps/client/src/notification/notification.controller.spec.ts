import { Test, type TestingModule } from '@nestjs/testing'
import { expect } from 'chai'
import { NotificationController } from './notification.controller'
import { NotificationService } from './notification.service'

describe('NotificationController', () => {
  let controller: NotificationController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationController],
      providers: [{ provide: NotificationService, useValue: {} }]
    }).compile()

    controller = module.get<NotificationController>(NotificationController)
  })

  it('should be defined', () => {
    expect(controller).to.be.ok
  })
})
