import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Inject, Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService, type JwtVerifyOptions } from '@nestjs/jwt'
import type { User, UserProfile } from '@prisma/client'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import { hash } from 'argon2'
import { Cache } from 'cache-manager'
import { randomInt } from 'crypto'
import type { Request } from 'express'
import { generate } from 'generate-password'
import { ExtractJwt } from 'passport-jwt'
import { type AuthenticatedRequest, JwtAuthService } from '@libs/auth'
import { emailAuthenticationPinCacheKey } from '@libs/cache'
import { EMAIL_AUTH_EXPIRE_TIME, ARGON2_HASH_OPTION } from '@libs/constants'
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
import type { UserGroupData } from '@client/group/interface/user-group-data.interface'
import type { EmailAuthenticationPinDto } from './dto/email-auth-pin.dto'
import type { NewPasswordDto } from './dto/newPassword.dto'
import type { SignUpDto } from './dto/signup.dto'
import type { SocialSignUpDto } from './dto/social-signup.dto'
import type { UpdateUserEmailDto } from './dto/update-user-email.dto'
import type { UpdateUserProfileDto } from './dto/update-userprofile.dto'
import type { UserEmailDto } from './dto/userEmail.dto'
import type { UsernameDto } from './dto/username.dto'
import type { CreateUserProfileData } from './interface/create-userprofile.interface'
import type {
  EmailAuthJwtPayload,
  EmailAuthJwtObject
} from './interface/jwt.interface'

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name)

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,

    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly groupService: GroupService,
    private readonly jwtAuthService: JwtAuthService
  ) {}

  async getUsernameByEmail({ email }: UserEmailDto) {
    const username = await this.prisma.user.findUnique({
      where: {
        email
      },
      select: {
        username: true
      }
    })
    if (!username) {
      throw new EntityNotExistException('User')
    }

    this.logger.debug(username, 'getUsernameByEmail')
    return username
  }

  async updateLastLogin(username: string) {
    const user = await this.prisma.user.update({
      where: { username },
      data: { lastLogin: new Date() }
    })
    this.logger.debug(user, 'updateLastLogin')
  }

  async sendPinForRegisterNewEmail({ email }: UserEmailDto): Promise<string> {
    const duplicatedUser = await this.getUserCredentialByEmail(email)
    if (duplicatedUser) {
      this.logger.debug('email duplicated')
      throw new DuplicateFoundException('Email')
    }

    return this.createPinAndSendEmail(email)
  }

  async sendPinForPasswordReset({ email }: UserEmailDto): Promise<string> {
    const user = await this.getUserCredentialByEmail(email)
    if (!user) {
      this.logger.debug('no registered email')
      throw new UnidentifiedException(`email ${email}`)
    }

    return this.createPinAndSendEmail(user.email)
  }

  async getUserCredentialByEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email }
    })
    this.logger.debug(user, 'getUserCredentialByEmail')
    return user
  }

  async createPinAndSendEmail(email: string): Promise<string> {
    const pin = this.createPinRandomly(6)

    await this.emailService.sendEmailAuthenticationPin(email, pin)

    await this.setPinInCache(
      emailAuthenticationPinCacheKey(email),
      pin,
      1000 * EMAIL_AUTH_EXPIRE_TIME
    )

    return 'Email authentication pin is sent to your email address'
  }

  createPinRandomly(numberOfDigits: number): string {
    const pin = randomInt(0, Number('1'.padEnd(numberOfDigits + 1, '0')))
      .toString()
      .padStart(numberOfDigits, '0')
    this.logger.debug({ pin }, 'createPinRandomly')
    return pin
  }

  async updatePassword(
    { newPassword }: NewPasswordDto,
    req: Request
  ): Promise<string> {
    if (!this.isValidPassword(newPassword)) {
      throw new UnprocessableDataException('Bad password')
    }

    const { email } = await this.verifyJwtFromRequestHeader(req)
    await this.deletePinFromCache(emailAuthenticationPinCacheKey(email))
    await this.updateUserPasswordInPrisma(email, newPassword)

    return 'Password Reset successfully'
  }

  async verifyJwtFromRequestHeader(
    req: Request,
    jwtVerifyOptions: JwtVerifyOptions = {}
  ): Promise<EmailAuthJwtObject> {
    const token = ExtractJwt.fromHeader('email-auth')(req) ?? ''
    const options = {
      secret: this.config.get('JWT_SECRET'),
      ...jwtVerifyOptions
    }
    try {
      const decodedJwtObject = await this.jwtService.verifyAsync(token, options)
      this.logger.debug(
        {
          token,
          verifyOption: options,
          decodedJwtObject
        },
        'verifyJwtFromRequestHeader - pass'
      )
      return decodedJwtObject
    } catch (error) {
      this.logger.debug(
        {
          token,
          verifyOption: options
        },
        'verifyJwtFromRequestHeader - fail'
      )
      throw new InvalidJwtTokenException(error.message)
    }
  }

  async updateUserPasswordInPrisma(
    email: string,
    newPassword: string
  ): Promise<User> {
    try {
      const user = await this.prisma.user.update({
        where: {
          email
        },
        data: {
          password: await hash(newPassword, ARGON2_HASH_OPTION)
        }
      })
      this.logger.debug(user, 'updateUserPasswordInPrisma')

      return user
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code == 'P2025'
      )
        throw new EntityNotExistException('User')
      throw error
    }
  }

  async verifyPinAndIssueJwt({
    pin,
    email
  }: EmailAuthenticationPinDto): Promise<string> {
    await this.verifyPin(pin, email)

    const payload: EmailAuthJwtPayload = { email }
    const token = await this.createJwt(payload)

    return token
  }

  async verifyPin(pin: string, email: string): Promise<boolean> | never {
    const storedResetPin = await this.getPinFromCache(
      emailAuthenticationPinCacheKey(email)
    )

    if (!storedResetPin || pin !== storedResetPin) {
      this.logger.debug(
        {
          inputPin: pin,
          storedPin: storedResetPin
        },
        'verifyPin - input is different from stored one'
      )
      throw new UnidentifiedException(`pin ${pin}`)
    }
    return true
  }

  async getPinFromCache(key: string) {
    const storedPin = await this.cacheManager.get<string>(key)
    this.logger.debug({ key, value: storedPin }, 'getPinFromCache')
    return storedPin
  }

  async deletePinFromCache(key: string) {
    await this.cacheManager.del(key)
    this.logger.debug({ key }, 'deletePinFromCache')
  }

  async setPinInCache(key: string, value: string, ttl: number) {
    await this.cacheManager.set(key, value, ttl)
    this.logger.debug({ key, value, ttl }, 'setPinInCache')
  }

  async createJwt(payload: EmailAuthJwtPayload) {
    const jwt = await this.jwtService.signAsync(payload, {
      expiresIn: EMAIL_AUTH_EXPIRE_TIME
    })
    this.logger.debug({ jwt }, 'createJwt')
    return jwt
  }

  async signUp(req: Request, signUpDto: SignUpDto) {
    const { email } = await this.verifyJwtFromRequestHeader(req)
    if (email != signUpDto.email) {
      this.logger.debug(
        {
          verifiedEmail: email,
          requestedEmail: signUpDto.email
        },
        'signUp - fail (unauthenticated email)'
      )
      throw new UnprocessableDataException('The email is not authenticated one')
    }

    const duplicatedUser = await this.prisma.user.findUnique({
      where: {
        username: signUpDto.username
      }
    })
    if (duplicatedUser) {
      this.logger.debug('username duplicated')
      throw new DuplicateFoundException('Username')
    }

    if (!this.isValidUsername(signUpDto.username)) {
      this.logger.debug('signUp - fail (invalid username)')
      throw new UnprocessableDataException('Bad username')
    } else if (!this.isValidPassword(signUpDto.password)) {
      this.logger.debug('signUp - fail (invalid password)')
      throw new UnprocessableDataException('Bad password')
    }

    await this.deletePinFromCache(emailAuthenticationPinCacheKey(email))

    const user: User = await this.createUser(signUpDto)
    const CreateUserProfileData: CreateUserProfileData = {
      userId: user.id,
      realName: signUpDto.realName
    }
    await this.createUserProfile(CreateUserProfileData)
    await this.registerUserToPublicGroup(user.id)

    return user
  }

  async socialSignUp(socialSignUpDto: SocialSignUpDto): Promise<User> {
    const duplicatedUser = await this.prisma.user.findUnique({
      where: {
        username: socialSignUpDto.username
      }
    })
    if (duplicatedUser) {
      this.logger.debug('socialSignUp - fail (username duplicated)')
      throw new DuplicateFoundException('Username')
    }

    if (!this.isValidUsername(socialSignUpDto.username)) {
      this.logger.debug('socialSignUp - fail (invalid username)')
      throw new UnprocessableDataException('Bad username')
    }

    const user = await this.createUser({
      username: socialSignUpDto.username,
      password: generate({ length: 10, numbers: true }),
      realName: socialSignUpDto.realName,
      email: socialSignUpDto.email,
      studentID: 'defaultStudentID',
      major: 'defaultMajor'
    })
    const profile: CreateUserProfileData = {
      userId: user.id,
      realName: socialSignUpDto.realName
    }

    await this.createUserProfile(profile)
    await this.registerUserToPublicGroup(user.id)
    await this.createUserOAuth(socialSignUpDto, user.id)

    return user
  }

  isValidUsername(username: string): boolean {
    const validUsername = /^[a-z0-9]{3,10}$/
    if (!validUsername.test(username)) {
      return false
    }
    return true
  }

  isValidPassword(password: string): boolean {
    const invalidPassword = /^(.{0,7}|[a-z]*|[A-Z]*|[0-9]*|[^a-zA-Z0-9]*)$/
    if (invalidPassword.test(password)) {
      return false
    }
    return true
  }

  async createUser(signUpDto: SignUpDto): Promise<User> {
    const encryptedPassword = await hash(signUpDto.password, ARGON2_HASH_OPTION)

    const user = await this.prisma.user.create({
      data: {
        username: signUpDto.username,
        password: encryptedPassword,
        email: signUpDto.email,
        studentID: signUpDto.studentID,
        major: signUpDto.major
      }
    })
    this.logger.debug(user, 'createUser')
    return user
  }

  async createUserOAuth(socialSignUpDto: SocialSignUpDto, userId: number) {
    const userOAuth = await this.prisma.userOAuth.create({
      data: {
        id: socialSignUpDto.id,
        userId,
        provider: socialSignUpDto.provider
      }
    })
    this.logger.debug(userOAuth, 'createUserOAuth')
    return userOAuth
  }

  async createUserProfile(
    createUserProfileData: CreateUserProfileData
  ): Promise<UserProfile> {
    const userProfile = await this.prisma.userProfile.create({
      data: {
        realName: createUserProfileData.realName,
        user: {
          connect: { id: createUserProfileData.userId }
        }
      }
    })
    this.logger.debug(userProfile, 'createUserProfile')
    return userProfile
  }

  async registerUserToPublicGroup(userId: number) {
    const userGroupData: UserGroupData = {
      userId,
      groupId: 1,
      isGroupLeader: false
    }
    await this.groupService.createUserGroup(userGroupData)
  }

  async deleteUser(username: string, password: string) {
    const user = await this.getUserCredential(username)
    if (!(user && (await this.jwtAuthService.isValidUser(user, password)))) {
      this.logger.debug('user not exist or login fail')
      throw new UnidentifiedException('password')
    }

    const leadingGroups = await this.prisma.userGroup.findMany({
      where: {
        userId: user.id,
        isGroupLeader: true
      },
      select: {
        groupId: true
      }
    })
    this.logger.debug(
      { leadingGroups, userId: user.id },
      'UserGroups where this user is the group leader'
    )

    if (leadingGroups.length) {
      const ledByOne = (
        await this.prisma.userGroup.groupBy({
          by: ['groupId'],
          where: {
            groupId: {
              in: leadingGroups.map((group) => group.groupId)
            },
            isGroupLeader: true
          },
          // eslint-disable-next-line @typescript-eslint/naming-convention
          _count: {
            userId: true
          }
        })
      ).filter((group) => group._count.userId === 1)
      this.logger.debug(ledByOne, 'Groups where the only leader is you')

      if (ledByOne.length) {
        const groupNames = (
          await this.prisma.group.findMany({
            where: {
              id: {
                in: ledByOne.map((group) => group.groupId)
              }
            },
            select: {
              groupName: true
            }
          })
        )
          .map((group) => group.groupName)
          .join(', ')
        throw new ConflictFoundException(
          `Cannot delete this account since you are the only leader of group ${groupNames}`
        )
      }
    }
    const deletedUser = await this.prisma.user.delete({
      where: {
        username
      }
    })
    this.logger.debug(deletedUser, 'deleted user')
  }

  async getUserCredential(username: string) {
    const user = await this.prisma.user.findUnique({
      where: { username }
    })
    if (!user) {
      throw new EntityNotExistException('User')
    }
    this.logger.debug(user, 'getUserCredential')
    return user
  }

  async getUserProfile(username: string) {
    const userWithProfile = await this.prisma.user.findUnique({
      where: { username },
      select: {
        username: true,
        role: true,
        email: true,
        lastLogin: true,
        updateTime: true,
        userProfile: {
          select: {
            realName: true
          }
        }
      }
    })
    if (!userWithProfile) {
      throw new EntityNotExistException('User')
    }
    this.logger.debug(userWithProfile, 'getUserProfile')
    return userWithProfile
  }

  async updateUserEmail(
    req: AuthenticatedRequest,
    updateUserEmailDto: UpdateUserEmailDto
  ): Promise<User> {
    const { email } = await this.verifyJwtFromRequestHeader(req)
    if (email != updateUserEmailDto.email) {
      this.logger.debug(
        {
          verifiedEmail: email,
          requestedEmail: updateUserEmailDto.email
        },
        'updateUserEmail - fail (different from the verified email)'
      )
      throw new UnprocessableDataException('The email is not authenticated one')
    }

    await this.deletePinFromCache(emailAuthenticationPinCacheKey(email))

    try {
      const user = await this.prisma.user.update({
        where: { id: req.user.id },
        data: {
          email: updateUserEmailDto.email
        }
      })
      this.logger.debug(user, 'updateUserEmail')
      return user
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code == 'P2025'
      )
        throw new EntityNotExistException('user')
      throw error
    }
  }

  async updateUserProfile(
    userId: number,
    updateUserProfileDto: UpdateUserProfileDto
  ): Promise<UserProfile> {
    try {
      const userProfile = await this.prisma.userProfile.update({
        where: { userId },
        data: {
          realName: updateUserProfileDto.realName
        }
      })
      this.logger.debug(userProfile, 'updateUserProfile')
      return userProfile
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code == 'P2025'
      )
        throw new EntityNotExistException('UserProfile')
      throw error
    }
  }

  async checkDuplicatedUsername(usernameDto: UsernameDto) {
    const duplicatedUser = await this.prisma.user.findUnique({
      where: {
        username: usernameDto.username
      }
    })

    if (duplicatedUser) {
      this.logger.debug('exception (username duplicated)')
      throw new DuplicateFoundException('user')
    }
  }
}
