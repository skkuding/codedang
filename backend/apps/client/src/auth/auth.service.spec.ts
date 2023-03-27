import { CACHE_MANAGER } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { Test, type TestingModule } from '@nestjs/testing'
import { expect } from 'chai'
import type Sinon from 'sinon'
import { stub } from 'sinon'
import * as proxyquire from 'proxyquire'

import { type Cache } from 'cache-manager'
import { type User } from '@prisma/client'

import { UserService } from '~/user/user.service'
import { PrismaService } from '~/prisma/prisma.service'

import {
  InvalidJwtTokenException,
  InvalidUserException
} from '~/common/exception/business.exception'
import { EmailService } from '~/email/email.service'
import { MailerService } from '@nestjs-modules/mailer'
import { GroupService } from '~/group/group.service'

describe('AuthService', () => {
  let service
  let cache: Cache
  let createJwtTokensSpy: Sinon.SinonStub
  const ACCESS_TOKEN = 'access_token'
  const REFRESH_TOKEN = 'refresh_token'
  const VALID_PASSWORD = 'password'
  const user: User = {
    id: 1,
    username: 'user',
    password: VALID_PASSWORD,
    role: 'User',
    email: '',
    lastLogin: undefined,
    createTime: undefined,
    updateTime: undefined
  }
  const userMock = {
    getUserCredential: stub().resolves(user),
    updateLastLogin: stub().resolves()
  }

  beforeEach(async () => {
    const { AuthService } = proxyquire('./auth.service', {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      '../common/hash': {
        validate: async (passwordFromDB, passwordFromUserInput) =>
          passwordFromDB === passwordFromUserInput
      }
    })

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        EmailService,
        {
          provide: UserService,
          useValue: userMock
        },
        { provide: PrismaService, useValue: {} },
        { provide: ConfigService, useValue: {} },
        { provide: JwtService, useValue: {} },
        { provide: MailerService, useValue: {} },
        { provide: GroupService, useValue: {} },
        {
          provide: CACHE_MANAGER,
          useFactory: () => ({
            set: () => [],
            get: () => []
          })
        }
      ]
    }).compile()

    service = module.get(AuthService)
    cache = module.get<Cache>(CACHE_MANAGER)
    createJwtTokensSpy = stub(service, 'createJwtTokens').resolves({
      accessToken: ACCESS_TOKEN,
      refreshToken: REFRESH_TOKEN
    })
  })

  it('should be defined', () => {
    expect(service).to.be.ok
  })

  describe('issueJwtTokens', () => {
    const loginUserDto = { username: 'user', password: VALID_PASSWORD }

    it('should return new access token and refresh token when user validation succeed', async () => {
      //given
      const isValidUserSpy = stub(service, 'isValidUser').resolves(true)

      //when
      const result = await service.issueJwtTokens(loginUserDto)

      //then
      expect(userMock.getUserCredential.calledWith(loginUserDto.username)).to.be
        .true
      expect(isValidUserSpy.calledWith(user, loginUserDto.password)).to.be.true
      expect(userMock.updateLastLogin.calledWith(user.username)).to.be.true
      expect(createJwtTokensSpy.calledOnce).to.be.true
      expect(createJwtTokensSpy.calledWith(user.id, user.username)).to.be.true
      expect(result).to.deep.equal({
        accessToken: ACCESS_TOKEN,
        refreshToken: REFRESH_TOKEN
      })
    })

    it('should throw InvalidUserException when the user validation failed', async () => {
      //given
      const isValidUserSpy = stub(service, 'isValidUser').resolves(false)

      //when
      await expect(service.issueJwtTokens(loginUserDto)).to.be.rejectedWith(
        InvalidUserException
      )

      //then
      expect(userMock.getUserCredential.calledWith(loginUserDto.username)).to.be
        .true
      expect(isValidUserSpy.calledWith(user, loginUserDto.password)).to.be.true
    })
  })

  describe('isValidUser', () => {
    it("should return true when the given password match with the user's password", async () => {
      //when
      const result = await service.isValidUser(user, VALID_PASSWORD)

      //then
      expect(result).to.equal(true)
    })
    it('should return false when the user is given as null', async () => {
      //when
      const result = await service.isValidUser(null, VALID_PASSWORD)

      //then
      expect(result).to.equal(false)
    })
    it('should return false when the password validation failed', async () => {
      //when
      const result = await service.isValidUser(user, 'invalid_password')

      //then
      expect(result).to.equal(false)
    })
  })

  describe('updateJwtTokens', () => {
    const refreshToken = REFRESH_TOKEN
    const userId = 1
    const username = 'user'
    let verifyJwtTokenSpy: Sinon.SinonStub

    beforeEach(() => {
      verifyJwtTokenSpy = stub(service, 'verifyJwtToken').resolves({
        userId,
        username,
        iat: undefined,
        exp: undefined,
        iss: undefined
      })
    })

    it('should return new access token and refresh token when the given refresh token is valid', async () => {
      //given
      const isValidRefreshTokenSpy = stub(
        service,
        'isValidRefreshToken'
      ).resolves(true)

      //when
      const result = await service.updateJwtTokens(refreshToken)

      //then
      expect(verifyJwtTokenSpy.calledWith(refreshToken)).to.be.true
      expect(isValidRefreshTokenSpy.calledWith(refreshToken, userId)).to.be.true
      expect(createJwtTokensSpy.calledOnce).to.be.true
      expect(createJwtTokensSpy.calledWith(userId, username)).to.be.true
      expect(result).to.deep.equal({
        accessToken: ACCESS_TOKEN,
        refreshToken: REFRESH_TOKEN
      })
    })

    it('should throw InvalidJwtTokenException when the given refresh token is invalid', async () => {
      //given
      const invalidToken = REFRESH_TOKEN
      const isValidRefreshTokenSpy = stub(
        service,
        'isValidRefreshToken'
      ).resolves(false)

      //when
      await expect(service.updateJwtTokens(invalidToken)).to.be.rejectedWith(
        InvalidJwtTokenException
      )

      //then
      expect(verifyJwtTokenSpy.calledWith(invalidToken)).to.be.true
      expect(isValidRefreshTokenSpy.calledWith(invalidToken, userId)).to.be.true
    })
  })

  describe('isValidRefreshToken', () => {
    it("should return true when the given refresh token match with the user's cached refresh token", async () => {
      //given
      stub(cache, 'get').resolves(REFRESH_TOKEN)

      //when
      const result = await service.isValidRefreshToken(REFRESH_TOKEN, user.id)

      //then
      expect(result).to.equal(true)
    })
    it("should return false when the given refresh token does not match with the user's cached refresh token", async () => {
      //given
      stub(cache, 'get').resolves('invalid value')

      //when
      const result = await service.isValidRefreshToken(REFRESH_TOKEN, user.id)

      //then
      expect(result).to.equal(false)
    })
    it("should return false when the user's refresh token does not exist in the cache", async () => {
      //given
      stub(cache, 'get').resolves(null)

      //when
      const result = await service.isValidRefreshToken(REFRESH_TOKEN, user.id)

      //then
      expect(result).to.equal(false)
    })
  })
})
