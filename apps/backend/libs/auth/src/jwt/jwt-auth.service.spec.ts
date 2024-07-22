import { Test } from '@nestjs/testing'
import { faker } from '@faker-js/faker'
import type { User } from '@prisma/client'
import { expect } from 'chai'
import * as proxyquire from 'proxyquire'

const user: User = {
  id: 1,
  username: 'user',
  password: 'thisIsPassword',
  role: 'User',
  email: 'email@codedang.com',
  lastLogin: faker.date.past(),
  createTime: faker.date.past(),
  updateTime: faker.date.past(),
  studentID: null,
  major: null
}

describe('JwtAuthService', () => {
  let service

  beforeEach(async () => {
    const { JwtAuthService } = proxyquire('./jwt-auth.service', {
      argon2: {
        verify: async (passwordFromDB, passwordFromUserInput) =>
          passwordFromDB === passwordFromUserInput
      }
    })

    const module = await Test.createTestingModule({
      providers: [JwtAuthService]
    }).compile()

    service = module.get(JwtAuthService)
  })

  it('should be defined', () => {
    expect(service).to.be.not.undefined
  })

  describe('isValidUser', () => {
    it("should return true when the given password match with the user's password", async () => {
      const result = await service.isValidUser(user, user.password)
      expect(result).to.equal(true)
    })
    it('should return false when the user is given as null', async () => {
      const result = await service.isValidUser(null, user.password)
      expect(result).to.equal(false)
    })
    it('should return false when the password validation failed', async () => {
      const result = await service.isValidUser(user, 'invalid_password')
      expect(result).to.equal(false)
    })
  })
})
