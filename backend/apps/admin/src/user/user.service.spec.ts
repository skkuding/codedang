import { Test, type TestingModule } from '@nestjs/testing'
import { expect } from 'chai'
import { AdminUserService } from './user.service'

describe('UserService', () => {
  let service: AdminUserService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AdminUserService]
    }).compile()

    service = module.get<AdminUserService>(AdminUserService)
  })

  it('should be defined', () => {
    expect(service).to.be.ok
  })
})
