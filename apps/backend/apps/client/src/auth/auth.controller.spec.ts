import { ConfigService } from '@nestjs/config'
import { Test, type TestingModule } from '@nestjs/testing'
import { expect } from 'chai'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'

describe('AuthController', () => {
  let controller: AuthController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: {} },
        { provide: ConfigService, useValue: {} }
      ]
    }).compile()
    controller = module.get<AuthController>(AuthController)
  })

  it('should be defined', () => {
    expect(controller).to.be.ok
  })
})
