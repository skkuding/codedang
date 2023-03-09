import { Test, type TestingModule } from '@nestjs/testing'
import { expect } from 'chai'
import { UserController } from './user.controller'
import { UserService } from './user.service'

describe('UserController', () => {
  let controller: UserController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [{ provide: UserService, useValue: {} }]
    }).compile()

    controller = module.get<UserController>(UserController)
  })

  it('should be defined', () => {
    expect(controller).to.be.ok
  })
})
