import { MailerService } from '@nestjs-modules/mailer'
import { HttpService } from '@nestjs/axios'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { ConflictException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { Test, type TestingModule } from '@nestjs/testing'
import { faker } from '@faker-js/faker'
import type { User } from '@prisma/client'
import type { Cache } from 'cache-manager'
import { expect } from 'chai'
import type Sinon from 'sinon'
import { stub } from 'sinon'
import { JwtAuthService } from '@libs/auth'
import { refreshTokenCacheKey } from '@libs/cache'
import {
  EntityNotExistException,
  InvalidJwtTokenException,
  UnidentifiedException
} from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import { EmailService } from '@client/email/email.service'
import { UserService } from '@client/user/user.service'
import { AuthService } from './auth.service'

describe('AuthService', () => {
  let service
  let jwtAuthService: JwtAuthService
  let cache: Cache
  let evalStub: Sinon.SinonStub
  let createJwtTokensSpy: Sinon.SinonStub
  const ACCESS_TOKEN = 'access_token'
  const REFRESH_TOKEN = 'refresh_token'
  const NEW_REFRESH_TOKEN = 'new_refresh_token'
  const VALID_PASSWORD = 'password'
  const user: User = {
    id: 1,
    username: 'user',
    password: VALID_PASSWORD,
    role: 'User',
    email: '',
    lastLogin: faker.date.past(),
    createTime: faker.date.past(),
    updateTime: faker.date.past(),
    studentId: '2020000000',
    college: null,
    major: null,
    canCreateCourse: false,
    canCreateContest: false
  }
  const userMock = {
    getUserCredential: stub().resolves(user),
    updateLastLogin: stub().resolves()
  }

  beforeEach(async () => {
    evalStub = stub()
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        EmailService,
        JwtAuthService,
        {
          provide: UserService,
          useValue: userMock
        },
        { provide: PrismaService, useValue: {} },
        { provide: ConfigService, useValue: {} },
        { provide: JwtService, useValue: { signAsync: async () => '' } },
        { provide: HttpService, useValue: { axiosRef: stub() } },
        { provide: MailerService, useValue: {} },
        {
          provide: CACHE_MANAGER,
          useFactory: () => ({
            set: () => [],
            del: () => [],
            stores: [{ store: { getClient: async () => ({ eval: evalStub }) } }]
          })
        }
      ]
    }).compile()

    service = module.get(AuthService)
    jwtAuthService = module.get<JwtAuthService>(JwtAuthService)
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
      const isValidUserSpy = stub(jwtAuthService, 'isValidUser').resolves(true)

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
      const isValidUserSpy = stub(jwtAuthService, 'isValidUser').resolves(false)

      //when
      await expect(service.issueJwtTokens(loginUserDto)).to.be.rejectedWith(
        UnidentifiedException
      )

      //then
      expect(userMock.getUserCredential.calledWith(loginUserDto.username)).to.be
        .true
      expect(isValidUserSpy.calledWith(user, loginUserDto.password)).to.be.true
    })

    it('should verify dummy hash and throw UnidentifiedException when the user does not exist', async () => {
      userMock.getUserCredential.rejects(new EntityNotExistException('User'))
      const verifyAgainstDummySpy = stub(
        jwtAuthService,
        'verifyAgainstDummy'
      ).resolves()

      await expect(service.issueJwtTokens(loginUserDto)).to.be.rejectedWith(
        UnidentifiedException
      )
      userMock.getUserCredential.resolves(user)

      expect(verifyAgainstDummySpy.calledOnceWith(loginUserDto.password)).to.be
        .true
    })
  })

  describe('updateJwtTokens', () => {
    const refreshToken = REFRESH_TOKEN
    const userId = 1
    const username = 'user'
    let verifyJwtTokenSpy: Sinon.SinonStub

    beforeEach(() => {
      createJwtTokensSpy.resolves({
        accessToken: ACCESS_TOKEN,
        refreshToken: NEW_REFRESH_TOKEN
      })
      verifyJwtTokenSpy = stub(service, 'verifyJwtToken').resolves({
        userId,
        username,
        userRole: 'User',
        tokenType: 'refresh',
        iat: undefined,
        exp: undefined,
        iss: undefined
      })
    })

    it('should return new access token and refresh token when the given refresh token is valid', async () => {
      //given
      evalStub.resolves(1)

      //when
      const result = await service.updateJwtTokens(refreshToken)

      //then
      expect(verifyJwtTokenSpy.calledWith(refreshToken)).to.be.true
      expect(evalStub.calledOnce).to.be.true
      expect(evalStub.firstCall.args[1].keys).to.deep.equal([
        refreshTokenCacheKey(userId, refreshToken),
        `${refreshTokenCacheKey(userId, refreshToken)}:consumed`
      ])
      expect(createJwtTokensSpy.calledOnce).to.be.true
      expect(createJwtTokensSpy.calledWithExactly(userId, username, 'User')).to
        .be.true
      expect(createJwtTokensSpy.calledBefore(evalStub)).to.be.true
      expect(result).to.deep.equal({
        accessToken: ACCESS_TOKEN,
        refreshToken: NEW_REFRESH_TOKEN
      })
    })

    it('should throw InvalidJwtTokenException when the given refresh token is invalid', async () => {
      //given
      const invalidToken = REFRESH_TOKEN
      evalStub.resolves(0)
      const deleteRefreshTokenSpy = stub(
        service,
        'deleteRefreshToken'
      ).resolves()

      //when
      await expect(service.updateJwtTokens(invalidToken)).to.be.rejectedWith(
        InvalidJwtTokenException
      )

      //then
      expect(verifyJwtTokenSpy.calledWith(invalidToken)).to.be.true
      expect(evalStub.calledOnce).to.be.true
      expect(createJwtTokensSpy.calledOnce).to.be.true
      expect(deleteRefreshTokenSpy.calledOnceWith(userId, NEW_REFRESH_TOKEN)).to
        .be.true
    })

    it('preserves the invalid-token error when replacement cleanup fails', async () => {
      evalStub.resolves(0)
      const deleteRefreshTokenSpy = stub(service, 'deleteRefreshToken').rejects(
        new Error('Redis delete failed')
      )

      await expect(service.updateJwtTokens(refreshToken)).to.be.rejectedWith(
        InvalidJwtTokenException
      )

      expect(deleteRefreshTokenSpy.calledOnceWith(userId, NEW_REFRESH_TOKEN)).to
        .be.true
    })

    it('reports a recently consumed token as a conflict', async () => {
      evalStub.resolves(2)
      const deleteRefreshTokenSpy = stub(
        service,
        'deleteRefreshToken'
      ).resolves()

      await expect(service.updateJwtTokens(refreshToken)).to.be.rejectedWith(
        ConflictException
      )

      expect(deleteRefreshTokenSpy.calledOnceWith(userId, NEW_REFRESH_TOKEN)).to
        .be.true
    })

    it('keeps the original refresh token when replacement creation fails', async () => {
      createJwtTokensSpy.rejects(new Error('cache write failed'))

      await expect(service.updateJwtTokens(refreshToken)).to.be.rejectedWith(
        'cache write failed'
      )

      expect(evalStub.called).to.be.false
    })

    it('removes the unused replacement when token consumption fails', async () => {
      evalStub.rejects(new Error('Redis read failed'))
      const deleteRefreshTokenSpy = stub(
        service,
        'deleteRefreshToken'
      ).resolves()

      await expect(service.updateJwtTokens(refreshToken)).to.be.rejectedWith(
        'Redis read failed'
      )

      expect(deleteRefreshTokenSpy.calledOnceWith(userId, NEW_REFRESH_TOKEN)).to
        .be.true
    })

    it('should reject an access token on the reissue endpoint', async () => {
      verifyJwtTokenSpy.resolves({
        userId,
        username,
        userRole: 'User',
        tokenType: 'access'
      })
      await expect(service.updateJwtTokens(ACCESS_TOKEN)).to.be.rejectedWith(
        InvalidJwtTokenException
      )

      expect(evalStub.called).to.be.false
      expect(createJwtTokensSpy.called).to.be.false
    })
  })

  describe('consumeRefreshToken', () => {
    it('distinguishes consumed, recently consumed, and missing tokens', async () => {
      evalStub.onFirstCall().resolves(1)
      evalStub.onSecondCall().resolves(2)
      evalStub.onThirdCall().resolves(0)

      expect(
        await service.consumeRefreshToken(REFRESH_TOKEN, user.id)
      ).to.equal('consumed')
      expect(
        await service.consumeRefreshToken(REFRESH_TOKEN, user.id)
      ).to.equal('recently-consumed')
      expect(
        await service.consumeRefreshToken(REFRESH_TOKEN, user.id)
      ).to.equal('missing')
    })
  })

  describe('createJwtTokens', () => {
    it('signs access and refresh tokens with distinct token types', async () => {
      createJwtTokensSpy.restore()
      const jwtService = service['jwtService'] as JwtService
      const signAsyncSpy = stub(jwtService, 'signAsync')
      signAsyncSpy.onFirstCall().resolves(ACCESS_TOKEN)
      signAsyncSpy.onSecondCall().resolves(REFRESH_TOKEN)
      signAsyncSpy.onThirdCall().resolves(ACCESS_TOKEN)
      signAsyncSpy.onCall(3).resolves(NEW_REFRESH_TOKEN)
      const setSpy = stub(cache, 'set').resolves(1)

      await service.createJwtTokens(user.id, user.username, user.role)
      await service.createJwtTokens(user.id, user.username, user.role)

      expect(signAsyncSpy.firstCall.args[0]).to.include({
        userId: user.id,
        tokenType: 'access'
      })
      expect(signAsyncSpy.secondCall.args[0]).to.include({
        userId: user.id,
        tokenType: 'refresh'
      })
      const firstJwtId = signAsyncSpy.secondCall.args[1]?.jwtid
      const secondJwtId = signAsyncSpy.getCall(3).args[1]?.jwtid
      expect(firstJwtId).to.be.a('string')
      expect(secondJwtId).to.be.a('string')
      expect(secondJwtId).not.to.equal(firstJwtId)
      expect(setSpy.calledTwice).to.be.true
    })
  })
})
