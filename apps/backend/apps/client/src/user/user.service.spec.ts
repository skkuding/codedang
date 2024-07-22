import { MailerService } from '@nestjs-modules/mailer'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { Test, type TestingModule } from '@nestjs/testing'
import { faker } from '@faker-js/faker'
import { Prisma, type User, type UserProfile } from '@prisma/client'
import { expect } from 'chai'
import type { Request } from 'express'
import { Exception } from 'handlebars'
import { ExtractJwt } from 'passport-jwt'
import { stub, spy, fake, type SinonStub, type SinonSpy } from 'sinon'
import { type AuthenticatedRequest, JwtAuthService } from '@libs/auth'
import { emailAuthenticationPinCacheKey } from '@libs/cache'
import {
  ConflictFoundException,
  DuplicateFoundException,
  EntityNotExistException,
  InvalidJwtTokenException,
  UnidentifiedException,
  UnprocessableDataException
} from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import { EmailService } from '@client/email/email.service'
import { GroupService } from '@client/group/group.service'
import { UserService } from './user.service'

const ID = 1
const EMAIL_ADDRESS = 'email@email.com'
const PASSWORD_RESET_PIN = 'thisIsPasswordResetPin'
const PASSWORD_RESET_PIN_KEY = emailAuthenticationPinCacheKey(EMAIL_ADDRESS)
const emailAuthJwtPayload = {
  email: EMAIL_ADDRESS
}
const requestObject = {} as Request
const authRequestObject = {
  user: {
    id: ID
  }
} as AuthenticatedRequest

const user: User = {
  id: ID,
  username: 'user',
  password: 'thisIsPassword',
  role: 'User',
  email: EMAIL_ADDRESS,
  lastLogin: faker.date.past(),
  createTime: faker.date.past(),
  updateTime: faker.date.past(),
  studentID: null,
  major: null
}
const profile: UserProfile = {
  id: ID,
  userId: ID,
  realName: 'real name',
  createTime: faker.date.past(),
  updateTime: faker.date.past()
}
const userProfile = {
  username: user.username,
  role: user.role,
  email: user.email,
  lastLogin: user.lastLogin,
  updateTime: user.updateTime,
  userProfile: {
    realName: profile.realName
  }
}

const usernameDto = {
  username: 'user'
}

const mailerMock = {
  sendMail: stub()
}
const cacheMock = {
  get: stub().resolves(PASSWORD_RESET_PIN),
  set: stub(),
  del: stub()
}
const db = {
  user: {
    create: stub().resolves(user),
    findUnique: stub(),
    findUniqueOrThrow: stub(),
    update: stub().resolves(user),
    delete: stub()
  },
  userProfile: {
    create: stub(),
    findUnique: stub(),
    findUniqueOrThrow: stub(),
    update: stub().resolves({ ...profile, realName: 'new name' })
  },
  userGroup: {
    create: stub(),
    findMany: stub(),
    groupBy: stub()
  },
  group: {
    findMany: stub()
  }
}

