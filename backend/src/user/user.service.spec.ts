import { MailerService } from '@nestjs-modules/mailer'
import { CACHE_MANAGER } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { User } from '@prisma/client'
import { Cache } from 'cache-manager'
import { passwordResetPinCacheKey } from 'src/common/cache/keys'
import {
  InvalidPinException,
  InvalidUserException
} from 'src/common/exception/business.exception'
import { EmailService } from 'src/email/email.service'
import { PrismaService } from 'src/prisma/prisma.service'
import { UserService } from './user.service'
import { Request } from 'express'
import { JwtService } from '@nestjs/jwt'

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
    sendMail: jest.fn()
  }
  const cacheMock = {
    get: jest.fn().mockReturnValueOnce(PASSWORD_RESET_PIN),
    set: jest.fn(),
    del: jest.fn()
  }
  const user: User = {
    id: USER_ID,
    username: 'user',
    password: 'password',
    role: 'User',
    email: EMAIL_ADDRESS,
    has_email_authenticated: false,
    last_login: undefined,
    create_time: undefined,
    update_time: undefined
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
  class RequestIncludingUser {
    user: { id: number; email: string }
    constructor(user) {
      this.user = user
    }
  }
  const requestIncludingUser = new RequestIncludingUser({
    id: USER_ID,
    email: EMAIL_ADDRESS
  })

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        EmailService,
        JwtService,
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
    expect(userService).toBeDefined()
  })

  it('get token', async () => {
    const ret = await userService.getPinFromCache(PASSWORD_RESET_PIN_KEY)

    expect(ret).toEqual(PASSWORD_RESET_PIN)
  })

  it('set token', async () => {
    const spy = jest.spyOn(cache, 'set')

    await userService.createPinInCache(
      PASSWORD_RESET_PIN_KEY,
      PASSWORD_RESET_PIN,
      TIME_TO_LIVE
    )

    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy.mock.calls[0][0]).toBe(PASSWORD_RESET_PIN_KEY)
    expect(spy.mock.calls[0][1]).toBe(PASSWORD_RESET_PIN)
    expect(spy.mock.calls[0][2]).toEqual({ ttl: TIME_TO_LIVE })
  })

  it('delete token', async () => {
    const spy = jest.spyOn(cache, 'del')

    await userService.deletePinFromCache(PASSWORD_RESET_PIN_KEY)

    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy.mock.calls[0][0]).toBe(PASSWORD_RESET_PIN_KEY)
  })

  describe('create a password reset token and send it to given email', () => {
    let sendPasswordResetPinSpy

    beforeEach(() => {
      userService.getUserCredentialByEmail = jest.fn().mockResolvedValue(user)

      mailer.sendMail = jest.fn().mockResolvedValue(expectedEmailInfo)

      sendPasswordResetPinSpy = jest
        .spyOn(emailService, 'sendPasswordResetPin')
        .mockResolvedValueOnce(expectedEmailInfo)
    })

    it('check if user email exist (Non-Exist)', async () => {
      userService.getUserCredentialByEmail = jest
        .fn()
        .mockReturnValueOnce(Promise.resolve(null))
      expect(async () => {
        await userService.createPinAndSendEmail({ email: EMAIL_ADDRESS })
      }).rejects.toThrowError(InvalidUserException)
    })

    it('if user email exist, create token and send email', async () => {
      const tokenGeneratorSpy = jest.spyOn(userService, 'createPinRandomly')
      await userService.createPinAndSendEmail({ email: EMAIL_ADDRESS })
      expect(sendPasswordResetPinSpy).toBeCalledTimes(1)
      expect(sendPasswordResetPinSpy.mock.calls[0][0]).toBe(EMAIL_ADDRESS)
      expect(tokenGeneratorSpy).toHaveBeenCalledTimes(1)
    })
  })

  describe('update user password if given token is valid', () => {
    beforeEach(() => {
      userService.updateUserPasswordInPrisma = jest.fn()
      userService.getPinFromCache = jest
        .fn()
        .mockReturnValueOnce(Promise.resolve(PASSWORD_RESET_PIN))
      userService.getUserCredentialByEmail = jest.fn().mockReturnValueOnce(user)
    })

    it('pin is valid', async () => {
      userService.createJwtToken = jest.fn().mockReturnValueOnce('jwt')
      const jwt = await userService.verifyPinAndIssueJwtTokenForPasswordReset({
        pin: PASSWORD_RESET_PIN,
        email: EMAIL_ADDRESS
      })
      expect(jwt).toEqual('jwt')
    })

    it('pin is invalid', async () => {
      userService.getPinFromCache = jest
        .fn()
        .mockReturnValueOnce('reset_token_invalid')
        .mockReturnValueOnce(null)

      expect(async () => {
        await userService.verifyPinAndIssueJwtTokenForPasswordReset({
          pin: PASSWORD_RESET_PIN,
          email: EMAIL_ADDRESS
        })
      }).rejects.toThrowError(InvalidPinException)

      expect(async () => {
        await userService.verifyPinAndIssueJwtTokenForPasswordReset({
          pin: PASSWORD_RESET_PIN,
          email: EMAIL_ADDRESS
        })
      }).rejects.toThrowError(InvalidPinException)
    })

    it('check if deleteToken function is called', async () => {
      const deleteTokenSpy = jest.spyOn(userService, 'deletePinFromCache')
      await userService.updatePassword(requestIncludingUser, {
        newPassword: NEW_PASSWORD
      })
      expect(deleteTokenSpy).toHaveBeenCalledTimes(1)
      expect(deleteTokenSpy.mock.calls[0][0]).toBe(
        passwordResetPinCacheKey(EMAIL_ADDRESS)
      )
    })

    it('check if updatePasswordInPrisma function is called', async () => {
      const updatePasswordInPrismaSpy = jest.spyOn(
        userService,
        'updateUserPasswordInPrisma'
      )
      await userService.updatePassword(requestIncludingUser, {
        newPassword: NEW_PASSWORD
      })
      expect(updatePasswordInPrismaSpy).toHaveBeenCalledTimes(1)
      expect(updatePasswordInPrismaSpy.mock.calls[0][0]).toBe(USER_ID)
      expect(updatePasswordInPrismaSpy.mock.calls[0][1]).toBe(NEW_PASSWORD)
    })
  })
})
