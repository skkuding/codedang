import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Inject, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService, type JwtVerifyOptions } from '@nestjs/jwt'
import type { User, UserProfile } from '@prisma/client'
import { hash } from 'argon2'
import { Cache } from 'cache-manager'
import { randomInt } from 'crypto'
import type { Request } from 'express'
import { generate } from 'generate-password'
import { ExtractJwt } from 'passport-jwt'
import { type AuthenticatedRequest, JwtAuthService } from '@libs/auth'
import { emailAuthenticationPinCacheKey } from '@libs/cache'
import { EMAIL_AUTH_EXPIRE_TIME } from '@libs/constants'
import {
  ConflictFoundException,
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

  async getUserCredentialByEmail(email: string) {
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

    const payload: EmailAuthJwtPayload = { email }
    const token = await this.createJwt(payload)

    return token
  }

  async verifyPin(pin: string, email: string): Promise<boolean> | never {
    const storedResetPin = await this.getPinFromCache(
      emailAuthenticationPinCacheKey(email)
    )

    if (!storedResetPin || pin !== storedResetPin) {
      throw new UnidentifiedException(`pin ${pin}`)
    }
    return true
  }

  async getPinFromCache(key: string) {
    const storedPin = await this.cacheManager.get<string>(key)
    return storedPin
  }

  async deletePinFromCache(key: string) {
    await this.cacheManager.del(key)
  }

  async createJwt(payload: EmailAuthJwtPayload) {
    return await this.jwtService.signAsync(payload, {
      expiresIn: EMAIL_AUTH_EXPIRE_TIME
    })
  }

  async signUp(req: Request, signUpDto: SignUpDto) {
    const { email } = await this.verifyJwtFromRequestHeader(req)
    if (email != signUpDto.email) {
      throw new UnprocessableDataException('The email is not authenticated one')
    }

    const duplicatedUser = await this.prisma.user.findUnique({
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
      throw new DuplicateFoundException('Username')
    }

    if (!this.isValidUsername(socialSignUpDto.username)) {
      throw new UnprocessableDataException('Bad username')
    }

    const user = await this.createUser({
      username: socialSignUpDto.username,
      password: generate({ length: 10, numbers: true }),
      realName: socialSignUpDto.realName,
      email: socialSignUpDto.email
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
    const encryptedPassword = await hash(signUpDto.password)

    return await this.prisma.user.create({
      data: {
        username: signUpDto.username,
        password: encryptedPassword,
        email: signUpDto.email
      }
    })
  }

  async createUserOAuth(socialSignUpDto: SocialSignUpDto, userId: number) {
    return await this.prisma.userOAuth.create({
      data: {
        id: socialSignUpDto.id,
        userId,
        provider: socialSignUpDto.provider
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

  async deleteUser(username: string, password: string) {
    const user = await this.getUserCredential(username)
    if (!(user && (await this.jwtAuthService.isValidUser(user, password)))) {
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
    await this.prisma.user.delete({
      where: {
        username
      }
    })
  }

  async getUserCredential(username: string) {
    return await this.prisma.user.findUnique({
      where: { username }
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

    await this.deletePinFromCache(emailAuthenticationPinCacheKey(email))

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

  async updateUserProfile(
    userId: number,
    updateUserProfileDto: UpdateUserProfileDto
  ): Promise<UserProfile> {
    await this.prisma.userProfile.findUniqueOrThrow({
      where: { userId }
    })

    return await this.prisma.userProfile.update({
      where: { userId },
      data: {
        realName: updateUserProfileDto.realName
      }
    })
  }

  async checkDuplicatedUsername(usernameDto: UsernameDto) {
    const duplicatedUser = await this.prisma.user.findUnique({
      where: {
        username: usernameDto.username
      }
    })

    if (duplicatedUser) {
      throw new DuplicateFoundException('user')
    }
  }
}