describe('UserService', () => {
  let service: UserService
  let emailService: EmailService
  let jwtService: JwtService
  let jwtAuthService: JwtAuthService
  let groupService: GroupService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        EmailService,
        GroupService,
        JwtService,
        JwtAuthService,
        ConfigService,
        { provide: PrismaService, useValue: db },
        { provide: CACHE_MANAGER, useValue: cacheMock },
        { provide: MailerService, useValue: mailerMock }
      ]
    }).compile()

    service = module.get<UserService>(UserService)
    emailService = module.get<EmailService>(EmailService)
    jwtService = module.get<JwtService>(JwtService)
    jwtAuthService = module.get<JwtAuthService>(JwtAuthService)
    groupService = module.get<GroupService>(GroupService)
  })

  it('should be defined', () => {
    expect(service).to.be.ok
  })

  describe('getUsernameByEmail', () => {
    const { email, username } = user
    it('return username', async () => {
      db.user.findUnique.resolves({ username })

      expect(await service.getUsernameByEmail({ email })).to.be.deep.equal({
        username
      })
    })

    it('should not return username', async () => {
      db.user.findUnique.resolves(null)

      await expect(service.getUsernameByEmail({ email })).to.be.rejectedWith(
        EntityNotExistException
      )
    })
  })

  describe('sendPinForRegisterNewEmail', () => {
    let createPinAndSendEmailSpy: SinonStub
    beforeEach(() => {
      createPinAndSendEmailSpy = stub(service, 'createPinAndSendEmail')
    })

    it('create pin and send email', async () => {
      db.user.findUnique.resolves(null)

      await service.sendPinForRegisterNewEmail(emailAuthJwtPayload)
      expect(createPinAndSendEmailSpy.calledOnce).to.be.true
    })

    it('should not create pin and send email', async () => {
      db.user.findUnique.resolves(user)

      await expect(
        service.sendPinForRegisterNewEmail(emailAuthJwtPayload)
      ).to.be.rejectedWith(DuplicateFoundException)
      expect(createPinAndSendEmailSpy.called).to.be.false
    })
  })

  describe('sendPinForPasswordReset', () => {
    let createPinAndSendEmailSpy: SinonSpy
    beforeEach(() => {
      createPinAndSendEmailSpy = stub(service, 'createPinAndSendEmail')
    })

    it('create pin and send email', async () => {
      db.user.findUnique.resolves(user)

      await service.sendPinForPasswordReset(emailAuthJwtPayload)
      expect(createPinAndSendEmailSpy.calledOnce).to.be.true
    })

    it('should not create pin and send email', async () => {
      db.user.findUnique.resolves(null)

      await expect(
        service.sendPinForPasswordReset(emailAuthJwtPayload)
      ).to.be.rejectedWith(UnidentifiedException)
      expect(createPinAndSendEmailSpy.called).to.be.false
    })
  })

  describe('createPinAndSendEmail', () => {
    let createPinRandomlySpy: SinonSpy
    let sendEmailAuthenticationPinSpy: SinonStub
    beforeEach(() => {
      createPinRandomlySpy = spy(service, 'createPinRandomly')
      sendEmailAuthenticationPinSpy = stub(
        emailService,
        'sendEmailAuthenticationPin'
      )
    })

    it('create pin and send email', async () => {
      const ret = await service.createPinAndSendEmail(EMAIL_ADDRESS)
      expect(ret).equal(
        'Email authentication pin is sent to your email address'
      )
      expect(createPinRandomlySpy.called).to.be.true
      expect(sendEmailAuthenticationPinSpy.called).to.be.true
    })
  })

  describe('updatePassword', () => {
    let verifyJwtFromRequestHeaderSpy: SinonStub
    let updateUserPasswordInPrismaSpy: SinonSpy
    let deletePinFromCacheSpy: SinonStub
    beforeEach(() => {
      verifyJwtFromRequestHeaderSpy = stub(
        service,
        'verifyJwtFromRequestHeader'
      ).resolves({
        email: EMAIL_ADDRESS,
        iat: 0,
        exp: 0,
        iss: ''
      })
      deletePinFromCacheSpy = stub(service, 'deletePinFromCache')
      updateUserPasswordInPrismaSpy = spy(service, 'updateUserPasswordInPrisma')
    })

    it('update valid password', async () => {
      const ret = await service.updatePassword(
        { newPassword: 'thisIsNewPassword' },
        requestObject
      )
      expect(ret).to.equal('Password Reset successfully')
      expect(verifyJwtFromRequestHeaderSpy.calledOnce).to.be.true
      expect(updateUserPasswordInPrismaSpy.calledOnce).to.be.true
    })

    it('should not update invalid password', async () => {
      await expect(
        service.updatePassword(
          { newPassword: 'invalidpassword' },
          requestObject
        )
      ).to.be.rejectedWith(UnprocessableDataException)
      expect(verifyJwtFromRequestHeaderSpy.called).to.be.false
      expect(updateUserPasswordInPrismaSpy.called).to.be.false
    })

    it('should delete pin', async () => {
      await service.updatePassword(
        { newPassword: 'thisIsNewPassword' },
        requestObject
      )
      expect(deletePinFromCacheSpy.calledOnce).to.be.true
      expect(deletePinFromCacheSpy.firstCall.firstArg).to.be.equal(
        PASSWORD_RESET_PIN_KEY
      )
    })
  })

  describe('verifyJwtFromRequestHeader', () => {
    beforeEach(() => {
      ExtractJwt.fromHeader = fake.returns(() => {
        return ''
      })
    })

    it('parse email address from request header', async () => {
      jwtService.verifyAsync = stub().resolves(emailAuthJwtPayload)

      const ret = await service.verifyJwtFromRequestHeader(requestObject)
      expect(ret).to.deep.equal(emailAuthJwtPayload)
    })

    it('throw exception if token is invalid', async () => {
      jwtService.verifyAsync = stub().rejects(
        new Exception('verification failed')
      )

      await expect(
        service.verifyJwtFromRequestHeader(requestObject)
      ).to.be.rejectedWith(InvalidJwtTokenException)
    })
  })

  describe('updateUserPasswordInPrisma', () => {
    it('update user password', async () => {
      db.user.update.resolves(user)

      const ret = await service.updateUserPasswordInPrisma(
        EMAIL_ADDRESS,
        'thisIsNewPassword'
      )
      expect(ret).to.equal(user)
    })
  })

  describe('verifyPinAndIssueJwt', () => {
    beforeEach(() => {
      jwtService.signAsync = stub().resolves('token')
    })

    it('should pass verification with valid pin', async () => {
      const ret = await service.verifyPinAndIssueJwt({
        pin: PASSWORD_RESET_PIN,
        email: EMAIL_ADDRESS
      })
      expect(ret).to.equal('token')
    })

    it('should fail verification with invalid pin', async () => {
      service.getPinFromCache = stub()
        .onFirstCall()
        .resolves('')
        .onSecondCall()
        .resolves('invalid_token')

      await expect(
        service.verifyPinAndIssueJwt({
          pin: PASSWORD_RESET_PIN,
          email: EMAIL_ADDRESS
        })
      ).to.be.rejectedWith(UnidentifiedException)
      await expect(
        service.verifyPinAndIssueJwt({
          pin: PASSWORD_RESET_PIN,
          email: EMAIL_ADDRESS
        })
      ).to.be.rejectedWith(UnidentifiedException)
    })
  })

  describe('getPinFromCache', () => {
    it('get pin from cache', async () => {
      cacheMock.get.resetHistory()

      const ret = await service.getPinFromCache(PASSWORD_RESET_PIN_KEY)
      expect(ret).to.equal(PASSWORD_RESET_PIN)
      expect(cacheMock.get.calledOnce).to.be.true
    })
  })

  describe('deletePinFromCache', () => {
    beforeEach(() => {
      cacheMock.del.resetHistory()
    })

    it('delete pin from cache', async () => {
      await service.deletePinFromCache(PASSWORD_RESET_PIN_KEY)
      expect(cacheMock.del.calledOnce).to.be.true
      expect(cacheMock.del.firstCall.firstArg).to.equal(PASSWORD_RESET_PIN_KEY)
    })
  })

  describe('createJwt', () => {
    it('call create jwt using JwtService', async () => {
      const signAsyncSpy = stub(jwtService, 'signAsync')
      await service.createJwt(emailAuthJwtPayload)
      expect(signAsyncSpy.calledOnce).true
    })
  })

  describe('signUp', () => {
    const signUpDto = {
      username: user.username,
      password: user.password,
      email: user.email,
      realName: profile.realName,
      studentID: user.studentID,
      major: user.major
    }

    let createUserSpy: SinonSpy
    let createUserProfileSpy: SinonSpy
    let registerUserToPublicGroupSpy: SinonSpy
    let deletePinFromCacheSpy: SinonSpy
    beforeEach(() => {
      service.verifyJwtFromRequestHeader = fake.resolves({
        email: EMAIL_ADDRESS,
        iat: 0,
        exp: 0,
        iss: ''
      })
      createUserSpy = spy(service, 'createUser')
      createUserProfileSpy = spy(service, 'createUserProfile')
      registerUserToPublicGroupSpy = spy(service, 'registerUserToPublicGroup')
      deletePinFromCacheSpy = stub(service, 'deletePinFromCache')
    })

    it('carry sign up process', async () => {
      db.user.findUnique.resolves(null)

      const ret = await service.signUp(authRequestObject, signUpDto)
      expect(ret).to.deep.equal(user)
      expect(createUserSpy.calledOnce).to.be.true
      expect(createUserProfileSpy.calledOnce).to.be.true
      expect(registerUserToPublicGroupSpy.calledOnce).to.be.true
    })

    it('should delete pin', async () => {
      await service.signUp(authRequestObject, signUpDto)
      expect(deletePinFromCacheSpy.calledOnce).to.be.true
      expect(deletePinFromCacheSpy.firstCall.firstArg).to.be.equal(
        PASSWORD_RESET_PIN_KEY
      )
    })

    it('should not sign up non-authenticated user', async () => {
      service.verifyJwtFromRequestHeader = fake.rejects(
        new InvalidJwtTokenException('veryfication failed')
      )

      await expect(
        service.signUp(authRequestObject, signUpDto)
      ).to.be.rejectedWith(InvalidJwtTokenException)
      expect(createUserSpy.calledOnce).to.be.false
    })

    it('should not sign up with non-authenticated email', async () => {
      await expect(
        service.signUp(authRequestObject, {
          ...signUpDto,
          email: 'else@email.com',
          major: '',
          studentID: ''
        })
      ).to.be.rejectedWith(UnprocessableDataException)
      expect(createUserSpy.calledOnce).to.be.false
    })

    it('should not sign up with existing username', async () => {
      db.user.findUnique.resolves(user)

      await expect(
        service.signUp(authRequestObject, signUpDto)
      ).to.be.rejectedWith(DuplicateFoundException)
      expect(createUserSpy.calledOnce).to.be.false
    })

    it('should not sign up with bad username', async () => {
      db.user.findUnique.resolves(null)
      signUpDto.username = 'bad_username'

      await expect(
        service.signUp(authRequestObject, signUpDto)
      ).to.be.rejectedWith(UnprocessableDataException)
      expect(createUserSpy.calledOnce).to.be.false
    })

    it('should not sign up with bad password', async () => {
      db.user.findUnique.resolves(null)
      signUpDto.username = 'badpassword'

      await expect(
        service.signUp(authRequestObject, signUpDto)
      ).to.be.rejectedWith(UnprocessableDataException)
      expect(createUserSpy.calledOnce).to.be.false
    })
  })

  describe('registerUserToPublicGroup', () => {
    it('call group service to create user group', async () => {
      const createUserGroupSpy = spy(groupService, 'createUserGroup')
      await service.registerUserToPublicGroup(ID)
      expect(createUserGroupSpy.calledOnce).to.be.true
    })
  })

  describe('deleteUser', () => {
    let isValidUserSpy: SinonStub
    beforeEach(() => {
      db.user.delete.resetHistory()
    })

    it('should delete user', async () => {
      isValidUserSpy = stub(jwtAuthService, 'isValidUser').resolves(true)
      db.user.findUnique.resolves(user)
      db.userGroup.findMany.resolves([{ groupId: 2 }])
      // eslint-disable-next-line @typescript-eslint/naming-convention
      db.userGroup.groupBy.resolves([{ _count: { userId: 5 }, groupId: 2 }])

      await service.deleteUser(user.username, user.password)
      expect(isValidUserSpy.calledOnce).to.be.true
      expect(db.user.delete.calledOnce).to.be.true
    })

    it('should not delete non-validated user', async () => {
      isValidUserSpy = stub(jwtAuthService, 'isValidUser').resolves(false)

      await expect(
        service.deleteUser(user.username, 'differentPassword')
      ).to.be.rejectedWith(UnidentifiedException)
      expect(isValidUserSpy.calledOnce).to.be.true
      expect(db.user.delete.calledOnce).to.be.false
    })

    it('should not delete only group leader', async () => {
      isValidUserSpy = stub(jwtAuthService, 'isValidUser').resolves(true)
      db.user.findUnique.resolves(user)
      db.userGroup.findMany.resolves([{ groupId: 2 }])
      // eslint-disable-next-line @typescript-eslint/naming-convention
      db.userGroup.groupBy.resolves([{ _count: { userId: 1 }, groupId: 2 }])
      db.group.findMany.resolves([{ groupName: 'ants' }])

      await expect(
        service.deleteUser(user.username, user.password)
      ).to.be.rejectedWith(ConflictFoundException)
      expect(isValidUserSpy.calledOnce).to.be.true
      expect(db.user.delete.calledOnce).to.be.false
    })
  })

  describe('getUserProfile', () => {
    it('get user profile', async () => {
      db.user.findUnique.resolves(userProfile)
      const ret = await service.getUserProfile(user.username)
      expect(ret).to.equal(userProfile)
    })

    it('should not get user profile', async () => {
      db.user.findUnique.resolves(null)
      await expect(service.getUserProfile(user.username)).to.be.rejectedWith(
        EntityNotExistException
      )
    })
  })

  describe('updateUserEmail', () => {
    let deletePinFromCacheSpy: SinonSpy
    beforeEach(() => {
      service.verifyJwtFromRequestHeader = fake.resolves({
        email: 'new@email.com',
        iat: 0,
        exp: 0,
        iss: ''
      })
      deletePinFromCacheSpy = stub(service, 'deletePinFromCache')
    })

    it('update user email', async () => {
      db.user.findUnique.resolves(user)
      db.user.update.resolves({ ...user, email: 'new@email.com' })

      const ret = await service.updateUserEmail(authRequestObject, {
        email: 'new@email.com'
      })
      expect(ret).to.deep.equal({ ...user, email: 'new@email.com' })
    })

    it('should delete pin', async () => {
      await service.updateUserEmail(authRequestObject, {
        email: 'new@email.com'
      })
      expect(deletePinFromCacheSpy.calledOnce).to.be.true
      expect(deletePinFromCacheSpy.firstCall.firstArg).to.be.equal(
        emailAuthenticationPinCacheKey('new@email.com')
      )
    })

    it('should not update non authenticated user', async () => {
      service.verifyJwtFromRequestHeader = fake.rejects(
        new InvalidJwtTokenException('veryfication failed')
      )

      await expect(
        service.updateUserEmail(authRequestObject, { email: 'new@email.com' })
      ).to.be.rejectedWith(InvalidJwtTokenException)
    })

    it('should not update non-authenticated email', async () => {
      await expect(
        service.updateUserEmail(authRequestObject, { email: 'else@email.com' })
      ).to.be.rejectedWith(UnprocessableDataException)
    })

    it('should not update not existing user email', async () => {
      db.user.update.rejects(
        new Prisma.PrismaClientKnownRequestError('email', {
          code: 'P2025',
          clientVersion: '5.1.1'
        })
      )

      await expect(
        service.updateUserEmail(authRequestObject, { email: 'new@email.com' })
      ).to.be.rejectedWith(EntityNotExistException)
    })
  })

  describe('updateUserProfile', () => {
    it('update user profile', async () => {
      db.userProfile.findUnique.resolves(profile)
      const ret = await service.updateUserProfile(ID, {
        realName: 'new name'
      })
      expect(ret).to.deep.equal({ ...profile, realName: 'new name' })
    })

    it('should not update user profile', async () => {
      db.userProfile.update.rejects(
        new Prisma.PrismaClientKnownRequestError('email', {
          code: 'P2025',
          clientVersion: '5.1.1'
        })
      )
      await expect(
        service.updateUserProfile(ID, { realName: 'new name' })
      ).to.be.rejectedWith(EntityNotExistException)
    })
  })

  describe('checkDuplicatedUsername', () => {
    it('username not duplicated', async () => {
      db.user.findUnique.resolves(null)

      await expect(
        service.checkDuplicatedUsername(usernameDto)
      ).to.not.be.rejectedWith(DuplicateFoundException)
    })

    it('should throw error when username duplicated', async () => {
      db.user.findUnique.resolves(user)

      await expect(
        service.checkDuplicatedUsername(usernameDto)
      ).to.be.rejectedWith(DuplicateFoundException)
    })
  })
})
