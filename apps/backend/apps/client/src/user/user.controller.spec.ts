import { Test, type TestingModule } from '@nestjs/testing'
import { expect } from 'chai'
import type { Request } from 'express'
import { getClientIp, UserController } from './user.controller'
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

describe('getClientIp', () => {
  const REAL_IP_HEADER = 'x-real-ip'
  const request = (realIp: unknown, ip?: string) =>
    ({
      headers: realIp === undefined ? {} : { [REAL_IP_HEADER]: realIp },
      ip
    }) as unknown as Request

  it('should use the X-Real-IP header set by the reverse proxy', () => {
    expect(getClientIp(request('203.0.113.10', '10.0.0.5'))).to.equal(
      '203.0.113.10'
    )
  })

  it('should fall back to req.ip when the header is missing', () => {
    expect(getClientIp(request(undefined, '127.0.0.1'))).to.equal('127.0.0.1')
  })

  it('should fall back to req.ip when the header is empty', () => {
    expect(getClientIp(request('', '127.0.0.1'))).to.equal('127.0.0.1')
  })

  it('should ignore a repeated header', () => {
    expect(getClientIp(request(['1.2.3.4', '5.6.7.8'], '127.0.0.1'))).to.equal(
      '127.0.0.1'
    )
  })
})
