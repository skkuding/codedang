import { Test, type TestingModule } from '@nestjs/testing'
import { expect } from 'chai'
import { AdminController } from './admin.controller'
import { AdminService } from './admin.service'

describe('AdminController', () => {
  let adminController: AdminController

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [AdminService]
    }).compile()

    adminController = app.get<AdminController>(AdminController)
  })

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(adminController.getHello()).to.equal('Hello World!')
    })
  })
})
