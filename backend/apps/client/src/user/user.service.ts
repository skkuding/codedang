import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Inject, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService, type JwtVerifyOptions } from '@nestjs/jwt'
import type { User, UserProfile } from '@prisma/client'
import { hash } from 'argon2'
import { Cache } from 'cache-manager'
import { randomInt } from 'crypto'
import type { Request } from 'express'
import { ExtractJwt } from 'passport-jwt'
import { type AuthenticatedRequest, JwtAuthService } from '@libs/auth'
import { emailAuthenticationPinCacheKey } from '@libs/cache'
import { EMAIL_AUTH_EXPIRE_TIME } from '@libs/constants'
import {
  DuplicateFoundException,
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
import type { UpdateUserEmailDto } from './dto/update-user-email.dto'
import type { UpdateUserProfileRealNameDto } from './dto/update-userprofile-realname.dto'
import type { UserEmailDto } from './dto/userEmail.dto'
import type { WithdrawalDto } from './dto/withdrawal.dto'
import type { CreateUserProfileData } from './interface/create-userprofile.interface'
import type {
  EmailAuthJwtPayload,
  EmailAuthJwtObject
} from './interface/jwt.interface'

@Injectable()
export class UserService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,

    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly groupService: GroupService,
    private readonly jwtAuthService: JwtAuthService
  ) {}

  async updateLastLogin(username: string) {
    await this.prisma.user.update({
      where: { username },
      data: { lastLogin: new Date() }
    })
  }

  async sendPinForRegisterNewEmail({ email }: UserEmailDto): Promise<string> {
    const duplicatedUser = await this.getUserCredentialByEmail(email)
    if (duplicatedUser) {
      throw new DuplicateFoundException('Email')
    }

    return this.createPinAndSendEmail(email)
  }

  async sendPinForPasswordReset({ email }: UserEmailDto): Promise<string> {
    const user = await this.getUserCredentialByEmail(email)
    if (!user) {
      throw new UnidentifiedException(`email ${email}`)
    }

    return this.createPinAndSendEmail(user.email)
  }

  async getUserCredentialByEmail(email: string): Promise<User> {
    return await this.prisma.user.findUnique({
      where: { email }
    })
  }

  async createPinAndSendEmail(email: string): Promise<string> {
    const pin = this.createPinRandomly(6)

    await this.emailService.sendEmailAuthenticationPin(email, pin)

    await this.cacheManager.set(
      emailAuthenticationPinCacheKey(email),
      pin,
      1000 * EMAIL_AUTH_EXPIRE_TIME
    )

    return 'Email authentication pin is sent to your email address'
  }

  createPinRandomly(numberOfDigits: number): string {
    return randomInt(0, Number('1'.padEnd(numberOfDigits + 1, '0')))
      .toString()
      .padStart(numberOfDigits, '0')
  }

  async updatePassword(
    { newPassword }: NewPasswordDto,
    req: Request
  ): Promise<string> {
    if (!this.isValidPassword(newPassword)) {
      throw new UnprocessableDataException('Bad password')
    }

    const { email } = await this.verifyJwtFromRequestHeader(req)
    await this.updateUserPasswordInPrisma(email, newPassword)

    return 'Password Reset successfully'
  }

  async verifyJwtFromRequestHeader(
    req: Request,
    jwtVerifyOptions: JwtVerifyOptions = {}
  ): Promise<EmailAuthJwtObject> {
    const token = ExtractJwt.fromHeader('email-auth')(req)
    const options = {
      secret: this.config.get('JWT_SECRET'),
      ...jwtVerifyOptions
    }
    try {
      return await this.jwtService.verifyAsync(token, options)
    } catch (error) {
      throw new InvalidJwtTokenException(error.message)
    }
  }

  async updateUserPasswordInPrisma(
    email: string,
    newPassword: string
  ): Promise<User> {
    return await this.prisma.user.update({
      where: {
        email
      },
      data: {
        password: await hash(newPassword)
      }
    })
  }

  async verifyPinAndIssueJwt({
    pin,
    email
  }: EmailAuthenticationPinDto): Promise<string> {
    await this.verifyPin(pin, email)
    await this.deletePinFromCache(emailAuthenticationPinCacheKey(email))

    const payload: EmailAuthJwtPayload = { email }
    const token = await this.createJwt(payload)

    return token
  }

  async verifyPin(pin: string, email: string): Promise<boolean> | never {
    const storedResetPin: string = await this.getPinFromCache(
      emailAuthenticationPinCacheKey(email)
    )

    if (!storedResetPin || pin !== storedResetPin) {
      throw new UnidentifiedException(`pin ${pin}`)
    }
    return true
  }

  async getPinFromCache(key: string): Promise<string> {
    const storedPin: string = await this.cacheManager.get(key)
    return storedPin
  }

  async deletePinFromCache(key: string): Promise<void> {
    await this.cacheManager.del(key)
  }

  async createJwt(payload: EmailAuthJwtPayload): Promise<string> {
    return await this.jwtService.signAsync(payload, {
      expiresIn: EMAIL_AUTH_EXPIRE_TIME
    })
  }

  async signUp(req: Request, signUpDto: SignUpDto): Promise<User> {
    const { email } = await this.verifyJwtFromRequestHeader(req)
    if (email != signUpDto.email) {
      throw new UnprocessableDataException('The email is not authenticated one')
    }

    const duplicatedUser: User = await this.prisma.user.findUnique({
      where: {
        username: signUpDto.username
      }
    })
    if (duplicatedUser) {
      throw new DuplicateFoundException('Username')
    }

    if (!this.isValidUsername(signUpDto.username)) {
      throw new UnprocessableDataException('Bad username')
    } else if (!this.isValidPassword(signUpDto.password)) {
      throw new UnprocessableDataException('Bad password')
    }

    const user: User = await this.createUser(signUpDto)
    const CreateUserProfileData: CreateUserProfileData = {
      userId: user.id,
      realName: signUpDto.realName
    }
    await this.createUserProfile(CreateUserProfileData)
    await this.registerUserToPublicGroup(user.id)

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
    const encryptedPassword = await hash(signUpDto.password)

    return await this.prisma.user.create({
      data: {
        username: signUpDto.username,
        password: encryptedPassword,
        email: signUpDto.email
      }
    })
  }

  async createUserProfile(
    createUserProfileData: CreateUserProfileData
  ): Promise<UserProfile> {
    return await this.prisma.userProfile.create({
      data: {
        realName: createUserProfileData.realName,
        user: {
          connect: { id: createUserProfileData.userId }
        }
      }
    })
  }

  async registerUserToPublicGroup(userId: number) {
    const userGroupData: UserGroupData = {
      userId,
      groupId: 1,
      isGroupLeader: false
    }
    await this.groupService.createUserGroup(userGroupData)
  }

  async withdrawal(username: string, withdrawalDto: WithdrawalDto) {
    const user: User = await this.getUserCredential(username)

    if (
      !(await this.jwtAuthService.isValidUser(user, withdrawalDto.password))
    ) {
      throw new UnidentifiedException('password')
    }

    await this.deleteUser(username)
  }

  async getUserCredential(username: string): Promise<User> {
    return await this.prisma.user.findUnique({
      where: { username }
    })
  }

  async deleteUser(username: string) {
    await this.prisma.user.findUniqueOrThrow({
      where: {
        username
      }
    })

    await this.prisma.user.delete({
      where: {
        username
      }
    })
  }

  async getUserProfile(username: string) {
    return await this.prisma.user.findUniqueOrThrow({
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
  }

  async updateUserEmail(
    req: AuthenticatedRequest,
    updateUserEmailDto: UpdateUserEmailDto
  ): Promise<User> {
    const { email } = await this.verifyJwtFromRequestHeader(req)
    if (email != updateUserEmailDto.email) {
      throw new UnprocessableDataException('The email is not authenticated one')
    }

    await this.prisma.user.findUniqueOrThrow({
      where: { id: req.user.id }
    })

    return await this.prisma.user.update({
      where: { id: req.user.id },
      data: {
        email: updateUserEmailDto.email
      }
    })
  }

  async updateUserProfileRealName(
    userId: number,
    updateUserProfileRealNameDto: UpdateUserProfileRealNameDto
  ): Promise<UserProfile> {
    await this.prisma.userProfile.findUniqueOrThrow({
      where: { userId }
    })

    return await this.prisma.userProfile.update({
      where: { userId },
      data: {
        realName: updateUserProfileRealNameDto.realName
      }
    })
  }
}
