import { MailerService } from '@nestjs-modules/mailer'
import { CACHE_MANAGER } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { expect } from 'chai'
import Sinon, { stub, spy, fake } from 'sinon'
import { User } from '@prisma/client'
import { Cache } from 'cache-manager'
import { passwordResetPinCacheKey } from 'src/common/cache/keys'
import { InvalidPinException } from 'src/common/exception/business.exception'
import { EmailService } from 'src/email/email.service'
import { PrismaService } from 'src/prisma/prisma.service'
import { UserService } from './user.service'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { Request } from 'express'

describe('UserService', () => {
  let userService: UserService
  let cache: Cache
  let emailService: EmailService
  let mailer: MailerService

  const USER_ID = 1
  const EMAIL_ADDRESS = 'email@email.com'
  const PASSWORD_RESET_PIN_KEY = passwordResetPinCacheKey(EMAIL_ADDRESS)
  const PASSWORD_RESET_PIN = 'thisIsPasswordResetPin'
  const TIME_TO_LIVE = 300
  const NEW_PASSWORD = 'thisISNewPassword'

  const mailerMock = {
    sendMail: stub()
  }
  const cacheMock = {
    get: fake.resolves(PASSWORD_RESET_PIN),
    set: () => [],
    del: () => []
  }
  const user: User = {
    id: USER_ID,
    username: 'user',
    password: 'password',
    role: 'User',
    email: EMAIL_ADDRESS,
    hasEmailAuthenticated: false,
    lastLogin: undefined,
    createTime: undefined,
    updateTime: undefined
  }
  const expectedEmailInfo = {
    accepted: [EMAIL_ADDRESS],
    rejected: [],
    envelopeTime: 715,
    messageTime: 590,
    messageSize: 473,
    response:
      '250 2.0.0 OK  1658043820 q93-56600b001f061359022sm8791552pjk.54 - gsmtp',
    envelope: { from: 'sender_email', to: [EMAIL_ADDRESS] },
    messageId: '6bd7-3d62-c84b-61865f06534b@gmail.com'
  }

  const passwordResetJwtPayload = {
    userId: USER_ID
  }

  const RequestObject = {} as Request

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        EmailService,
        JwtService,
        ConfigService,
        { provide: PrismaService, useValue: {} },
        { provide: CACHE_MANAGER, useValue: cacheMock },
        { provide: MailerService, useValue: mailerMock }
      ]
    }).compile()

    userService = module.get<UserService>(UserService)
    emailService = module.get<EmailService>(EmailService)
    mailer = module.get<MailerService>(MailerService)
    cache = module.get(CACHE_MANAGER)
  })

  it('should be defined', () => {
    expect(userService).to.be.ok
  })

  it('get pin', async () => {
    const ret = await userService.getPinFromCache(PASSWORD_RESET_PIN_KEY)

    expect(ret).to.equal(PASSWORD_RESET_PIN)
  })

  it('set pin', async () => {
    const cacheSpy = spy(cache, 'set')

    await userService.createPinInCache(
      PASSWORD_RESET_PIN_KEY,
      PASSWORD_RESET_PIN,
      TIME_TO_LIVE
    )

    expect(cacheSpy.calledOnce).to.be.true
    expect(cacheSpy.firstCall.args).to.deep.equal([
      PASSWORD_RESET_PIN_KEY,
      PASSWORD_RESET_PIN,
      { ttl: TIME_TO_LIVE }
    ])
  })

  it('delete pin', async () => {
    const cacheSpy = spy(cache, 'del')

    await userService.deletePinFromCache(PASSWORD_RESET_PIN_KEY)

    expect(cacheSpy.calledOnce).to.be.true
    expect(cacheSpy.firstCall.firstArg).to.equal(PASSWORD_RESET_PIN_KEY)
  })

  describe('create a password reset pin and send it to given email', () => {
    let sendPasswordResetPinSpy: Sinon.SinonStub

    beforeEach(() => {
      userService.getUserCredentialByEmail = fake.resolves(user)

      mailer.sendMail = fake.resolves(expectedEmailInfo)

      sendPasswordResetPinSpy = stub(
        emailService,
        'sendPasswordResetPin'
      ).resolves(expectedEmailInfo)
    })

    it('if user email exist, create token and send email', async () => {
      const tokenGeneratorSpy = spy(userService, 'createPinRandomly')
      await userService.createPinAndSendEmail({ email: EMAIL_ADDRESS })
      expect(sendPasswordResetPinSpy.calledOnce).to.be.true
      expect(sendPasswordResetPinSpy.firstCall.firstArg).to.equal(EMAIL_ADDRESS)
      expect(tokenGeneratorSpy.calledOnce).to.be.true
    })
  })

  describe('update user password if given pin is valid', () => {
    beforeEach(() => {
      userService.getPinFromCache = fake.resolves(PASSWORD_RESET_PIN)
      userService.getUserCredentialByEmail = fake.resolves(user)
      userService.verifyJwtFromRequestHeader = fake.resolves({
        ...passwordResetJwtPayload,
        iat: 0,
        exp: 0,
        iss: ''
      })
      userService.createJwt = fake.resolves('jwt')
    })

    it('pin is invalid', async () => {
      userService.getPinFromCache = stub()
        .onFirstCall()
        .resolves('reset_token_invalid')
        .onSecondCall()
        .resolves(null)

      await expect(
        userService.verifyPinAndIssueJwtForPasswordReset({
          pin: PASSWORD_RESET_PIN,
          email: EMAIL_ADDRESS
        })
      ).to.be.rejectedWith(InvalidPinException)

      await expect(
        userService.verifyPinAndIssueJwtForPasswordReset({
          pin: PASSWORD_RESET_PIN,
          email: EMAIL_ADDRESS
        })
      ).to.be.rejectedWith(InvalidPinException)
    })

    it('pin is valid', async () => {
      const jwt = await userService.verifyPinAndIssueJwtForPasswordReset({
        pin: PASSWORD_RESET_PIN,
        email: EMAIL_ADDRESS
      })
      expect(jwt).to.equal('jwt')
    })

    it('check if deletePin function is called', async () => {
      userService.verifyPin = stub().onFirstCall().resolves(true)
      const deleteTokenSpy = spy(userService, 'deletePinFromCache')
      await userService.verifyPinAndIssueJwtForPasswordReset({
        pin: PASSWORD_RESET_PIN,
        email: EMAIL_ADDRESS
      })
      expect(deleteTokenSpy.calledOnce).to.be.true
      expect(deleteTokenSpy.firstCall.firstArg).to.equal(
        passwordResetPinCacheKey(EMAIL_ADDRESS)
      )
    })

    it('check if updatePasswordInPrisma function is called', async () => {
      const updatePasswordInPrismaSpy = stub(
        userService,
        'updateUserPasswordInPrisma'
      )
      await userService.updatePassword(
        {
          newPassword: NEW_PASSWORD
        },
        RequestObject
      )
      expect(updatePasswordInPrismaSpy.calledOnce).to.be.true
      expect(updatePasswordInPrismaSpy.firstCall.args).to.deep.equal([
        USER_ID,
        NEW_PASSWORD
      ])
    })
  })
})
